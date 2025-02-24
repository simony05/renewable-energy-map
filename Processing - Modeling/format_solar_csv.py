import pandas as pd
import os
import solar_climate_data
import asyncio

# Get Lattitude and Longitude from the csv file name:
# Data Type_Latitude_Longitude_Weather Year_PV Type_CapacityMW_Time Interval _Min.csv
def getLatLongMax(filename: str) -> tuple[float, float, float]:
    name_split = filename.split('_')
    lat = float(name_split[1])
    long = float(name_split[2])
    capacity = name_split[5]
    if (capacity[-2:] == "MW"):
        capacity = float(capacity[:-2])
    else:
        raise ValueError(f"Capacity {capacity} not in MW for file: {filename}")
    if (name_split[6] != "5" or name_split[7] != "Min.csv"):
        raise ValueError(f"Time interval not 5 minutes for file: {filename}")
    return (lat, long, capacity)

# Combine 5 minute intervals into 1 day intervals
# 105120 5-minute interval observations in year, 8760 per month
months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
def monthlyMeans(file_name: str) -> list[tuple[str, float]]:
    df = pd.read_csv(file_name)
    power_values = df.iloc[:, 1]
    month_means = [
        power_values[8760*i:(8760*(i+1))].mean() 
        for i in range(12)
    ]
    return [(months[i], float(month_means[i])) for i in range(12)]    

def format_power()->pd.DataFrame:
    base_dir = "./states/"
    states = os.listdir(base_dir)
    total_df= pd.DataFrame(columns=["Latitude", "Longitude", "Month", "Mean Power Proportion"])

    for state in states:
        print(f"Compressing data for {state}")
        state_dir = base_dir + state + "/"
        state_files = os.listdir(state_dir)
        for file in state_files:
            lat, long, capacity = getLatLongMax(file)
            monthly_means = monthlyMeans(state_dir + file)
            
            state_data = pd.DataFrame(
                {
                 "Latitude": [lat]*12,
                 "Longitude": [long]*12,
                 "Month": [month for month, _ in monthly_means],
                 "Mean Power Proportion": [mean_power/capacity for _, mean_power in monthly_means]
                }
            )
            total_df = pd.concat([total_df, state_data], ignore_index=True)
    
    return total_df

def format_climate(unformatted_df)->pd.DataFrame:
    unformatted_df.drop_duplicates(inplace=True)

    total_df = unformatted_df.rename(columns={'T2M':'Temp', 'ALLSKY_SFC_SW_DWN': 'SW_DWN', 'ALLSKY_SFC_LW_DWN': 'LW_DWN', 'ALLSKY_SFC_SW_DIFF': 'SW_DIFF', 
                            'CLOUD_AMT': 'Cloud', 'ALLSKY_SFC_SW_DNI': 'SW_DNI', 'ALLSKY_KT': 'Clearness', 'RH2M': 'Humidity', 
                            'PRECTOTCORR': 'Precipitation'})
    total_df['Month'] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'extra'] * 388
    total_df = total_df[total_df.Month != 'extra']
    total_df = total_df.drop('Date', axis=1)

    return total_df

def combine_power_climate(power_df: pd.DataFrame, climate_df: pd.DataFrame)->pd.DataFrame:
    merged_df = pd.merge(power_df, climate_df, on=["Latitude", "Longitude", "Month"], how="right")
    return merged_df

def get_latlong_pairs(dataframe: pd.DataFrame, dropDuplicates: bool = True)->list[tuple[float, float]]: 
    pairs = [(lat, long) for lat, long in zip(dataframe["Latitude"], dataframe["Longitude"])]
    if not dropDuplicates:
        return pairs
    return list(set(pairs))

if __name__ == "__main__":
    if os.path.exists("formatted_solar_power.csv"):
        power_df = pd.read_json("formatted_solar_power.csv")
    else:
        power_df = format_power()
        power_df.to_csv("formatted_solar_power.csv")

    climate_df = format_climate(asyncio.run(solar_climate_data.fetch_solar_climate(
                            get_latlong_pairs(power_df), "formatted_solar_power.csv", "solar_climate_data.csv")))

    final_solar_df = combine_power_climate(power_df, climate_df)
    final_solar_df.to_csv("formatted_solar_data.csv", index=False)