import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const DEFAULT_LOGO = "/images/simbu.png";
export const DEFAULT_PORTRAIT = "/images/meghna.jpg";

/** The logo Meghna has picked, or the built-in Simbu. Cached per request. */
export const getLogoUrl = cache(async () => {
  const logo = await prisma.siteLogo.findFirst({ where: { active: true } });
  return logo?.url ?? DEFAULT_LOGO;
});

/** The photo of Meghna shown on the About page. Cached per request. */
export const getPortraitUrl = cache(async () => {
  const portrait = await prisma.sitePortrait.findFirst({ where: { active: true } });
  return portrait?.url ?? DEFAULT_PORTRAIT;
});
