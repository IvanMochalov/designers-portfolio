import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CaseHeader } from "../components/CaseHeader";
import { LightboxProvider } from "../components/Lightbox";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { content } from "../data/content";

function RootLayout() {
  const isCase = useRouterState({
    select: (state) => state.location.pathname.startsWith("/case-studies/"),
  });

  return (
    <LightboxProvider>
      <div className="page">
        {isCase ? <CaseHeader /> : <SiteHeader />}
        <Outlet />
        <SiteFooter />
      </div>
    </LightboxProvider>
  );
}

function NotFound() {
  return (
    <section className="missing">
      <h1>{content.ui.notFound}</h1>
      <Link to="/">{content.ui.backHome}</Link>
    </section>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
