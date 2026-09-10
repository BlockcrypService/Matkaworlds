import React from "react";

const Loader = ({ text = "Loading ..." }) => {
  return (
    <div className="text-center py-5 pera_txt">
      {!text && (
        <div
          className="spinner-border text-theme"
          role="status"
          style={{ width: "2rem", height: "2rem" }}
        >
          <span className="visually-hidden">Loading ...</span>
        </div>
      )}
      {text && (
        <div style={{ fontSize: "14px" }} className="mt-3 fw-semibold">
          {text}
        </div>
      )}
    </div>
  );
};

export default Loader;
