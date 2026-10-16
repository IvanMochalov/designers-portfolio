import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { FluidSurface } from "./components/FluidSurface/FluidSurface";
import stage from "./components/FluidSurface/FluidSurface.module.css";
import { LocaleProvider } from "./components/LocaleProvider/LocaleProvider";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const basepath = import.meta.env.BASE_URL.replace(/\/$/, "");

const router = createRouter({
  routeTree,
  ...(basepath ? { basepath } : {}),
});

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
      <FluidSurface />
      <div className={stage.stage}>
        <RouterProvider router={router} />
      </div>
    </LocaleProvider>
  </StrictMode>,
);
