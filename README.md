#SOLPower
The transition to renewable energy is one of the most pressing challenges of our time. As a team, we were inspired by the potential of AI and data science to drive meaningful change in this space. We wanted to create a tool that could help policymakers and energy companies identify the best locations for solar energy infrastructure, ultimately contributing to a greener and more sustainable future.  While many similar projects provide some interesting insights, we wanted to ensure that our project was genuinely actionable.

Our project aligns with the **AI for Social Good** track, as it demonstrates how technology can be used to address real-world environmental challenges. By leveraging publicly available data and machine learning, we aimed to make renewable energy planning more accessible and data-driven.  

## What it does
Our project is a web-based dashboard aimed at interactive learning and simplicity. The map covers the United States, colored using a heat-map based on power output, and displays the counties in each state. Users can click on specific counties to see our ML model’s estimate of solar panel efficiency/capacity factor in that county. A Groq-powered chatbot gives users the ability to gain additional insights into the location, including community/location based factors outside of the climate information that our model considers which might make installing new solar power more attractive or difficult.

## How we built it
Our frontend is built using React.js, and connects to our machine learning model through our Flash Backend. The data was pulled from the National Renewable Energy Laboratory studies on solar integration as well as the NASA POWER API. We processed and cleaned the raw data using Python before training an AI model with Scikit Learn and XGBoost. After considering various models, we used a cross-validation grid search to find the best hyperparameters for an XGBoost regression model.

## Challenges we faced
While we faced various challenges throughout the process, one of the largest ones was limitations in the time and computational power available to us. We considered some data sources, such as the National Solar Radiation Database, which potentially offered additional and higher quality data, but were unable to use them due to needing to download terrabytes of data or spend multiple days straight making API calls.

## What's next for SOLPower
In the future, we would want to use more computation to get more accurate predictions in each location in the United States. Additionally, we could create models for other forms of clean energy, including wind turbine farms and offshore renewable energy farms, or even nuclear plants. Ideally, we envision the SOLPower as a tool that government agencies or energy companies could use to quickly estimate the suitability of various locations for installing renewable energy, alongside other factors such as energy demand or cost. From there, they could conduct deeper study and simulation in order to most efficiently use existing resources to build a cleaner future. 
