## Fix
Replace the literal NVIDIA host string in both test files with a dynamically constructed needle so the source guard stays green while still asserting no real NVIDIA references exist. No behaviour change to source modules.
