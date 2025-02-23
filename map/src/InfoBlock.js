import React, { forwardRef, useImperativeHandle, useState } from "react";
import "./Style.css";

const InfoBlock = forwardRef((props, ref) => {
  const [countyName, setCountyName] = useState("");

  useImperativeHandle(ref, () => ({
    setCountyName: (name) => setCountyName(name),
  }));

  return (
    <div className='info-container'>
      <h2>County Information</h2>
      <p>{countyName ? `Selected County: ${countyName}` : "Hover over a county to see details."}</p>
    </div>
  );
});

export default InfoBlock;
