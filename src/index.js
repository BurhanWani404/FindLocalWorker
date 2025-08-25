// Polyfills for Node.js core modules
import "react-app-polyfill/stable";
import "react-app-polyfill/ie9";
import "react-app-polyfill/ie11";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import store from "./redux/store/store";
import "bootstrap/dist/js/bootstrap.bundle.min";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { persistor } from './redux/store/store';
import { PersistGate } from "redux-persist/integration/react";

// Add this at the top of your src/index.js or src/index.tsx
if (typeof global === "undefined") {
  window.global = window;
}
global.process = require("process/browser");
global.Buffer = require("buffer").Buffer;
// Polyfill for `Buffer` (used by some packages like `safe-buffer`)
if (typeof window.Buffer === "undefined") {
  window.Buffer = require("buffer").Buffer;
}

// Polyfill for `crypto` (used by `cookie-signature`, `etag`, etc.)
if (typeof window.crypto === "undefined") {
  window.crypto = require("crypto-browserify");
}

// Polyfill for `stream` (used by `destroy`, `send`, etc.)
if (typeof window.stream === "undefined") {
  window.stream = require("stream-browserify");
}

// Polyfill for `querystring` (used by `body-parser`, `express`, etc.)
if (typeof window.querystring === "undefined") {
  window.querystring = require("querystring-es3");
}

// Polyfill for `path` (used by `express`, `mime`, etc.)
if (typeof window.path === "undefined") {
  window.path = require("path-browserify");
}

// Polyfill for `http` (used by `express`)
if (typeof window.http === "undefined") {
  window.http = require("stream-http");
}

// Polyfill for `url` (used by `parseurl`, `serve-static`)
if (typeof window.url === "undefined") {
  window.url = require("url").URL;
}

// Polyfill for `zlib` (used by `body-parser`, `destroy`)
if (typeof window.zlib === "undefined") {
  window.zlib = require("browserify-zlib");
}

// Polyfill for `util` (used by `send`)
if (typeof window.util === "undefined") {
  window.util = require("util");
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
 <Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
);

reportWebVitals();
