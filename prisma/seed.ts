import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CURRENCIES = [
  { code: "USD", name: "Доллар США", symbol: "$", isBase: true },
  { code: "VND", name: "Вьетнамский донг", symbol: "₫", isBase: false },
  { code: "EUR", name: "Евро", symbol: "€", isBase: false },
];

async function main() {
  // Currencies
  for (const c of CURRENCIES) {
    await prisma.currency.upsert({
      where: { code: c.code },
      update: { name: c.name, symbol: c.symbol, isBase: c.isBase },
      create: c,
    });
  }

  // Base currency setting
  await prisma.setting.upsert({
    where: { key: "baseCurrency" },
    update: {},
    create: { key: "baseCurrency", value: "USD" },
  });
  await prisma.setting.upsert({
    where: { key: "agencyName" },
    update: {},
    create: { key: "agencyName", value: "Туристическое агентство" },
  });

  // Owner
  const owner = await prisma.user.upsert({
    where: { login: "owner" },
    update: {},
    create: {
      login: "owner",
      passwordHash: await bcrypt.hash("owner123", 10),
      fullName: "Владелец",
      role: "owner",
    },
  });

  // Employee
  const employee = await prisma.user.upsert({
    where: { login: "manager" },
    update: {},
    create: {
      login: "manager",
      passwordHash: await bcrypt.hash("manager123", 10),
      fullName: "Менеджер Иван",
      role: "employee",
    },
  });

  // Demo data only if DB is empty of clients
  const clientCount = await prisma.client.count();
  if (clientCount === 0) {
    const partner = await prisma.partner.create({
      data: {
        name: "Sunrise Tours",
        contactPerson: "Нгуен Ван",
        phone: "+84 90 123 4567",
        email: "sales@sunrise.example",
        currency: "USD",
        scheduleType: "after_client_payment",
        terms: "Оплата после получения денег от клиента",
      },
    });

    const client1 = await prisma.client.create({
      data: {
        firstName: "Алексей",
        lastName: "Смирнов",
        phone: "+7 900 111 22 33",
        email: "alex@example.com",
        managerId: employee.id,
      },
    });
    const client2 = await prisma.client.create({
      data: {
        firstName: "Мария",
        lastName: "Иванова",
        phone: "+7 900 444 55 66",
        managerId: employee.id,
      },
    });

    const now = new Date();
    const inMonth = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

    const sale1 = await prisma.sale.create({
      data: {
        clientId: client1.id,
        country: "Вьетнам",
        tourName: "Нячанг 7 ночей",
        saleDate: now,
        tripDate: inMonth,
        touristsCount: 2,
        sellPrice: 1000,
        costPrice: 750,
        currency: "USD",
        partnerId: partner.id,
        sellerId: employee.id,
        partnerDueDate: inMonth,
        comment: "Отель 4*, завтраки",
      },
    });

    // Partial payments on sale1 (received by owner, sold by employee)
    await prisma.payment.create({
      data: {
        clientId: client1.id,
        saleId: sale1.id,
        amount: 400,
        currency: "USD",
        method: "cash",
        receivedById: employee.id,
      },
    });
    await prisma.payment.create({
      data: {
        clientId: client1.id,
        saleId: sale1.id,
        amount: 200,
        currency: "USD",
        method: "card",
        receivedById: owner.id,
      },
    });

    await prisma.sale.create({
      data: {
        clientId: client2.id,
        country: "Таиланд",
        tourName: "Пхукет 5 ночей",
        saleDate: now,
        tripDate: inMonth,
        touristsCount: 1,
        sellPrice: 600,
        costPrice: 480,
        currency: "USD",
        sellerId: owner.id,
      },
    });

    await prisma.expense.create({
      data: {
        category: "rent",
        amount: 300,
        currency: "USD",
        createdById: owner.id,
        comment: "Аренда офиса",
      },
    });
  }

  console.log("Seed complete. Logins: owner/owner123, manager/manager123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
