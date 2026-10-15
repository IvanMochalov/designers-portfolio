import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { LocaleProvider } from "./components/LocaleProvider";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element is missing");

createRoot(root).render(
  <StrictMode>
    <LocaleProvider>
      <RouterProvider router={router} />
    </LocaleProvider>
  </StrictMode>,
);
