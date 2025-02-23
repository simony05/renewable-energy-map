import React, { useRef } from "react";
import "./Style.css";
import Map from "./Map";
import InfoBlock from "./InfoBlock";

function App() {
  const infoBlockRef = useRef(null);

  return (
    <div className="App">
      <div>
        <button className="data-link">NASA Database →</button>
        <button className="data-link">Climate Database →</button>
        <button className="data-link">Wind Database →</button>
      </div>
      <h1 className="app-title">California Counties Map</h1>
      <div className="app-content">
        <Map infoBlockRef={infoBlockRef} />
        <InfoBlock ref={infoBlockRef} />
      </div>
    </div>
  );
}

export default App;
