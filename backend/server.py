from flask import Flask, request, jsonify
import pandas as pd
import xgboost as xgb
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the pre-trained XGBoost model (adjust path if needed)
model = xgb.XGBRegressor()  # Or XGBRegressor, depending on your task
model.load_model("solar_model.json")  # Load your saved model

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         # Get the JSON data from the request
#         data = request.get_json()
        
#         # Convert the JSON data into a Pandas DataFrame
#         df = pd.DataFrame(data['parameters'])  # Assuming 'parameters' is the key
        
#         # Select the relevant features (ensure column names match your model's expected input)
#         X = df[['Temp', 'SW_DWN', 'LW_DWN', 'SW_DIFF', 'SW_DNI', 'Cloud', 'Clearness', 'Humidity', 'Precipitation']]
        
#         # Make prediction using the XGBoost model
#         prediction = model.predict(X)
        
#         # Return the prediction in the response
#         return jsonify({'prediction': prediction.tolist()})  # Convert prediction to list for JSON serialization
    
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the JSON array from the request
        data = request.get_json()  # data is now an array
        
        # Convert the array into a Pandas DataFrame with column names
        # Ensure the correct order of the features as expected by the model
        feature_names = ['Temp', 'SW_DWN', 'LW_DWN', 'SW_DIFF', 'SW_DNI', 'Cloud', 'Clearness', 'Humidity', 'Precipitation']
        df = pd.DataFrame([data], columns=feature_names)
        
        # Make prediction using the XGBoost model
        prediction = model.predict(df)
        
        # Return the prediction in the response
        return jsonify({'prediction': prediction.tolist()})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)