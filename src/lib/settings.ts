import { prisma } from "./prisma";

export async function getSetting(
  key: string,
  fallback = "",
): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getBaseCurrency(): Promise<string> {
  return getSetting("baseCurrency", process.env.BASE_CURRENCY || "USD");
}

export async function getAgencyName(): Promise<string> {
  return getSetting("agencyName", "Travel CRM");
}
