import type { MetadataRoute } from "next";
import { listCaseTypeDefinitions } from "@cancelclaim/core";
import { config } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = config.siteUrl.replace(/\/$/, "");
  const staticRoutes = ["", "/start", "/pricing", "/faq", "/support", "/privacy", "/terms"];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  for (const def of listCaseTypeDefinitions()) {
    routes.push({
      url: `${base}/solutions/${def.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return routes;
}
