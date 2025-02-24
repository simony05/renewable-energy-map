import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_squared_error, r2_score

def create_model(data: pd.DataFrame, print_stats: bool = False, model_output: str | None = None):
    X = data.drop(columns=["Month", "Mean Power Proportion"])
    y = data["Mean Power Proportion"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    xgb_model = xgb.XGBRegressor(objective="reg:logistic", random_state=42)

    param_grid = {
        "n_estimators": [50, 100, 150],
        "max_depth": [3, 4, 5],
        "learning_rate": [0.1, 0.2, 0.3]
    }
    # Grid Search for best Hyperparameters
    grid_search = GridSearchCV(estimator=xgb_model, param_grid=param_grid, cv=3, n_jobs=-1, verbose=2)
    grid_search.fit(X_train, y_train)

    final_model = grid_search.best_estimator_

    if print_stats:
        best_params = grid_search.best_params_
        print(best_params) 

        y_pred = final_model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        print(f"MSE for Squared Error: {mse}")

        r2 = r2_score(y_test, y_pred)
        print(f"R2 Score: {r2}")
    
    if model_output is not None:
        final_model.save_model(model_output)

if __name__=="__main__":
    create_model(pd.read_csv("formatted_solar_data.csv"), print_stats=True, model_output="solar_model.json")