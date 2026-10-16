import { useEffect } from "react";
import { createRootRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { CaseHeader } from "../components/CaseHeader/CaseHeader";
import { IdentityBlock } from "../components/IdentityBlock/IdentityBlock";
import { SiteFooter } from "../components/SiteFooter/SiteFooter";
import { ScrollReveal } from "../components/ScrollReveal/ScrollReveal";
import { SiteHeader } from "../components/SiteHeader/SiteHeader";
import { useSite } from "../components/LocaleProvider/LocaleProvider";
import { pageSeo } from "../data/content";

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isCase = pathname.startsWith("/case-studies/");
  const { content } = useSite();
  const seo = pageSeo(content, pathname);

  useEffect(() => {
    document.title = seo?.title ?? content.profile.name;
    const existing = document.head.querySelector('meta[name="description"]');
    if (!seo?.description) {
      existing?.remove();
      return;
    }
    const meta = existing ?? document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", seo.description);
    if (!existing) document.head.appendChild(meta);
  }, [content.profile.name, seo]);

  return (
      <div className="page">
        <ScrollReveal />
        {isCase ? <CaseHeader /> : <SiteHeader />}
        {isCase ? null : <IdentityBlock />}
        <Outlet />
        <SiteFooter />
      </div>
  );
}

function NotFound() {
  return <Navigate to="/not-found" replace />;
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
