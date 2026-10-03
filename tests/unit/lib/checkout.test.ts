import { describe, expect, it } from 'vitest';
import { FREE_SHIPPING_AT, computeTotals, toMinorUnit } from '@/lib/checkout';

const line = (price: number, quantity = 1) => ({ price, quantity });

describe('computeTotals', () => {
  it('charges nothing for an empty cart', () => {
    expect(computeTotals([])).toEqual({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  });

  it('adds flat shipping below the free-shipping threshold', () => {
    expect(computeTotals([line(3200)])).toEqual({ subtotal: 3200, shipping: 150, tax: 0, total: 3350 });
  });

  it('ships free at exactly the threshold and above', () => {
    expect(computeTotals([line(FREE_SHIPPING_AT)]).shipping).toBe(0);
    expect(computeTotals([line(38500)]).total).toBe(38500);
  });

  it('multiplies price by quantity across lines', () => {
    expect(computeTotals([line(2800, 2), line(3200)]).subtotal).toBe(8800);
  });

  it('adds no tax because listed prices include GST', () => {
    expect(computeTotals([line(125000)]).tax).toBe(0);
  });
});

describe('toMinorUnit', () => {
  it('converts rupees to paise', () => {
    expect(toMinorUnit(38500)).toBe(3850000);
  });

  it('rounds away floating-point noise', () => {
    expect(toMinorUnit(0.1 + 0.2)).toBe(30);
    expect(toMinorUnit(1234.56)).toBe(123456);
  });
});
