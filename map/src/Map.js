import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import caCounties from "./ca_counties.geojson";
import { scaleQuantile } from "d3-scale";
import { csv } from "d3-fetch";
import { Tooltip } from 'react-tooltip';
import "./Style.css";

const Map = ({ infoBlockRef }) => {
  const [data, setData] = useState({});
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [csvFile, setCsvFile] = useState("/ca_county_values.csv");
  const [content, setContent] = useState("");

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
    // .domain([60, 100]) 
    .range(csvFile === "/ca_county_values.csv"
      ? [
          "#fffff0",
          "#fffde7",
          "#fff9c4",
          "#fff59d",
          "#fff176",
          "#ffeb3b",
          "#ffca28",
          "#ffc107",
          "#ffeb3b"
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
      <Tooltip id="county-tooltip" content={content} />
      <div className="map-wrapper">
        <ComposableMap width={600} height={600} projection="geoMercator" projectionConfig={{ center: [-119, 37.5], scale: 2500 }}>
          <ZoomableGroup zoom={1}>
            {" "}
            <Geographies geography={caCounties}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countyName = geo.properties.CountyName;
                  const normalizedValue = data[countyName] || 0;
                  const fillColor = selectedCounty === countyName ? "green" : colorScale(normalizedValue);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="black"
                      strokeWidth={1}
                      data-tooltip-id="county-tooltip"
                      data-tip={countyName}
                      onMouseEnter={() => setContent(`${countyName}`)}
                      onMouseLeave={() => setContent("")}
                      onClick={() => {
                        setSelectedCounty(countyName);
                        infoBlockRef.current.setCountyName(countyName);
                      }}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "green", outline: "none" },
                        pressed: { fill: "green", outline: "none" },
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
