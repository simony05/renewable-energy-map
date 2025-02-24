import asyncio
from aiohttp import ClientSession
from asyncio_throttle import Throttler # type: ignore
import json
import os
import pandas as pd

# Limit API Call speed to avoid rate limit(no specific rate limit, but may be considered abuse eventually)
throttler = Throttler(rate_limit=10, period=1)
async def api_call(session: ClientSession, url: str, params=None) -> dict:
    try:
        async with throttler:
            async with session.get(url, params=params) as resp:
                # Preserve data in return, but also include info about success/failure
                if resp.status==200:
                    respJSON = await resp.json()
                    respJSON["Status"] = 200
                    return respJSON
                else:
                    return {"Status": resp.status, "Reason": resp.reason}
    except Exception as error:
        return {"Status": type(error).__name__ , "Reason": "Error connecting to API"}

# Save/Load progress in case of interruption for many batches
def save_progress(filename: str, batch_index: int) -> None:
    with open(filename, "w") as f:
        json.dump({"last_completed_batch": batch_index}, f)
def load_progress(filename: str) -> int:
    if os.path.exists(filename):
        with open(filename, "r") as f:
            return json.load(f).get("last_completed_batch", -1)
    return -1  # Default to -1 if no progress file exists

async def fetch_climate_data(session: ClientSession, locations: list[tuple[float, float]], climate_params: list[str], date_start:str,date_end:str, 
                             frequency:str): #-> zip[tuple[tuple[float, float], dict]]:
    result_df = pd.DataFrame(columns=["Latitude","Longitude","Date"] + climate_params)
    tasks = []

    base_url = f"https://power.larc.nasa.gov/api/temporal/{frequency}/point"
    params = {
        "format": "JSON",
        "community": "RE",
        "parameters": ",".join(climate_params),
        "start": date_start,
        "end": date_end
        # latitude
        # longitude
    }

    for lat, long in locations:
        tasks.append(
            asyncio.create_task(api_call(session, base_url, {**params, "latitude": lat, "longitude": long}))
        )

    responses: list[dict] = await asyncio.gather(*tasks)
    return zip(locations, responses)