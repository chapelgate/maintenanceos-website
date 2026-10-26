"""Pipecat Pipeline/graph integration for MaintenanceOS voice flow.

Builds a Pipecat Pipeline (Pipeline + FrameProcessor graph + PipelineTask
session lifecycle) that routes audio frames through Silero VAD and Smart Turn
v3 turn detection, then emits transcription/control frames downstream.

This module is isolated: nothing is wired into the product by default. It is
behind feature flag ENABLE_PIPECAT_PIPELINE (default off), so the product
keeps its current FastAPI media-stream path unchanged.

Meant for benchmarking against the current product path on synthetic audio.
Runs entirely offline, local ONNX models only, no cloud API cost.
"""

import os
import asyncio
import logging
from dataclasses import dataclass, field
from typing import Optional, Callable, Awaitable, Any

import numpy as np

from pipecat.pipeline.pipeline import Pipeline, PipelineSource, PipelineSink
from pipecat.pipeline.task import PipelineTask
from pipecat.processors.frame_processor import FrameProcessor, FrameDirection
from pipecat.frames.frames import (
    AudioRawFrame,
    InputAudioRawFrame,
    OutputAudioRawFrame,
    TextFrame,
    TranscriptionFrame,
    StartFrame,
    EndFrame,
    BotStartedSpeakingFrame,
    BotStoppedSpeakingFrame,
    UserStartedSpeakingFrame,
    UserStoppedSpeakingFrame,
    InterruptionFrame,
    UninterruptibleFrame,
    CancelFrame,
    ErrorFrame,
)
from pipecat.audio.vad.silero import SileroVADAnalyzer, VADParams
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3

logger = logging.getLogger(__name__)


def pipecat_pipeline_enabled() -> bool:
    """Check if the Pipecat Pipeline integration is enabled."""
    return os.getenv("ENABLE_PIPECAT_PIPELINE", "false").strip().lower() == "true"


@dataclass
class PipecatPipelineConfig:
    """Configuration for the Pipecat Pipeline integration."""
    vad_confidence: float = 0.6
    vad_start_secs: float = 0.2
    vad_stop_secs: float = 0.2
    vad_min_volume: float = 0.4

    smart_turn_cpu_count: int = 1
    smart_turn_min_audio_seconds: float = 0.5

    input_sample_rate: int = 8000  # mu-law from Twilio
    model_sample_rate: int = 16000  # Silero/Smart Turn expect 16kHz

    output_sample_rate: int = 24000
    num_channels: int = 1


class _VADProcessor(FrameProcessor):
    """FrameProcessor that runs Silero VAD on audio frames and emits VAD state frames."""

    def __init__(self, config: PipecatPipelineConfig, **kwargs):
        super().__init__(**kwargs)
        self.config = config
        self._vad: Optional[SileroVADAnalyzer] = None
        self._buffer: np.ndarray = np.array([], dtype=np.int16)
        self._speaking: bool = False

    async def _start(self, frame: StartFrame):
        await super()._start(frame)
        vad_params = VADParams(
            confidence=self.config.vad_confidence,
            start_secs=self.config.vad_start_secs,
            stop_secs=self.config.vad_stop_secs,
            min_volume=self.config.vad_min_volume,
        )
        self._vad = SileroVADAnalyzer(sample_rate=self.config.model_sample_rate, params=vad_params)
        self._vad.set_sample_rate(self.config.model_sample_rate)

    async def _stop(self, frame: EndFrame):
        await super()._stop(frame)
        self._vad = None
        self._buffer = np.array([], dtype=np.int16)

    def _mulaw_to_int16_16khz(self, mulaw_bytes: bytes) -> np.ndarray:
        mulaw = np.frombuffer(mulaw_bytes, dtype=np.uint8).astype(np.float64)
        mu = 255.0
        sign = np.where(mulaw >= 128, -1.0, 1.0)
        magnitude = np.where(mulaw >= 128, 255 - mulaw, mulaw)
        pcm = sign * (1.0 / mu) * (np.power(1.0 + mu, magnitude) - 1.0)
        pcm = np.clip(pcm * 32767, -32768, 32767).astype(np.int16)
        return np.repeat(pcm, 2)

    async def _process_frame(self, frame: Any, direction: FrameDirection):
        await self.push_frame(frame, direction)

        if not isinstance(frame, InputAudioRawFrame):
            return

        if self._vad is None:
            return

        audio_16k = self._mulaw_to_int16_16khz(frame.audio)
        self._buffer = np.concatenate([self._buffer, audio_16k])

        frame_size = self._vad.num_frames_required()
        while len(self._buffer) >= frame_size:
            frame_audio = self._buffer[:frame_size]
            self._buffer = self._buffer[frame_size:]
            confidence = self._vad.voice_confidence(frame_audio.tobytes())
            conf_value = confidence.item() if hasattr(confidence, "item") else float(confidence)
            speaking = conf_value > self.config.vad_confidence
            if speaking != self._speaking:
                self._speaking = speaking
                if speaking:
                    await self.push_frame(UserStartedSpeakingFrame(), FrameDirection.DOWNSTREAM)
                else:
                    await self.push_frame(UserStoppedSpeakingFrame(), FrameDirection.DOWNSTREAM)


class _TurnProcessor(FrameProcessor):
    """FrameProcessor that runs Smart Turn v3 end-of-turn detection on buffered audio."""

    def __init__(self, config: PipecatPipelineConfig, **kwargs):
        super().__init__(**kwargs)
        self.config = config
        self._turn_analyzer: Optional[LocalSmartTurnAnalyzerV3] = None
        self._buffer: np.ndarray = np.array([], dtype=np.int16)
        self._turn_complete: bool = False

    async def _start(self, frame: StartFrame):
        await super()._start(frame)
        self._turn_analyzer = LocalSmartTurnAnalyzerV3(
            cpu_count=self.config.smart_turn_cpu_count
        )

    async def _stop(self, frame: EndFrame):
        await super()._stop(frame)
        self._turn_analyzer = None
        self._buffer = np.array([], dtype=np.int16)

    async def _process_frame(self, frame: Any, direction: FrameDirection):
        await self.push_frame(frame, direction)

        if not isinstance(frame, InputAudioRawFrame):
            return

        if self._turn_analyzer is None:
            return

        mulaw = np.frombuffer(frame.audio, dtype=np.uint8).astype(np.float64)
        mu = 255.0
        sign = np.where(mulaw >= 128, -1.0, 1.0)
        magnitude = np.where(mulaw >= 128, 255 - mulaw, mulaw)
        pcm = sign * (1.0 / mu) * (np.power(1.0 + mu, magnitude) - 1.0)
        pcm_8k = np.clip(pcm * 32767, -32768, 32767).astype(np.int16)
        pcm_16k = np.repeat(pcm_8k, 2)

        self._buffer = np.concatenate([self._buffer, pcm_16k])

        min_samples = int(self.config.smart_turn_min_audio_seconds * self.config.model_sample_rate)
        max_samples = 8 * self.config.model_sample_rate
        if len(self._buffer) < min_samples:
            return

        analysis_audio = self._buffer[-max_samples:].astype(np.float32) / 32768.0
        self._buffer = np.array([], dtype=np.int16)

        try:
            result = self._turn_analyzer._predict_endpoint(analysis_audio)
        except Exception as exc:
            logger.warning("Smart Turn analysis failed: %s", exc)
            return

        complete = bool(result.get("prediction", 0)) == 1
        if complete != self._turn_complete:
            self._turn_complete = complete
            if complete:
                await self.push_frame(
                    TranscriptionFrame(
                        text="[turn-complete]",
                        user_id="maintenanceos-caller",
                        timestamp="",
                        finalized=True,
                    ),
                    FrameDirection.DOWNSTREAM,
                )


class PipecatPipeline:
    """Assembles and runs a Pipecat Pipeline for MaintenanceOS voice.

    Graph:
        Source (audio in) -> VAD Processor -> Turn Processor -> Sink (frames out)

    Runs behind feature flag ENABLE_PIPECAT_PIPELINE (default off). Nothing is
    wired into the product path by default.
    """

    def __init__(self, config: Optional[PipecatPipelineConfig] = None):
        self.config = config or PipecatPipelineConfig()
        self._pipeline: Optional[Pipeline] = None
        self._task: Optional[PipelineTask] = None
        self._source: Optional[PipelineSource] = None
        self._sink: Optional[PipelineSink] = None
        self._frame_callback: Optional[Callable[[Any], Awaitable[None]]] = None
        self._started: bool = False

    @property
    def enabled(self) -> bool:
        return pipecat_pipeline_enabled()

    def set_frame_callback(self, callback: Callable[[Any], Awaitable[None]]) -> None:
        """Register an async callback to receive downstream frames from the sink."""
        self._frame_callback = callback

    async def start(self) -> None:
        """Start the Pipecat Pipeline task (lazily builds the graph)."""
        if not self.enabled:
            raise RuntimeError("Pipecat Pipeline is disabled (ENABLE_PIPECAT_PIPELINE=false)")
        if self._started:
            return

        self._source = PipelineSource(upstream_push_frame=self._on_source_frame)
        self._sink = PipelineSink(downstream_push_frame=self._on_sink_frame)

        processors = [
            self._source,
            _VADProcessor(config=self.config, name="silero-vad"),
            _TurnProcessor(config=self.config, name="smart-turn-v3"),
            self._sink,
        ]

        self._pipeline = Pipeline(processors=processors)
        self._task = PipelineTask(
            pipeline=self._pipeline,
            name="maintenanceos-voice-pipeline",
            enable_turn_tracking=True,
        )

        await self._task.setup()
        await self._task.start()
        self._started = True
        logger.info("Pipecat Pipeline started (graph: source -> VAD -> Turn -> sink)")

    async def _on_source_frame(self, frame: Any, direction: FrameDirection):
        """Called by the PipelineSource when upstream pushes a frame into the graph."""
        # Source just echoes the frame downstream into the pipeline graph.
        pass

    async def _on_sink_frame(self, frame: Any, direction: FrameDirection):
        """Called by the PipelineSink when the graph emits a downstream frame."""
        if self._frame_callback:
            await self._frame_callback(frame)

    async def push_audio(self, audio_bytes: bytes, sample_rate: int = 8000) -> None:
        """Push an audio frame into the pipeline source (upstream)."""
        if not self._started or self._source is None:
            return
        frame = InputAudioRawFrame(audio=audio_bytes, sample_rate=sample_rate, num_channels=self.config.num_channels)
        await self._source.upstream_push_frame(frame, FrameDirection.DOWNSTREAM)

    async def push_text(self, text: str) -> None:
        """Push a text frame into the pipeline source (upstream)."""
        if not self._started or self._source is None:
            return
        frame = TextFrame(text=text)
        await self._source.upstream_push_frame(frame, FrameDirection.DOWNSTREAM)

    async def stop(self) -> None:
        """Stop and clean up the Pipeline task."""
        if not self._started:
            return
        if self._task:
            await self._task.cancel()
        self._started = False
        self._task = None
        self._pipeline = None
        self._source = None
        self._sink = None
        logger.info("Pipecat Pipeline stopped")

    async def __aenter__(self):
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.stop()


# Global pipeline instance (lazy, singleton)
_pipeline_instance: Optional[PipecatPipeline] = None


def get_pipecat_pipeline() -> Optional[PipecatPipeline]:
    """Get or create the global Pipecat Pipeline instance."""
    if not pipecat_pipeline_enabled():
        return None
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = PipecatPipeline()
    return _pipeline_instance


def pipecat_pipeline_ready() -> bool:
    """Check if the Pipecat Pipeline integration is available and enabled."""
    return pipecat_pipeline_enabled()
