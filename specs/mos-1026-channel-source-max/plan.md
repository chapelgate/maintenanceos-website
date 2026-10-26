# Plan
1. Add CHANNEL_SOURCE_MAX = 30 to channels.py.
2. Reject overlong source in create_from_channel with ValueError before SessionLocal opens.
3. Run the three named tests.
