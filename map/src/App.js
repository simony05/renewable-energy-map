import React, { useRef, useState } from "react";
import "./Style.css";
import Map from "./Map";
import InfoBlock from "./InfoBlock";
import States from "./States";

function App() {
  const infoBlockRef = useRef(null);
  const [showCaliforniaMap, setShowCaliforniaMap] = useState(false);

  const handleCaliforniaClick = () => {
    if (showCaliforniaMap === false) setShowCaliforniaMap(true);
    else setShowCaliforniaMap(false);
  };

  return (
    <div className="App">
      <div>
        <a href="https://www.nrel.gov/grid/solar-power-data.html">
          <button className="data-link">Solar Power Data →</button>
        </a>
        <a href="https://power.larc.nasa.gov/data-access-viewer/">
          <button className="data-link">NASA Climate Data →</button>
        </a>
        <a href="https://power.larc.nasa.gov/data-access-viewer/">
          <button className="data-link">Wind Data →</button>
        </a>
      </div>
      <h1 className="app-title">SOLPower Solar Farm Finder</h1>
      <div className="app-content">
        {showCaliforniaMap ? (
          <Map infoBlockRef={infoBlockRef} onCaliforniaClick={handleCaliforniaClick} />
        ) : (
          <States onCaliforniaClick={handleCaliforniaClick} />
        )}
        <InfoBlock ref={infoBlockRef} />
      </div>
    </div>
  );
}

export default App;
