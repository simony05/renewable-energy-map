import React, { useRef } from "react";
import "./Style.css";
import Map from "./Map";
import InfoBlock from "./InfoBlock";

function App() {
  const infoBlockRef = useRef(null);

  return (
    <div className="App">
      <div>
        <a href="https://www.nrel.gov/grid/solar-power-data.html"> <button className="data-link">Solar Power Data →</button> </a>
        <a href="https://power.larc.nasa.gov/data-access-viewer/"> <button className="data-link">NASA Climate Data →</button> </a>
        <a href="https://power.larc.nasa.gov/data-access-viewer/"> <button className="data-link">Wind Data →</button> </a>
      </div>
      <h1 className="app-title">California Solar Power</h1>
      <div className="app-content">
        <Map infoBlockRef={infoBlockRef} />
        <InfoBlock ref={infoBlockRef} />
      </div>
    </div>
  );
}

export default App;
