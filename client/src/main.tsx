import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { storage } from "./lib/storage";

// Initialize the local storage service
console.log("🚀 ClockTick Analyzer - Frontend-Only Application");
console.log("💾 Using browser localStorage for data persistence");

// Load any saved data from localStorage
storage.initialize().then(() => {
  console.log("✅ LocalStorage initialized successfully");
}).catch((error: unknown) => {
  console.error("Error initializing storage:", error);
});

// Mount the app
createRoot(document.getElementById("root")!).render(<App />);
