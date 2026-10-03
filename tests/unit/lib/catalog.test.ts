import { describe, expect, it } from 'vitest';
import {
  CUSTOM_SIZE,
  DEFAULT_CATEGORIES,
  MEASUREMENT_FIELDS,
  SIZE_GUIDES,
  SIZE_SETS,
  buildTree,
  departmentOf,
  findCategory,
  isActive,
  isAvailable,
  sizeSetFor,
  sizesFor,
  totalStock,
} from '@/lib/catalog';
import type { Category, Product } from '@/types';

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'p', sku: 'AUR-T-1', name: 'Test', slug: 'test', price: 1000, currency: 'INR',
  description: '', category: 'women', subcategory: 'sarees', tags: [], fabricCare: '',
  variants: [{ name: 'Red', hex: '#f00', images: [] }],
  sizesStock: {},
  ...overrides,
});

const cat = (id: string, parentId: string | null, order: number, active = true): Category => ({
  id, name: id, slug: id, parentId, order, active,
});

describe('buildTree', () => {
  it('builds Women and Kids departments from the defaults and hides inactive Men', () => {
    const tree = buildTree(DEFAULT_CATEGORIES);
    expect(tree.map((d) => d.slug)).toEqual(['women', 'kids']);
    expect(tree[0].children.map((c) => c.slug)).toEqual(['sarees', 'lehengas', 'gowns', 'indo-western']);
    expect(tree[1].children.map((c) => c.slug)).toEqual(['girls-ethnic', 'frocks', 'party-wear']);
  });

  it('includes inactive branches when asked (admin view)', () => {
    const tree = buildTree(DEFAULT_CATEGORIES, { includeInactive: true });
    expect(tree.map((d) => d.slug)).toEqual(['women', 'kids', 'men']);
  });

  it('sorts by order, then by name', () => {
    const tree = buildTree([cat('b', null, 2), cat('z', null, 1), cat('a', null, 2)]);
    expect(tree.map((d) => d.id)).toEqual(['z', 'a', 'b']);
  });

  it('drops the children of an inactive parent along with it', () => {
    const tree = buildTree([cat('dept', null, 1, false), cat('child', 'dept', 1)]);
    expect(tree).toEqual([]);
  });
});

describe('findCategory / departmentOf', () => {
  it('finds by slug and returns undefined for unknown or empty slugs', () => {
    expect(findCategory(DEFAULT_CATEGORIES, 'lehengas')?.name).toBe('Lehengas');
    expect(findCategory(DEFAULT_CATEGORIES, 'nope')).toBeUndefined();
    expect(findCategory(DEFAULT_CATEGORIES, null)).toBeUndefined();
  });

  it('walks a sub-category up to its department', () => {
    const frocks = findCategory(DEFAULT_CATEGORIES, 'frocks')!;
    expect(departmentOf(DEFAULT_CATEGORIES, frocks).slug).toBe('kids');
  });

  it('returns a department unchanged', () => {
    const women = findCategory(DEFAULT_CATEGORIES, 'women')!;
    expect(departmentOf(DEFAULT_CATEGORIES, women)).toBe(women);
  });

  it('terminates on a parent cycle instead of looping forever', () => {
    const cyclic = [cat('a', 'b', 1), cat('b', 'a', 1)];
    expect(() => departmentOf(cyclic, cyclic[0])).not.toThrow();
  });
});

describe('sizes', () => {
  it('uses the department scale', () => {
    expect(sizesFor(product({ category: 'women' }))).toEqual(SIZE_SETS.women);
    expect(sizesFor(product({ category: 'kids' }))).toEqual(SIZE_SETS.kids);
  });

  it('lets an explicit sizeSet override the department', () => {
    expect(sizeSetFor(product({ category: 'women', sizeSet: 'kids' }))).toBe('kids');
  });

  it('falls back to women for an unknown department', () => {
    expect(sizeSetFor(product({ category: 'accessories' }))).toBe('women');
  });

  it('keeps the size guide rows and measurement forms in step with the size scales', () => {
    for (const set of ['women', 'kids', 'men'] as const) {
      expect(SIZE_GUIDES[set].rows.map((r) => r[0])).toEqual(SIZE_SETS[set]);
      expect(MEASUREMENT_FIELDS[set].length).toBeGreaterThan(0);
    }
    expect(SIZE_SETS.women).not.toContain(CUSTOM_SIZE);
  });
});

describe('status and availability', () => {
  it('treats a missing status as active', () => {
    expect(isActive(product())).toBe(true);
    expect(isActive(product({ status: 'active' }))).toBe(true);
    expect(isActive(product({ status: 'draft' }))).toBe(false);
    expect(isActive(product({ status: 'archived' }))).toBe(false);
  });

  it('sums stock across colours and sizes', () => {
    expect(totalStock(product({ sizesStock: { Red: { S: 2, M: 3 }, Blue: { L: 1 } } }))).toBe(6);
    expect(totalStock(product({ sizesStock: {} }))).toBe(0);
  });

  it('is available with stock, or when made to order even with none', () => {
    expect(isAvailable(product({ sizesStock: { Red: { M: 1 } } }))).toBe(true);
    expect(isAvailable(product({ sizesStock: { Red: { M: 0 } } }))).toBe(false);
    expect(isAvailable(product({ madeToOrder: true }))).toBe(true);
  });
});
