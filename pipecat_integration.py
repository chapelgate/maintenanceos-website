"""Pipecat local VAD and turn detection integration for MaintenanceOS.

This module provides local voice activity detection (Silero ONNX) and
end-of-turn detection (Smart Turn v3 ONNX) using Pipecat's bundled models.
Runs entirely offline, no cloud API costs.

Behind feature flag: ENABLE_PIPECAT_VAD_TURN (default: false)
"""

import os
import asyncio
import logging
from typing import Optional
from dataclasses import dataclass

import numpy as np

from pipecat.audio.vad.silero import SileroVADAnalyzer, VADParams
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3

logger = logging.getLogger(__name__)


@dataclass
class PipecatVADTurnConfig:
    """Configuration for Pipecat VAD and turn detection."""
    # VAD params (matching VADParams in pipecat-ai 1.13.0)
    vad_confidence: float = 0.6
    vad_start_secs: float = 0.2
    vad_stop_secs: float = 0.2
    vad_min_volume: float = 0.4
    
    # Turn detection params
    smart_turn_cpu_count: int = 1
    smart_turn_min_audio_seconds: float = 0.5
    
    # Audio params
    input_sample_rate: int = 8000  # μ-law from Twilio
    model_sample_rate: int = 16000  # Silero/Smart Turn expect 16kHz


def pipecat_vad_turn_enabled() -> bool:
    """Check if Pipecat VAD/turn detection is enabled via feature flag."""
    return os.getenv("ENABLE_PIPECAT_VAD_TURN", "false").strip().lower() == "true"


class PipecatVADTurnProcessor:
    """Processes audio through Pipecat's local VAD and turn detection.
    
    Converts incoming μ-law 8kHz audio to 16kHz int16 for Pipecat models.
    Produces VAD state and turn completion predictions.
    """
    
    def __init__(self, config: Optional[PipecatVADTurnConfig] = None):
        self.config = config or PipecatVADTurnConfig()
        self._vad: Optional[SileroVADAnalyzer] = None
        self._turn_analyzer: Optional[LocalSmartTurnAnalyzerV3] = None
        self._sample_buffer: np.ndarray = np.array([], dtype=np.int16)  # 16kHz int16
        self._initialized = False
        
    def initialize(self) -> None:
        """Initialize Pipecat models (called once on first use)."""
        if self._initialized:
            return
            
        logger.info("Initializing Pipecat Silero VAD and Smart Turn v3...")
        
        # VAD analyzer with custom params
        vad_params = VADParams(
            confidence=self.config.vad_confidence,
            start_secs=self.config.vad_start_secs,
            stop_secs=self.config.vad_stop_secs,
            min_volume=self.config.vad_min_volume,
        )
        self._vad = SileroVADAnalyzer(
            sample_rate=self.config.model_sample_rate,
            params=vad_params
        )
        # Must call set_sample_rate to actually set the rate
        self._vad.set_sample_rate(self.config.model_sample_rate)
        
        # Smart Turn analyzer
        self._turn_analyzer = LocalSmartTurnAnalyzerV3(
            cpu_count=self.config.smart_turn_cpu_count
        )
        
        self._initialized = True
        logger.info("Pipecat VAD and Turn detection initialized")
    
    def _mulaw_to_int16_16khz(self, mulaw_bytes: bytes) -> np.ndarray:
        """Convert μ-law bytes to int16 PCM at 16kHz."""
        # μ-law decode to linear PCM (8kHz, int16)
        mulaw = np.frombuffer(mulaw_bytes, dtype=np.uint8)
        pcm_int16 = self._mulaw_decode(mulaw)
        
        # Upsample 2x (8kHz -> 16kHz) using simple repeat
        # For production, use soxr for higher quality
        pcm_16k = np.repeat(pcm_int16, 2)
        
        return pcm_16k
    
    def _mulaw_decode(self, mulaw: np.ndarray) -> np.ndarray:
        """Decode μ-law to linear PCM (int16)."""
        # μ-law decoding (ITU-T G.711) — use float64 for power to avoid overflow
        mu = 255.0
        mulaw = mulaw.astype(np.float64)
        sign = np.where(mulaw >= 128, -1.0, 1.0)
        magnitude = np.where(mulaw >= 128, 255 - mulaw, mulaw)
        pcm = sign * (1.0 / mu) * (np.power(1.0 + mu, magnitude) - 1.0)
        return np.clip(pcm * 32767, -32768, 32767).astype(np.int16)
    
    def process_audio_chunk(self, mulaw_bytes: bytes) -> dict:
        """Process a chunk of μ-law audio and return VAD/turn results."""
        if not self._initialized:
            self.initialize()
        
        # Convert μ-law 8kHz -> int16 16kHz
        audio_16k = self._mulaw_to_int16_16khz(mulaw_bytes)
        
        # Add to sample buffer for turn detection
        self._sample_buffer = np.concatenate([self._sample_buffer, audio_16k])
        
        # Process through VAD (needs exact frame size: 512 samples at 16kHz = 32ms)
        frame_size = self._vad.num_frames_required()
        
        results = {
            "vad_confidence": 0.0,
            "vad_state": "QUIET",
            "turn_prediction": None,
            "turn_probability": 0.0,
        }
        
        # Process complete frames through VAD
        while len(self._sample_buffer) >= frame_size:
            frame = self._sample_buffer[:frame_size]
            self._sample_buffer = self._sample_buffer[frame_size:]
            
            # VAD analysis - expects int16 bytes
            frame_bytes = frame.tobytes()
            confidence = self._vad.voice_confidence(frame_bytes)
            # voice_confidence may return a numpy array (0-d or scalar)
            conf_value = confidence.item() if hasattr(confidence, "item") else float(confidence)
            results["vad_confidence"] = conf_value
            results["vad_state"] = "SPEAKING" if confidence > self.config.vad_confidence else "QUIET"
        
        # Turn detection - analyze when we have enough audio
        min_samples = int(self.config.smart_turn_min_audio_seconds * self.config.model_sample_rate)
        if len(self._sample_buffer) >= min_samples:
            # Smart Turn analyzes last 8 seconds
            max_samples = 8 * self.config.model_sample_rate
            if len(self._sample_buffer) > max_samples:
                analysis_audio = self._sample_buffer[-max_samples:].astype(np.float32) / 32768.0
            else:
                analysis_audio = self._sample_buffer.astype(np.float32) / 32768.0
            
            turn_result = self._turn_analyzer._predict_endpoint(analysis_audio)
            results["turn_prediction"] = "COMPLETE" if turn_result["prediction"] == 1 else "INCOMPLETE"
            results["turn_probability"] = float(turn_result["probability"])
        
        return results
    
    def reset(self) -> None:
        """Reset internal state for new call/session."""
        if self._vad:
            self._vad._model.reset_states()
            self._vad._windows_since_reset = 0
            self._vad._low_confidence_windows = 0
        self._sample_buffer = np.array([], dtype=np.int16)


class PipecatVADTurnBridge:
    """Bridge between MaintenanceOS voice flow and Pipecat VAD/turn detection.
    
    Can be used in two modes:
    1. Standalone: direct calls to process_audio_chunk()
    2. Pipeline: integrated with Pipecat Pipeline (future extension)
    """
    
    def __init__(self):
        self._processor: Optional[PipecatVADTurnProcessor] = None
        self._enabled = pipecat_vad_turn_enabled()
    
    @property
    def enabled(self) -> bool:
        return self._enabled
    
    def get_processor(self) -> Optional[PipecatVADTurnProcessor]:
        """Get or create the processor instance."""
        if not self._enabled:
            return None
        if self._processor is None:
            self._processor = PipecatVADTurnProcessor()
        return self._processor
    
    def process_audio(self, mulaw_bytes: bytes) -> Optional[dict]:
        """Process audio through VAD and turn detection if enabled."""
        processor = self.get_processor()
        if processor is None:
            return None
        return processor.process_audio_chunk(mulaw_bytes)
    
    def reset(self) -> None:
        """Reset processor state."""
        if self._processor:
            self._processor.reset()


# Global bridge instance
_vad_turn_bridge: Optional[PipecatVADTurnBridge] = None


def get_vad_turn_bridge() -> PipecatVADTurnBridge:
    """Get the global VAD/turn bridge instance."""
    global _vad_turn_bridge
    if _vad_turn_bridge is None:
        _vad_turn_bridge = PipecatVADTurnBridge()
    return _vad_turn_bridge


def pipecat_vad_turn_ready() -> bool:
    """Check if Pipecat VAD/turn is available and enabled."""
    return pipecat_vad_turn_enabled()