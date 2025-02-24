import asyncio
from aiohttp import ClientSession
from api_helpers import save_progress, load_progress, fetch_climate_data
import pandas as pd
import os
import time

# API Params
frequency = "monthly"
climate_parameters = [
    "ALLSKY_SFC_SW_DWN", # All Sky Surface Shortwave Downward Irradiance
    "ALLSKY_SFC_LW_DWN",  # All Sky Surface Longwave Downward Irradiance
    "ALLSKY_SFC_SW_DIFF", # All Sky Surface Shortwave Diffuse Irradiance
    "ALLSKY_SFC_SW_DNI", # All Sky Surface Shortwave Downward Direct Normal Irradiance
    "CLOUD_AMT", # Cloud Amount
    "ALLSKY_KT", # All Sky Insolation Clearness Index
    "RH2M", # Relative Humidity at 2 Meters
    "PRECTOTCORR", # Precipitation Corrected
    "T2M" # Temperature at 2 Meters
]
start_date = "2006"
end_date = "2006"

async def fetch_solar_climate(locations: list[tuple[float, float]], input_csv_file: str, output_csv_file: str) -> pd.DataFrame:
    if os.path.exists(input_csv_file):
        print("Loading previous climate data")
        result_df = pd.read_csv(input_csv_file) 
    else:
        result_df = pd.DataFrame(columns=["Latitude", "Longitude"] + climate_parameters)
    result_df = pd.DataFrame(columns=["Latitude","Longitude","Date"]+climate_parameters)
    
    batch_size = 100
    last_completed_batch = load_progress("progress_solar.json")
    total_batches = (len(locations) + batch_size - 1) // batch_size

    async with ClientSession() as session:
        for batch_index in range(last_completed_batch + 1, total_batches):  # Resume from last completed batch
            start = batch_index * batch_size
            end = min(start + batch_size, len(locations))
            
            for (lat, long), response in await fetch_climate_data(session, locations[start:end], 
                                                                  climate_parameters, start_date, end_date, frequency):
                # API Call Error, likely ratelimit or server timeout
                # Retry in 5min, calling get_data again starts from last saved progress
                if response["Status"] != 200:
                    print(f"API Call  for ({lat}, {long}) failed with Status Code {response["Status"]}, {response["Reason"]}")
                    print("Retrying in 3 minutes\n")
                    time.sleep(180)
                    return await fetch_solar_climate(locations, output_csv_file, output_csv_file)
                
                # Dates formatted 2006xx where xx from 01 to 13 (13 meaning year avg)
                df_dict = {"Latitude": [lat]*13, "Longitude": [long]*13, "Date": ["2006"+str(i).zfill(2) for i in range(1, 14)]}

                for parameter in response["properties"]["parameter"]:
                    df_dict[parameter] = [value for value in response["properties"]["parameter"][parameter].values()]
                
                result_df = pd.concat([result_df, pd.DataFrame.from_dict(df_dict)], ignore_index=True)
            
            # Save progress after completing the batch
            save_progress("progress_solar.json", batch_index)
            result_df.to_csv(output_csv_file, index=False)
            print(f"Completed batch {batch_index+1}/{total_batches}")
    print("Fetched all solar climate data")
    return result_df

if __name__=="__main__":
    # Testing code
    locations = [(32.55, -117.05), (32.65, -115.15), (32.65, -116.15), (32.65, -116.85), (32.65, -116.95), (32.65, -117.05), (32.65, -117.15)]
    print("Fetching test climate data")
    df = asyncio.run(fetch_solar_climate(locations, "test_solar.csv", "test_solar.csv"))
    df.to_csv("test_solar_climate.csv", index=False)