import { redirect } from "next/navigation";
import { SITE_ROUTES } from "@/components/site/routes";

/** Keep /batch working — redirect to the new default root, preserve query. */
export default async function BatchRedirectPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams(
    Object.entries(params || {}).flatMap(([key, value]) => {
      if (Array.isArray(value)) return value.map((v) => [key, v]);
      if (value == null) return [];
      return [[key, value]];
    }),
  ).toString();

  redirect(qs ? `${SITE_ROUTES.batch}?${qs}` : SITE_ROUTES.batch);
}
