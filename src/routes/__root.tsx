import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CaseHeader } from "../components/CaseHeader/CaseHeader";
import { SiteFooter } from "../components/SiteFooter/SiteFooter";
import { ScrollReveal } from "../components/ScrollReveal/ScrollReveal";
import { SiteHeader } from "../components/SiteHeader/SiteHeader";
import { useSite } from "../components/LocaleProvider/LocaleProvider";

function RootLayout() {
  const isCase = useRouterState({
    select: (state) => state.location.pathname.startsWith("/case-studies/"),
  });

  return (
      <div className="page">
        <ScrollReveal />
        {isCase ? <CaseHeader /> : <SiteHeader />}
        <Outlet />
        <SiteFooter />
      </div>
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
