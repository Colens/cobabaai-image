"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_BRAND } from "./constants";
import { SITE_ROUTES } from "./routes";
import ApiKeyButtons from "@/components/api-key-buttons";

const NAV_ITEMS = [
  { path: SITE_ROUTES.home, label: "首页" },
  { path: SITE_ROUTES.models, label: "模型价格" },
  { path: SITE_ROUTES.batch, label: "批量生图", exact: true },
  { path: SITE_ROUTES.promptClaim, label: "提示词领取" },
  { path: SITE_ROUTES.docs, label: "API 文档", external: true },
];

function normalizePath(pathname) {
  if (!pathname) return "/";
  const stripped = pathname.replace(/^\/(en)(?=\/|$)/, "") || "/";
  return stripped;
}

export default function SiteHeader() {
  const pathname = normalizePath(usePathname());

  return (
    <header className="img-site-header">
      <div className="img-site-header-inner">
        <Link href={SITE_ROUTES.batch} className="img-site-logo">
          <img src={SITE_BRAND.logo} alt="" />
          <span className="img-site-logo-text">{SITE_BRAND.name}</span>
        </Link>

        <nav className="img-site-nav" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.path
              : !item.external && pathname.startsWith(item.path);
            if (item.external) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className="img-site-nav-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              );
            }
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`img-site-nav-link${active ? " is-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="img-site-actions img-batch-actions">
          <ApiKeyButtons />
        </div>
      </div>
    </header>
  );
}
