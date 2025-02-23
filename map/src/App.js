import React, { useRef } from "react";
import "./App.css";
import Map from "./Map";
import InfoBlock from "./InfoBlock";

function App() {
  const infoBlockRef = useRef(null);

  return (
    <div
      className="App"
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "30px",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>California Counties Map</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center", // Centers everything horizontally
          alignItems: "center", // Centers vertically
          gap: "50px", // Space between the two components
        }}
      >
        <Map infoBlockRef={infoBlockRef} />
        <InfoBlock ref={infoBlockRef} />
      </div>
    </div>
  );
}

export default App;
