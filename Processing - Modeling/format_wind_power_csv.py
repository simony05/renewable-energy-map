import pandas as pd
import asyncio
import wind_climate_data
from format_solar_csv import get_latlong_pairs
import os

def format_power()->pd.DataFrame:
    wind_df = pd.read_csv("base_wind_power.csv")
    wind_df = wind_df.drop(columns=["site_id", "County", "fraction_of_usable_area", "capacity", "full_timeseries_directory", "full_timeseries_path"])

    wind_df = wind_df.rename(columns={"latitude": "Latitude", "longitude": "Longitude", "wind_speed": "Wind Speed",
                                    "capacity_factor": "Capacity Factor"})

    wind_df = wind_df[wind_df.power_curve != "offshore"]
    return wind_df

if __name__=="__main__":
    if os.path.exists("formatted_wind_power.csv"):
        formatted_wind_df = pd.read_csv("formatted_wind_power.csv")
    else:
        formatted_wind_df = format_power()
        formatted_wind_df.to_csv("formatted_wind_power.csv")
    print("Beginning to fetch data")
    # Removoe duplicate lat/long
    pairs = list(set(get_latlong_pairs(formatted_wind_df)))
    df = asyncio.run(wind_climate_data.fetch_climate_data(pairs))