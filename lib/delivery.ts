export interface DeliveryZone {
  countries: string[];
  days: number;
}

const zones: DeliveryZone[] = [
  { countries: ['US', 'CA'], days: 3 },
  { countries: ['GB', 'DE', 'FR'], days: 5 },
  { countries: ['default'], days: 7 },
];

export function estimateDelivery(country: string): Date {
  const zone =
    zones.find((z) => z.countries.includes(country)) ||
    zones.find((z) => z.countries.includes('default'))!;
  const date = new Date();
  date.setDate(date.getDate() + zone.days);
  return date;
}

export function formatDelivery(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function getZones(): DeliveryZone[] {
  return zones;
}
