// // import { useState, useEffect } from "react";


// // const NASA_api = ( {longitude, latitude} ) => {
// //   const [data, setData] = useState(null);
// //   const [error, setError] = useState(null);
// //   const [prediction, setPrediction] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   const yesterday = new Date();
// //   yesterday.setDate(yesterday.getDate() - 356);

// //   const yyyy = yesterday.getFullYear();
// //   const mm = String(yesterday.getMonth() + 1).padStart(2, "0"); // Months are 0-based
// //   const dd = String(yesterday.getDate()).padStart(2, "0");
// //   const date = `${yyyy}${mm}${dd}`;
// //   // console.log(date);

// //   const fetchData = async () => {
// //     try {
// //       const response = await fetch(`https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,ALLSKY_SFC_SW_DWN,ALLSKY_SFC_LW_DWN,ALLSKY_SFC_SW_DIFF,ALLSKY_SFC_SW_DNI,CLOUD_AMT,ALLSKY_KT,RH2M,ALLSKY_SRF_ALB,PRECTOTCORR&community=RE&longitude=${longitude}&latitude=${latitude}&start=${date}&end=${date}&format=JSON`);
// //       if (!response.ok) throw new Error("Failed to fetch");
// //       const result = await response.json();
// //       setData(result);
// //       setLoading(false);
// //     } catch (err) {
// //       setError(err.message);
// //       setLoading(false);
// //     }
// //   };
// //   const fetchPrediction = async () => {
// //     try{
// //       console.log('Data sent to backend:', data);
// //       const backend = await fetch('http://127.0.0.1:5000/predict', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json'
// //         },body: JSON.stringify({ parameters: data }) // Send the data here
// //       });
// //       const result = await backend.json();
// //       console.log("Prediction result:", result);
// //       setPrediction(result.prediction);  // Display the prediction result from the backend
// //     } catch (error) {
// //       console.error('Error:', error);
// //     }
// //   };

// //   const handlePredict = () => {
// //     console.log('Data before prediction check:', data); // Log the data
// //     if (data && Object.keys(data).length > 0) {  // Check if data is not empty
// //       console.log("yes")
// //       fetchPrediction();  // Call fetchPrediction when data is available
// //     } else {
// //       console.log("HI")
// //       setError("No data available to predict.");
// //     }
// //   };
// //   // console.log(data)
// //   // const handlePredict = () => {
// //   //   if (data) {
// //   //     fetchPrediction();  // Call fetchPrediction when data is available
// //   //   } else {
// //   //     console.log("HI")
// //   //     setError("No data available to predict.");
// //   //   }
// //   // };

// //   useEffect(() => {
// //     fetchData();
// //   }, [longitude, latitude]);

// //   return (
// //     <div>
// //       <div>
// //         <button onClick={handlePredict}>Get Prediction</button>
// //         {prediction && <p>Prediction: {prediction}</p>}
// //       </div>
// //       {error && <p>Error: {error}</p>}
// //       {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
// //       <button onClick={fetchData}>Refresh Data</button>
// //     </div>
// //   );
// // };

// // export default NASA_api;


// import { useState, useEffect } from "react";

// const NASA_api = ({ longitude, latitude }) => {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   const [prediction, setPrediction] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [dataVisible, setDataVisible] = useState(false); // New state to control when to show data

//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 356); // 356 days ago (you can modify this for the correct date range)

//   const yyyy = yesterday.getFullYear();
//   const mm = String(yesterday.getMonth() + 1).padStart(2, "0"); // Months are 0-based
//   const dd = String(yesterday.getDate()).padStart(2, "0");
//   const date = `${yyyy}${mm}${dd}`;

//   const fetchData = async () => {
//     try {
//       const response = await fetch(
//         `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,ALLSKY_SFC_SW_DWN,ALLSKY_SFC_LW_DWN,ALLSKY_SFC_SW_DIFF,ALLSKY_SFC_SW_DNI,CLOUD_AMT,ALLSKY_KT,RH2M,ALLSKY_SRF_ALB,PRECTOTCORR&community=RE&longitude=${longitude}&latitude=${latitude}&start=${date}&end=${date}&format=JSON`
//       );
//       if (!response.ok) throw new Error("Failed to fetch");
//       const result = await response.json();
//       setData(result);
//       setLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   // const fetchPrediction = async () => {
//   //   try {
//   //     console.log("Data sent to backend:", data);
//   //     const backend = await fetch("http://127.0.0.1:5000/predict", {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //       body: JSON.stringify({ parameters: data }), // Send the data here
//   //     });
//   //     const result = await backend.json();
//   //     console.log("Prediction result:", result);
//   //     setPrediction(result.prediction); // Display the prediction result from the backend
//   //   } catch (error) {
//   //     console.error("Error:", error);
//   //   }
//   // };

//   const fetchPrediction = async () => {
//     try {
//       // Access the correct nested structure (data.data.properties.parameters)
//       const parameters = data?.data?.properties?.parameters;
//       console.log("Data sent to backend:", JSON.stringify({ parameters }, null, 2));
  
//       // Send the parameters to the backend
//       const backend = await fetch("http://127.0.0.1:5000/predict", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ parameters }), // Send the correct nested data here
//       });
  
//       const result = await backend.json();
//       console.log("Prediction result:", result);
//       setPrediction(result.prediction); // Display the prediction result from the backend
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
  

//   const handlePredict = () => {
//     console.log("Data before prediction check:", data); // Log the data
//     if (data && data.parameters && data.parameters.T2M) {
//       console.log("Data is available and valid.");
//       fetchPrediction(); // Call fetchPrediction when data is available
//     } else {
//       console.log("Data is missing or invalid.");
//       setError("No valid data available to predict.");
//     }

//     setDataVisible(true); // Set data visible when the button is pressed
//   };

//   useEffect(() => {
//     fetchData();
//   }, [longitude, latitude]);

//   return (
//     <div>
//       <div>
//         <button onClick={handlePredict}>Get Prediction</button>
//         {prediction && <p>Prediction: {prediction}</p>}
//       </div>
//       {error && <p>Error: {error}</p>}
//       {dataVisible && data ? ( // Display data only after button press
//         <pre>{JSON.stringify(data, null, 2)}</pre>
//       ) : (
//         <p>Loading...</p>
//       )}
//       <button onClick={fetchData}>Refresh Data</button>
//     </div>
//   );
// };

// export default NASA_api;


import { useState, useEffect } from "react";

const NASA_api = ({ longitude, latitude }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState(false); // Added state to control visibility of data

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 356);

  const yyyy = yesterday.getFullYear();
  const mm = String(yesterday.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const dd = String(yesterday.getDate()).padStart(2, "0");
  const date = `${yyyy}${mm}${dd}`;

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,ALLSKY_SFC_SW_DWN,ALLSKY_SFC_LW_DWN,ALLSKY_SFC_SW_DIFF,ALLSKY_SFC_SW_DNI,CLOUD_AMT,ALLSKY_KT,RH2M,ALLSKY_SRF_ALB,PRECTOTCORR&community=RE&longitude=${longitude}&latitude=${latitude}&start=${date}&end=${date}&format=JSON`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      setData(result);
      setLoading(false); // Set loading to false after data is fetched
    } catch (err) {
      setError(err.message);
      setLoading(false); // Make sure loading is false even in case of an error
    }
  };

  // const fetchPrediction = async () => {
  //   try {
  //     const featureMapping = {
  //       'T2M': 'Temp',
  //       'ALLSKY_SFC_SW_DWN': 'SW_DWN',
  //       'ALLSKY_SFC_LW_DWN': 'LW_DWN',
  //       'ALLSKY_SFC_SW_DIFF': 'SW_DIFF',
  //       'ALLSKY_SFC_SW_DNI': 'SW_DNI',
  //       'CLOUD_AMT': 'Cloud',
  //       'ALLSKY_KT': 'Clearness',
  //       'RH2M': 'Humidity',
  //       'PRECTOTCORR': 'Precipitation'
  //     };
  //     // Accessing the correct nested data: data.data.properties.parameters
  //     const parameters = data.properties.parameter
  //     // console.log(parameters)
  //     // const parametersArray = Object.entries(parameters || {}).map(([key, value]) => ({
  //     //   name: key,
  //     //   value: value[Object.keys(value)[0]], // Access the value from the date object
  //     // }));
  //     // console.log(parametersArray)
  //     // console.log("Data sent to backend:", JSON.stringify({ parameters }, null, 2));

  //     const mappedData = Object.entries(data.properties.parameter).reduce((acc, [key, value]) => {
  //       if (featureMapping[key]) {
  //         acc[featureMapping[key]] = value[Object.keys(value)[0]]; // Get the value associated with the date key
  //       }
  //       return acc;
  //     }, {});
  
  //     console.log('Mapped Data:', mappedData);

  //     const backend = await fetch("http://127.0.0.1:5000/predict", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ mappedData }), // Send the correct nested data
  //     });

  //     const result = await backend.json();
  //     console.log("Prediction result:", result);
  //     setPrediction(result.prediction); // Display the prediction result
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  const fetchPrediction = async () => {
    try {
      // Define the mapping between incoming data keys and model's feature names
      const featureMapping = {
        'T2M': 'Temp',
        'ALLSKY_SFC_SW_DWN': 'SW_DWN',
        'ALLSKY_SFC_LW_DWN': 'LW_DWN',
        'ALLSKY_SFC_SW_DIFF': 'SW_DIFF',
        'ALLSKY_SFC_SW_DNI': 'SW_DNI',
        'CLOUD_AMT': 'Cloud',
        'ALLSKY_KT': 'Clearness',
        'RH2M': 'Humidity',
        'PRECTOTCORR': 'Precipitation'
      };
  
      // Map the incoming data to match the model's feature names
      const mappedData = {};
  
      // Loop through each parameter and map it to the correct feature name
      Object.entries(data.properties.parameter).forEach(([key, value]) => {
        if (featureMapping[key]) {
          mappedData[featureMapping[key]] = value[Object.keys(value)[0]]; // Extract value by date key
        }
      });
  
      console.log('Mapped Data:', mappedData);
  
      // Send the mapped data to the backend
      const backend = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parameters: mappedData }), // Send the mapped data as parameters
      });
  
      const result = await backend.json();
      console.log("Prediction result:", result);
      setPrediction(result.prediction); // Display the prediction result
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };
  

  const handlePredict = () => {
    console.log("Data before prediction check:", data); // Log the data
    if (data && Object.keys(data).length > 0) {
      fetchPrediction(); // Call fetchPrediction when data is available
      setShowData(true); // Set to true to show data after prediction
    } else {
      setError("No data available to predict.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [longitude, latitude]);

  return (
    <div>
      <div>
        {/* Disable the button until data is fetched */}
        <button onClick={handlePredict} disabled={loading || !data}>
          Get Prediction
        </button>
        {prediction && <p>Prediction: {prediction}</p>}
      </div>
      {error && <p>Error: {error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Show the data only when the user clicks on the "Get Prediction" button
          {showData && (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          )} */}
        </>
      )}
      <button onClick={fetchData}>Refresh Data</button>
    </div>
  );
};

export default NASA_api;
