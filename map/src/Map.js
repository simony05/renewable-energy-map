import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import caCounties from "./ca_counties.geojson";
import { scaleQuantile } from "d3-scale";
import { csv } from "d3-fetch";
import { Tooltip } from 'react-tooltip';
import "./Style.css";

const Map = ({ infoBlockRef, onCaliforniaClick }) => {
  const [data, setData] = useState({});
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [csvFile, setCsvFile] = useState("/california_predictions.csv");
  const [content, setContent] = useState("");

  const loadData = (file) => {
    csv(file)
      .then(counties => {
        console.log(counties);
        const countyData = {};
        counties.forEach(d => {
          countyData[d.CountyName] = +d.Value;
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

  const colorScale = scaleQuantile()
    .domain(Object.values(data))
    .range(csvFile === "/california_predictions.csv"
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
        "#FFFFFF",
        "#F0FDFF",
        "#E0FBFF",
        "#D1F9FF",
        "#C1F7FF",
        "#B2F5FF",
        "#A3F3FF",
        "#93F1FF",
        "#84EFFF",
        "#75EDFF",
        "#65EBFF",
        "#56E9FF",
        "#61DAF3"
      ]
    );

  const switchCsv = () => {
    setSelectedCounty(null);
    setCsvFile(prevFile => 
      prevFile === "/california_predictions.csv" ? "/ca_county_values2.csv" : "/california_predictions.csv"
    );
  };

  const renderLegend = () => {
    const gradientClass = csvFile === "/california_predictions.csv" ? "legend-gradient-yellow" : "legend-gradient-blue";
  
    return (
      <div className="legend">
        100
        <div className={gradientClass}></div>
        
        <div className="legend-labels">
          0
          <div className="legend-label"></div>
          <div className="legend-label"></div>
          <div className="legend-label"></div>
          <div className="legend-label"></div>
          <div className="legend-label"></div>
        </div>
      </div>
    );
  };
  

  return (
    <div className="map-container">
      <button onClick={switchCsv} className="switch-button">
        {csvFile === "/california_predictions.csv" ? "Solar Data" : "Wind Data"}
      </button>
      <button onClick={onCaliforniaClick} className="switch-button2">
        USA Map
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
      <div className="legend-container">
        {renderLegend()}
      </div>

    </div>

  );
};

export default Map;
