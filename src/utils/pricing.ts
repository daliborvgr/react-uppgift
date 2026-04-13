import { AddonKey, Car } from '../types';

const ADDON_PRICES: Record<AddonKey, number> = {
  GPS: 45,
  'Baby seat': 35,
  'Extra driver': 50,
  Insurance: 120,
};

const DELAY_FEE_PER_DAY = 250;

export function getStartedDays(start: string, end: string): number {
  const from = new Date(start);
  const to = new Date(end);
  const msPerDay = 24 * 60 * 60 * 1000;
  if (to <= from) {
    return 1;
  }
  return Math.ceil((to.getTime() - from.getTime()) / msPerDay);
}

export function calculateAddonCost(addons: AddonKey[], rentalTime: number): number {
  return addons.reduce((sum, addon) => sum + ADDON_PRICES[addon] * rentalTime, 0);
}

export function calculateDelayFee(plannedEnd: string, actualEnd: string): number {
  const delayDays = getStartedDays(plannedEnd, actualEnd) - 1;
  return delayDays > 0 ? delayDays * DELAY_FEE_PER_DAY : 0;
}

export function calculatePrices(car: Car, rentalTime: number, mileageDifference: number, addons: AddonKey[], plannedEnd: string, actualEnd: string): {
  basePrice: number;
  premiumCost: number;
  addonsCost: number;
  delayFee: number;
  finalPrice: number;
} {
  const basePrice = car.dayPrice * rentalTime + car.kmPrice * mileageDifference;
  const premiumCost = car.premiumFee * rentalTime;
  const addonsCost = calculateAddonCost(addons, rentalTime);
  const delayFee = calculateDelayFee(plannedEnd, actualEnd);
  const finalPrice = Number((basePrice + premiumCost + addonsCost + delayFee).toFixed(2));

  return { basePrice, premiumCost, addonsCost, delayFee, finalPrice };
}

export function formatCurrency(value: number): string {
  return `${value.toFixed(2)} kr`;
}
