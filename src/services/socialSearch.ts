export type DurationUnit = "hours" | "days" | "weeks" | "months" | "years";

export interface DurationValue {
  amount: number;
  unit: DurationUnit;
}

export interface SocialSearchPayload {
  query: string[];
  platforms: string[];
  start_date: string;
  end_date: string;
}

export function buildSocialSearchPayload(
  keywords: string[],
  platforms: string[],
  duration: DurationValue
): SocialSearchPayload {
  const endDate = new Date();
  const startDate = new Date();

  switch (duration.unit) {
    case "hours":
      startDate.setHours(startDate.getHours() - duration.amount);
      break;

    case "days":
      startDate.setDate(startDate.getDate() - duration.amount);
      break;

    case "weeks":
      startDate.setDate(startDate.getDate() - duration.amount * 7);
      break;

    case "months":
      startDate.setMonth(startDate.getMonth() - duration.amount);
      break;

    case "years":
      startDate.setFullYear(startDate.getFullYear() - duration.amount);
      break;
  }

  return {
    query: keywords,
    platforms,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  };
}