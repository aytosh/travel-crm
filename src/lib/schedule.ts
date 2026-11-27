import type { PartnerScheduleType } from "./constants";

interface Ctx {
  saleDate: Date;
  tripDate?: Date | null;
}

/**
 * Compute the due date for paying a partner based on the agreed schedule.
 * Returns null when the due date depends on an external event
 * (e.g. "after client fully pays") and cannot be fixed up front.
 */
export function computePartnerDueDate(
  type: string,
  value: string | null | undefined,
  ctx: Ctx,
): Date | null {
  const { saleDate, tripDate } = ctx;
  switch (type as PartnerScheduleType) {
    case "on_booking":
      return saleDate;
    case "days_before_trip": {
      if (!tripDate) return null;
      const days = parseInt(value ?? "0", 10) || 0;
      const d = new Date(tripDate);
      d.setDate(d.getDate() - days);
      return d;
    }
    case "after_client_payment":
      return null;
    case "weekly": {
      const d = new Date(saleDate);
      d.setDate(d.getDate() + 7);
      return d;
    }
    case "semimonthly": {
      const d = new Date(saleDate);
      if (d.getDate() < 15) {
        d.setDate(15);
      } else {
        d.setMonth(d.getMonth() + 1, 1);
      }
      return d;
    }
    case "monthly": {
      const d = new Date(saleDate.getFullYear(), saleDate.getMonth() + 1, 1);
      return d;
    }
    case "custom_date": {
      if (!value) return null;
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    default:
      return saleDate;
  }
}
