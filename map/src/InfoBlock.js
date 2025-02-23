import React, { forwardRef, useImperativeHandle, useState } from "react";

const InfoBlock = forwardRef((props, ref) => {
  const [countyName, setCountyName] = useState("");

  useImperativeHandle(ref, () => ({
    setCountyName: (name) => setCountyName(name),
  }));

  return (
    <div
      style={{
        width: "300px",
        height: "600px",
        border: "2px solid black",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <h2>County Information</h2>
      <p>{countyName ? `Selected County: ${countyName}` : "Hover over a county to see details."}</p>
    </div>
  );
});

export default InfoBlock;
