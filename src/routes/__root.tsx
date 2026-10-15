import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CaseHeader } from "../components/CaseHeader";
import { LightboxProvider } from "../components/Lightbox";
import { SiteFooter } from "../components/SiteFooter";
import { ScrollReveal } from "../components/ScrollReveal";
import { SiteHeader } from "../components/SiteHeader";
import { useSite } from "../components/LocaleProvider";

function RootLayout() {
  const isCase = useRouterState({
    select: (state) => state.location.pathname.startsWith("/case-studies/"),
  });

  return (
    <LightboxProvider>
      <div className="page">
        <ScrollReveal />
        {isCase ? <CaseHeader /> : <SiteHeader />}
        <Outlet />
        <SiteFooter />
      </div>
    </LightboxProvider>
  );
}

function NotFound() {
  const { ui } = useSite().content;
  return (
    <section className="missing">
      <h1>{ui.notFound}</h1>
      <Link to="/">{ui.backHome}</Link>
    </section>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
