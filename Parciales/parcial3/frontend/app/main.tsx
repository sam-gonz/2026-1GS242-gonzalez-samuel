import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/clerk-react";
import { router } from "./router";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

function App() {
  if (!CLERK_KEY) {
    return <RouterProvider router={router} />;
  }
  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <RouterProvider router={router} />
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
