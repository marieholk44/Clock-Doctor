import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

// Create a simple frontend-only mode indicator component
function StandaloneIndicator() {
  return (
    <div className="fixed bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-50">
      Frontend-Only Mode
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Always show standalone indicator for the frontend-only version
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
      <StandaloneIndicator />
    </QueryClientProvider>
  );
}

export default App;
