import asyncio
from aiohttp import ClientSession
from asyncio_throttle import Throttler # type: ignore
import pandas as pd
import json
import os
import time

# Limit API Call speed to avoid rate limit(no specific rate limit, but may be considered abuse eventually)
throttler = Throttler(rate_limit=5, period=1)
async def api_call(session, url, params=None) -> dict:
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
        return{"Status": type(error).__name__, "Reason": f"Error connecting to API: {error}"}

# Save/Load progress in case of interruption for many batches
def save_progress(batch_index, filename="progress_wind.json"):
    with open(filename, "w") as f:
        json.dump({"last_completed_batch": batch_index}, f)
def load_progress(filename="progress_wind.json"):
    if os.path.exists(filename):
        with open(filename, "r") as f:
            return json.load(f).get("last_completed_batch", -1)
    return -1  # Default to -1 if no progress file exists

# Base URL for the POWER API
frequency = "monthly"
base_url = f"https://power.larc.nasa.gov/api/temporal/{frequency}/point"
climate_parameters = [
    "PS", # Surface Pressure
    "WS50M", # Wind Speed at 50 Meters
    "Z0M", # Surface Roughness
    "T10M", # Temperature at 10 Meters
]
params = {
    "format": "JSON",
    "community": "RE",
    "parameters": ",".join(climate_parameters),
    "start": "2007",
    "end": "2013"
    # latitude
    # longitude
}

async def fetch_climate_data(locations: list[tuple[float, float]]) -> pd.DataFrame:
    if os.path.exists("base_wind_climate.csv"):
        print("Loading previous wind climate data")
        result_df = pd.read_csv("base_wind_climate.csv") 
    else:
        result_df = pd.DataFrame(columns=["Latitude", "Longitude"] + climate_parameters)
    
    batch_size = 100
    last_completed_batch = load_progress()
    total_batches = (len(locations) + batch_size - 1) // batch_size

    async with ClientSession() as session:
        for batch_index in range(last_completed_batch + 1, total_batches):  # Resume from last completed batch
            batch_tasks = []
            start = batch_index * batch_size
            end = min(start + batch_size, len(locations))

            for lat, long in locations[start:end]:
                batch_tasks.append(
                    asyncio.create_task(api_call(session, base_url, {**params, "latitude": lat, "longitude": long}))
                )

            responses = await asyncio.gather(*batch_tasks)

            for (lat, long), response in zip(locations[start:end], responses):
                # API Call Error, likely ratelimit or server timeout
                # Retry in 5min, calling get_data again starts from last saved progress
                if response["Status"] != 200:
                    print(f"API Call  for ({lat}, {long}) failed with Status Code {response["Status"]}, {response["Reason"]}")
                    print("Retrying in 3 minutes\n")
                    time.sleep(180)
                    return await fetch_climate_data(locations)

                # Dates formatted 2006xx where xx from 01 to 13 (13 meaning year avg)
                df_dict = {"Latitude": [lat], "Longitude": [long]}

                for parameter in response["properties"]["parameter"]:
                    values = list(response["properties"]["parameter"][parameter].values())
                    df_dict[parameter] = [sum([values[i*13-1] for i in range(1, 8)])/7] # Average of 2007-2013, 13th month is year

                result_df = pd.concat([result_df, pd.DataFrame.from_dict(df_dict)], ignore_index=True)

            # Save progress after completing the batch
            save_progress(batch_index)
            result_df.to_csv("base_wind_climate.csv", index=False)
            print(f"Completed batch {batch_index+1}/{total_batches}")
    print("Fetched all wind climate data")
    return result_df

if __name__=="__main__":
    # Testing code
    locations = [(25.896492, -97.460358), (26.032654, -97.738098), (41.316925, -100.466644)]
    print("Fetching climate test data")
    df = asyncio.run(fetch_climate_data(locations))
    df.to_csv("test_wind_climate.csv", index=False)