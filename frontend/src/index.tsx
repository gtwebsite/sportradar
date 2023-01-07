import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime";
import App from "./App";

(async () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
