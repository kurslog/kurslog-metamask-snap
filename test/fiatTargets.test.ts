import { getFiatTargets } from '../src/transaction/fiatTargets';

describe('fiatTargets', () => {
  it('returns Ukraine targets with 3 options', () => {
    const targets = getFiatTargets('ukraine');
    expect(targets).toHaveLength(3);
    expect(targets[0].slug).toBe('visa-mastercard-uah');
    expect(targets[0].needsCity).toBe(false);
    expect(targets[1].slug).toBe('cash-uah');
    expect(targets[1].needsCity).toBe(true);
    expect(targets[2].slug).toBe('cash-usd');
  });

  it('returns Poland targets', () => {
    const targets = getFiatTargets('poland');
    expect(targets).toHaveLength(3);
    expect(targets[0].slug).toBe('visa-mastercard-pln');
  });

  it('returns default (USD cash) for unknown country', () => {
    const targets = getFiatTargets('mars');
    expect(targets).toHaveLength(1);
    expect(targets[0].slug).toBe('cash-usd');
  });
});
