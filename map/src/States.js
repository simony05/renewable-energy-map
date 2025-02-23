import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import states from "./states.geojson";
import { scaleQuantile } from "d3-scale";
import { csv } from "d3-fetch";
import { Tooltip } from 'react-tooltip';
import "./Style.css";

const States = ({ onCaliforniaClick }) => {
  const [data, setData] = useState({});
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [content, setContent] = useState("");
  const [csvFile, setCsvFile] = useState("/us_states.csv");

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
    .range(csvFile === "/us_states.csv"
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
          prevFile === "/us_states.csv" ? "/us_states2.csv" : "/us_states.csv"
        );
      };

  const renderLegend = () => {
    const gradientClass = csvFile === "/us_states.csv" ? "legend-gradient-yellow" : "legend-gradient-blue";
  
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
        Switch CSV
      </button>
      <Tooltip id="county-tooltip" content={content} />
      <div className="map-wrapper">
        <ComposableMap width={600} height={600} projection="geoMercator" projectionConfig={{ center: [-96.5, 37.5], scale: 550 }}>
          <ZoomableGroup zoom={1}>
            {" "}
            <Geographies geography={states}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countyName = geo.properties.NAME;
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
                        if (countyName === "California") {
                            onCaliforniaClick();
                          }         
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

export default States;