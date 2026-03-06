import { bootstrapEngine } from "./engine/presentation/bootstrapEngine.js";

// Global Error Handler for visible debugging
window.onerror = function(message, source, lineno, colno, error) {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.innerText = `Error: ${message}\nSource: ${source}:${lineno}:${colno}\nStack: ${error ? error.stack : 'N/A'}`;
  document.body.appendChild(errorDiv);
  console.error(error);
};

window.onunhandledrejection = function(event) {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.bottom = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.backgroundColor = 'rgba(255, 165, 0, 0.9)';
  errorDiv.style.color = 'black';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.innerText = `Unhandled Promise Rejection: ${event.reason}`;
  document.body.appendChild(errorDiv);
  console.error(event.reason);
};

const query = new URLSearchParams(window.location.search);
const configPath = query.get("config") || "./config/engine.terminal.json";

bootstrapEngine({ configPath }).catch(err => {
  console.error("Bootstrap failed:", err);
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '50%';
  errorDiv.style.left = '50%';
  errorDiv.style.transform = 'translate(-50%, -50%)';
  errorDiv.style.backgroundColor = 'rgba(100, 0, 0, 0.9)';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '20px';
  errorDiv.style.border = '2px solid red';
  errorDiv.style.zIndex = '10000';
  errorDiv.innerText = `Bootstrap Error: ${err.message}`;
  document.body.appendChild(errorDiv);
}).then(() => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.remove();
  console.log("Bootstrap completed");
});
