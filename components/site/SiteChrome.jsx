"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { SITE_ROUTES } from "./routes";

function normalizePath(pathname) {
  if (!pathname) return "/";
  return pathname.replace(/^\/(en)(?=\/|$)/, "") || "/";
}

export default function SiteChrome({ children }) {
  const pathname = normalizePath(usePathname());
  const isMarketingHome = pathname === SITE_ROUTES.home;
  const isBatch =
    pathname === SITE_ROUTES.batch || pathname.startsWith("/batch");

  return (
    <div
      className={`img-site-main${isBatch ? " img-site-main--batch" : ""}`}
    >
      <SiteHeader />
      {children}
      {!isMarketingHome && <SiteFooter />}
    </div>
  );
}
