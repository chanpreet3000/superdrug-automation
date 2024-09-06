import asyncio


async def delay(ms):
    await asyncio.sleep(ms / 1000)
