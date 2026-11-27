// Centralized constants and Russian labels.

export const ROLES = {
  owner: "Владелец",
  employee: "Сотрудник",
} as const;
export type Role = keyof typeof ROLES;

export const PAYMENT_METHODS = {
  cash: "Наличные",
  bank_transfer: "Банковский перевод",
  card: "Карта",
  qr: "QR-платёж",
} as const;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export const EXPENSE_CATEGORIES = {
  rent: "Аренда",
  salary: "Зарплаты",
  ads: "Реклама",
  internet: "Интернет",
  bank_fee: "Банковские комиссии",
  office: "Офисные расходы",
  other: "Другое",
} as const;
export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;

export const TICKET_STATUSES = {
  booked: "Забронирован",
  awaiting_payment: "Ожидает оплаты",
  issued: "Выписан",
  exchanged: "Обменян",
  refunded: "Возвращён",
  cancelled: "Отменён",
} as const;
export type TicketStatus = keyof typeof TICKET_STATUSES;

export const PARTNER_SCHEDULE_TYPES = {
  on_booking: "В день бронирования",
  days_before_trip: "За N дней до поездки",
  after_client_payment: "После оплаты клиентом",
  weekly: "Еженедельно",
  semimonthly: "Два раза в месяц",
  monthly: "Ежемесячно",
  custom_date: "Индивидуальная дата",
} as const;
export type PartnerScheduleType = keyof typeof PARTNER_SCHEDULE_TYPES;

export const SALE_STATUSES = {
  active: "Активна",
  cancelled: "Отменена",
} as const;

// Navigation (section => owner-only?)
export interface NavItem {
  href: string;
  label: string;
  ownerOnly?: boolean;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Главная", icon: "home" },
  { href: "/sales", label: "Продажи", icon: "cart" },
  { href: "/clients", label: "Клиенты", icon: "users" },
  { href: "/payments", label: "Платежи", icon: "cash" },
  { href: "/partners", label: "Партнёры", icon: "handshake" },
  { href: "/tickets", label: "Авиабилеты", icon: "plane" },
  { href: "/debts/clients", label: "Долги клиентов", icon: "debt" },
  { href: "/debts/partners", label: "Долги партнёрам", icon: "debt" },
  { href: "/finance", label: "Финансы", icon: "chart", ownerOnly: true },
  { href: "/expenses", label: "Расходы", icon: "minus", ownerOnly: true },
  { href: "/calendar", label: "Календарь", icon: "calendar" },
  { href: "/staff", label: "Сотрудники", icon: "badge", ownerOnly: true },
  { href: "/reports", label: "Отчёты", icon: "report", ownerOnly: true },
  { href: "/settings", label: "Настройки", icon: "gear", ownerOnly: true },
];

export const DEFAULT_CURRENCIES = [
  { code: "USD", name: "Доллар США", symbol: "$", isBase: true },
  { code: "VND", name: "Вьетнамский донг", symbol: "₫", isBase: false },
  { code: "EUR", name: "Евро", symbol: "€", isBase: false },
];
