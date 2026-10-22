import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const DEFAULT_LOGO = "/images/simbu.png";

/** The logo Meghna has picked, or the built-in Simbu. Cached per request. */
export const getLogoUrl = cache(async () => {
  const logo = await prisma.siteLogo.findFirst({ where: { active: true } });
  return logo?.url ?? DEFAULT_LOGO;
});
