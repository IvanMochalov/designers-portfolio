import { useEffect } from "react";
import { createRootRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { CaseHeader } from "../components/CaseHeader/CaseHeader";
import { IdentityBlock } from "../components/IdentityBlock/IdentityBlock";
import { SiteFooter } from "../components/SiteFooter/SiteFooter";
import { ScrollReveal } from "../components/ScrollReveal/ScrollReveal";
import { SiteHeader } from "../components/SiteHeader/SiteHeader";
import { useSite } from "../components/LocaleProvider/LocaleProvider";
import { pageSeo } from "../data/content";

function setMeta(key: "name" | "property", name: string, content: string | undefined) {
  const existing = document.head.querySelector(`meta[${key}="${name}"]`);
  if (!content) {
    existing?.remove();
    return;
  }
  const meta = existing ?? document.createElement("meta");
  meta.setAttribute(key, name);
  meta.setAttribute("content", content);
  if (!existing) document.head.appendChild(meta);
}

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isCase = pathname.startsWith("/case-studies/");
  const { content } = useSite();
  const seo = pageSeo(content, pathname);

  useEffect(() => {
    const title = seo?.title ?? content.profile.name;
    document.title = title;
    setMeta("name", "description", seo?.description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", seo?.description);
    setMeta("property", "og:url", `${window.location.origin}${pathname}`);
  }, [content.profile.name, pathname, seo]);

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
