import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import caCounties from "./ca_counties.geojson";
import { scaleQuantile } from "d3-scale";
import { csv } from "d3-fetch";
import "./Style.css";

const Map = ({ infoBlockRef }) => {
  const [data, setData] = useState({});
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [csvFile, setCsvFile] = useState("/ca_county_values.csv");

  // Load CSV Data
  const loadData = (file) => {
    csv(file)
      .then(counties => {
        console.log(counties);
        const countyData = {};
        counties.forEach(d => {
          countyData[d.CountyName] = +d.Value; // Convert Value to a number
        });
        setData(countyData);
      })
      .catch(error => {
        console.error("Error loading the CSV file:", error);
      });
  };

  useEffect(() => {
    loadData(csvFile);
  }, [csvFile]);

  // Create the color scale based on loaded data
  const colorScale = scaleQuantile()
    .domain(Object.values(data)) // Use the values from the data object
    .range(csvFile === "/ca_county_values.csv"
      ? [
          "#ffedea",
          "#ffcec5",
          "#ffad9f",
          "#ff8a75",
          "#ff5533",
          "#e2492d",
          "#be3d26",
          "#9a311f",
          "#782618" // Red gradient
        ]
      : [
          "#e0e7ff", // Lightest blue
          "#c7d2fe",
          "#a5b4fc",
          "#818cf8",
          "#6366f1",
          "#4f46e5",
          "#4338ca",
          "#3730a3",
          "#1e3a8a"
        ]
    );

  const switchCsv = () => {
    // Toggle between two CSV files and reset the selected county
    setSelectedCounty(null);
    setCsvFile(prevFile => 
      prevFile === "/ca_county_values.csv" ? "/ca_county_values2.csv" : "/ca_county_values.csv"
    );
  };

  return (
    <div className="map-container">
      <button onClick={switchCsv} className="switch-button">
        Switch CSV
      </button>
      <div className="map-wrapper">
        <ComposableMap width={600} height={600} projection="geoMercator" projectionConfig={{ center: [-119, 37.5], scale: 2500 }}>
          <ZoomableGroup zoom={1}>
            <Geographies geography={caCounties}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countyName = geo.properties.CountyName;
                  const normalizedValue = data[countyName] || 0;
                  const fillColor = selectedCounty === countyName ? "black" : colorScale(normalizedValue);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="black"
                      strokeWidth={1}
                      onMouseEnter={() => infoBlockRef.current.setCountyName(countyName)}
                      onMouseLeave={() => infoBlockRef.current.setCountyName("")}
                      onClick={() => setSelectedCounty(countyName)}
                      style={{
                        default: { className: "geography-default" },
                        hover: { className: "geography-hover" },
                        pressed: { className: "geography-pressed" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>

  );
};

export default Map;
