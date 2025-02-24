import pandas as pd
from format_solar_csv import get_latlong_pairs
from api_helpers import load_progress, save_progress, fetch_climate_data
import asyncio
from aiohttp import ClientSession
import xgboost as xgb
import os
import time

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
start_date = "2023"
end_date = "2023"

async def fetch_X_climate(locations: list[tuple[float, float]]) -> pd.DataFrame:
    input_csv_file = "prediction_climate_data.csv"
    progress_file = "progress_prediction.json"
    if os.path.exists(input_csv_file):
        print("Loading previous climate data")
        result_df = pd.read_csv(input_csv_file) 
    else:
        result_df = pd.DataFrame(columns=["Latitude", "Longitude", "Date"] + climate_parameters)
    
    batch_size = 100
    last_completed_batch = load_progress(progress_file)
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
                    return await fetch_X_climate(locations)
                df_dict = {"Latitude": [lat], "Longitude": [long]}

                for parameter in response["properties"]["parameter"]:
                    values = list(response["properties"]["parameter"][parameter].values())
                    df_dict[parameter] = [values[12]]
                
                result_df = pd.concat([result_df, pd.DataFrame.from_dict(df_dict)], ignore_index=True)
            result_df.to_csv(input_csv_file, index=False)
            save_progress(progress_file, batch_index)
            print(f"Batch {batch_index + 1}/{total_batches} completed")
    return result_df

async def predict_solar(pairs: list[tuple[float, float]]) -> list[float]:
    solar_counties_df = await fetch_X_climate(pairs)
    solar_counties_df = solar_counties_df.rename(columns={
        'T2M': 'Temp',
        'ALLSKY_SFC_SW_DWN': 'SW_DWN',
        'ALLSKY_SFC_LW_DWN': 'LW_DWN',
        'ALLSKY_SFC_SW_DIFF': 'SW_DIFF',
        'ALLSKY_SFC_SW_DNI': 'SW_DNI',
        'CLOUD_AMT': 'Cloud',
        'ALLSKY_KT': 'Clearness',
        'RH2M': 'Humidity',
        'PRECTOTCORR': 'Precipitation'
    })
    loaded_model = xgb.XGBRegressor()
    loaded_model.load_model("solar_model.json")
    X = pd.DataFrame(solar_counties_df)
    # Reorder to match model input
    X = X[loaded_model.get_booster().feature_names]
    preds = loaded_model.predict(X)
    return [float(pred) for pred in preds]

if __name__=="__main__":
    # Get predictions for counties
    us_counties = pd.read_csv("us_coords.csv")
    pairs = get_latlong_pairs(us_counties)
    us_counties["Prediction"] = asyncio.run(predict_solar(pairs))
    us_counties.to_csv("solar_predictions.csv", index=False)
    
