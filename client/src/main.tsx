import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { storage } from "./lib/storage";

// Initialize the local storage service
console.log("Initializing frontend-only application with local storage...");

// Mount the app
createRoot(document.getElementById("root")!).render(<App />);
