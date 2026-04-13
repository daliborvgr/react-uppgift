import { calculateAddonCost, calculateDelayFee, calculatePrices, getStartedDays } from './pricing';

describe('pricing utilities', () => {
  it('calculates started days correctly', () => {
    expect(getStartedDays('2024-04-01T10:00:00', '2024-04-02T09:59:59')).toBe(1);
    expect(getStartedDays('2024-04-01T10:00:00', '2024-04-02T10:00:00')).toBe(1);
    expect(getStartedDays('2024-04-01T10:00:00', '2024-04-03T10:00:01')).toBe(3);
  });

  it('calculates addon cost per rental day', () => {
    expect(calculateAddonCost(['GPS', 'Baby seat'], 2)).toBe(160);
  });

  it('applies delay fee only when actual return is after planned end', () => {
    expect(calculateDelayFee('2024-04-10T12:00:00', '2024-04-10T11:00:00')).toBe(0);
    expect(calculateDelayFee('2024-04-10T12:00:00', '2024-04-12T09:00:00')).toBe(250);
  });

  it('computes full price breakdown correctly', () => {
    const car = { id: 5, category: 'Premium', dayPrice: 900, kmPrice: 4, premiumFee: 300 };
    const result = calculatePrices(car, 3, 150, ['GPS', 'Insurance'], '2024-04-10T12:00:00', '2024-04-12T14:00:00');
    expect(result.basePrice).toBe(900 * 3 + 4 * 150);
    expect(result.premiumCost).toBe(300 * 3);
    expect(result.addonsCost).toBe(45 * 3 + 120 * 3);
    expect(result.delayFee).toBe(500);
    expect(result.finalPrice).toBe(result.basePrice + result.premiumCost + result.addonsCost + result.delayFee);
  });
});
