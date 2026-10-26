"""Benchmark Pipecat VAD/Turn integration in MaintenanceOS context."""
import os
import time
import statistics
import numpy as np
import sys
sys.path.insert(0, '/root/jobs-work/rea-build-pipecat/repo/maintenanceos-v1-pilot')

os.environ["ENABLE_PIPECAT_VAD_TURN"] = "true"

from pipecat_integration import PipecatVADTurnConfig, PipecatVADTurnProcessor, pipecat_vad_turn_enabled


def generate_mulaw_noise(samples=256, amplitude=0.3):
    """Generate synthetic μ-law noise (8kHz)."""
    noise = np.random.randn(samples) * amplitude
    mu = 255.0
    mulaw = np.sign(noise) * np.log(1 + mu * np.abs(noise)) / np.log(1 + mu)
    mulaw = ((mulaw + 1) / 2 * 255).astype(np.uint8)
    return mulaw.tobytes()


def run_vad_benchmark():
    """Benchmark VAD inference latency per 32ms window."""
    config = PipecatVADTurnConfig()
    processor = PipecatVADTurnProcessor(config)
    processor.initialize()
    
    latencies = []
    for _ in range(120):  # n=120 like original benchmark
        audio = generate_mulaw_noise()
        start = time.perf_counter()
        result = processor.process_audio_chunk(audio)
        elapsed = (time.perf_counter() - start) * 1000
        latencies.append(elapsed)
    
    return {
        "p50": statistics.median(latencies),
        "p95": float(np.percentile(latencies, 95)),
        "min": min(latencies),
        "max": max(latencies),
        "mean": statistics.mean(latencies),
        "n": 120
    }


def run_turn_benchmark():
    """Benchmark turn detection per 1s window."""
    config = PipecatVADTurnConfig()
    processor = PipecatVADTurnProcessor(config)
    processor.initialize()
    
    latencies = []
    # Each "call" accumulates 32 chunks (1s at 8kHz, 32ms/chunk)
    for run in range(40):  # n=40 like original benchmark
        # First, feed 32 chunks (1s of audio)
        for _ in range(32):
            audio = generate_mulaw_noise()
            processor.process_audio_chunk(audio)
        
        start = time.perf_counter()
        # Now process one more chunk which should trigger turn analysis
        audio = generate_mulaw_noise()
        result = processor.process_audio_chunk(audio)
        elapsed = (time.perf_counter() - start) * 1000
        latencies.append(elapsed)
    
    return {
        "p50": statistics.median(latencies),
        "p95": float(np.percentile(latencies, 95)),
        "min": min(latencies),
        "max": max(latencies),
        "mean": statistics.mean(latencies),
        "n": 40
    }


def main():
    print("=" * 60)
    print("Pipecat VAD/Turn Integration Benchmark (MaintenanceOS)")
    print("=" * 60)
    print(f"Feature flag enabled: {pipecat_vad_turn_enabled()}")
    print()
    
    # Run benchmarks 3 times as required by task.md
    print("Running VAD latency benchmark (n=120 per run, 3 runs)...")
    vad_results = []
    for i in range(3):
        r = run_vad_benchmark()
        vad_results.append(r)
        print(f"  Run {i+1}: p50={r['p50']:.3f}ms, p95={r['p95']:.3f}ms")
    
    all_vad_p50 = [r['p50'] for r in vad_results]
    all_vad_p95 = [r['p95'] for r in vad_results]
    vad_agg = {
        "p50": statistics.median(all_vad_p50),
        "p95": statistics.median(all_vad_p95),
        "min": min(r['min'] for r in vad_results),
        "max": max(r['max'] for r in vad_results),
        "runs": 3
    }
    
    print("\nRunning Turn detection latency benchmark (n=40 per run, 3 runs)...")
    turn_results = []
    for i in range(3):
        r = run_turn_benchmark()
        turn_results.append(r)
        print(f"  Run {i+1}: p50={r['p50']:.3f}ms, p95={r['p95']:.3f}ms")
    
    all_turn_p50 = [r['p50'] for r in turn_results]
    all_turn_p95 = [r['p95'] for r in turn_results]
    turn_agg = {
        "p50": statistics.median(all_turn_p50),
        "p95": statistics.median(all_turn_p95),
        "min": min(r['min'] for r in turn_results),
        "max": max(r['max'] for r in turn_results),
        "runs": 3
    }
    
    print("\n" + "=" * 60)
    print("AGGREGATED RESULTS (n>=3 runs)")
    print("=" * 60)
    print(f"Silero VAD p50 latency: {vad_agg['p50']:.3f} ms (p95: {vad_agg['p95']:.3f} ms, n={vad_agg['runs']} runs x 120)")
    print(f"Smart Turn p50 latency: {turn_agg['p50']:.3f} ms (p95: {turn_agg['p95']:.3f} ms, n={turn_agg['runs']} runs x 40)")
    print()
    
    # Comparison with original benchmarks
    print("Comparison with original pipecat-rea benchmarks:")
    print(f"  Original VAD p50: 0.36 ms")
    print(f"  New measurement p50: {vad_agg['p50']:.3f} ms")
    print(f"  Ratio: {vad_agg['p50']/0.36:.2f}x")
    print(f"  Original Turn p50: 298.754 ms per 1s window")
    print(f"  (Our measure is per-chunk not per-1s-window, direct comparison limited)")
    print()
    
    print("LIMITATIONS:")
    print("  - Synthetic Gaussian noise only (no real speech)")
    print("  - WER NOT measured")
    print("  - No real-speech applicability claimed")
    print("  - OpenAI server_vad (current product) requires API key - not directly comparable")
    print("=" * 60)
    
    return {
        "vad": vad_agg,
        "turn": turn_agg,
        "limitations": ["synthetic_noise_only", "wer_not_measured", "no_real_speech"]
    }


if __name__ == "__main__":
    results = main()
