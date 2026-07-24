import Link from "next/link";
import { FOOTER_COPY, SITE_BRAND } from "./constants";
import { SITE_ROUTES } from "./routes";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const copy = FOOTER_COPY;

  return (
    <footer className="img-site-footer">
      <div className="img-site-footer-inner">
        <div className="img-site-footer-links">
          <Link href={SITE_ROUTES.models}>{copy.modelsPrice}</Link>
          <Link href={SITE_ROUTES.batch}>{copy.batch}</Link>
          <Link href={SITE_ROUTES.promptClaim}>{copy.promptClaim}</Link>
          <a href={SITE_ROUTES.topup} target="_blank" rel="noopener noreferrer">
            {copy.topup}
          </a>
          <a
            href={SITE_ROUTES.mainSite}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.mainSite}
          </a>
          <a href={SITE_ROUTES.docs} target="_blank" rel="noopener noreferrer">
            {copy.docs}
          </a>
        </div>
        <p className="img-site-footer-copy">
          © {year} {SITE_BRAND.name} · {copy.sharedAccount}
        </p>
      </div>
    </footer>
  );
}
