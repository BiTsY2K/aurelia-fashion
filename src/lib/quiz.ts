import type { Product } from '@/types';

export type QuizAnswers = Record<string, string | string[]>;

export interface QuizOption {
  value: string;
  label: string;
  hint?: string;
  /** Tags this answer favours when ranking products. */
  tags?: string[];
}

export interface QuizStep {
  id: string;
  question: string;
  help?: string;
  multi?: boolean;
  /** Show this step only when it applies to earlier answers. */
  when?: (answers: QuizAnswers) => boolean;
  options: QuizOption[];
}

const forKids = (a: QuizAnswers) => a.for === 'kids';

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'for',
    question: 'Who are we dressing?',
    options: [
      { value: 'women', label: 'Me', hint: 'Women’s couture', tags: ['women'] },
      { value: 'kids', label: 'My little girl', hint: 'Girls’ ethnic & party wear', tags: ['kids'] },
    ],
  },
  {
    id: 'occasion',
    question: 'What’s the occasion?',
    help: 'Pick every event you’re shopping for.',
    multi: true,
    options: [
      { value: 'wedding', label: 'Wedding & bridal', hint: 'The big day and its ceremonies', tags: ['wedding', 'bridal', 'lehenga', 'heavy', 'pavadai'] },
      { value: 'festive', label: 'Festive & puja', hint: 'Diwali, Navratri, family functions', tags: ['festive', 'silk', 'saree', 'ethnic'] },
      { value: 'reception', label: 'Reception & cocktail', hint: 'Evenings with a little drama', tags: ['reception', 'cocktail', 'gown', 'evening', 'party'] },
      { value: 'day', label: 'Day functions', hint: 'Mehendi, haldi, brunches', tags: ['day', 'light', 'organza', 'pastel', 'frock'] },
    ],
  },
  {
    id: 'silhouette',
    question: 'Which silhouette feels most like you?',
    when: (a) => !forKids(a),
    options: [
      { value: 'drape', label: 'Draped', hint: 'The timeless saree', tags: ['saree', 'drape'] },
      { value: 'flared', label: 'Flared', hint: 'Lehengas and anarkalis', tags: ['lehenga', 'anarkali', 'flared'] },
      { value: 'flowing', label: 'Flowing', hint: 'Gowns that move with you', tags: ['gown', 'flowing'] },
      { value: 'fusion', label: 'Fusion', hint: 'Capes, jackets, co-ords', tags: ['indo-western', 'fusion', 'cape', 'jacket'] },
    ],
  },
  {
    id: 'palette',
    question: 'Which palette do you reach for?',
    options: [
      { value: 'jewel', label: 'Jewel tones', hint: 'Rani, ruby, emerald, aubergine', tags: ['jewel', 'red', 'purple', 'green'] },
      { value: 'pastel', label: 'Soft pastels', hint: 'Blush, sage, powder', tags: ['pastel', 'sage', 'pink', 'light'] },
      { value: 'ivory-gold', label: 'Ivory & gold', hint: 'Chikankari, zari, tissue', tags: ['ivory', 'gold', 'chikankari', 'white'] },
      { value: 'noir', label: 'Noir', hint: 'Black with metallic accents', tags: ['black', 'evening'] },
    ],
  },
  {
    id: 'size',
    question: 'What size do you usually take?',
    help: 'Don’t worry if you’re between sizes — every piece can be tailored.',
    when: (a) => !forKids(a),
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => ({ value: s, label: s })),
  },
  {
    id: 'size',
    question: 'How old is she?',
    help: 'We cut with extra seam allowance so a piece can grow with her.',
    when: forKids,
    options: ['1-2Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'].map((s) => ({ value: s, label: s.replace('Y', ' yrs') })),
  },
];

/** The steps that apply given the answers so far. */
export const visibleSteps = (answers: QuizAnswers) => QUIZ_STEPS.filter((s) => !s.when || s.when(answers));

export interface StyleProfile {
  answers: QuizAnswers;
  size: string;
  tags: string[];
  completedAt: number;
}

const asArray = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

/** Collapses answers into a weighted tag set plus the shopper's size. */
export function buildProfile(answers: QuizAnswers): StyleProfile {
  const tags: string[] = [];
  for (const step of visibleSteps(answers)) {
    for (const value of asArray(answers[step.id])) {
      const option = step.options.find((o) => o.value === value);
      if (option?.tags) tags.push(...option.tags);
    }
  }
  return {
    answers,
    size: (answers.size as string) ?? '',
    tags: [...new Set(tags)],
    completedAt: Date.now(),
  };
}

/**
 * Ranks products against a profile. Scores tag overlap, then boosts pieces
 * actually in stock in the shopper's size — a recommendation they can't buy is noise.
 */
export function rankForProfile(products: Product[], profile: StyleProfile): Product[] {
  const scored = products.map((product) => {
    const haystack = [
      ...product.tags,
      ...(product.occasions ?? []),
      product.collection ?? '',
      product.category,
      product.subcategory,
      ...product.variants.map((v) => v.name),
    ].map((t) => t.toLowerCase());

    // Never recommend women's pieces to a kids' profile, or the other way round.
    const audience = profile.answers.for;
    if (audience && product.category !== audience) return { product, score: -100 };

    let score = profile.tags.reduce((sum, tag) => (haystack.includes(tag.toLowerCase()) ? sum + 3 : sum), 0);

    const stockedInSize =
      profile.size &&
      Object.values(product.sizesStock).some(
        (sizes) => ((sizes as Record<string, number>)[profile.size] ?? 0) > 0,
      );
    if (stockedInSize || product.madeToOrder) score += 4;
    if (product.featured) score += 1;

    return { product, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || (b.product.rating ?? 0) - (a.product.rating ?? 0))
    .map((s) => s.product);
}

/** Short human summary of the profile, shown above the personalized storefront. */
export function describeProfile(profile: StyleProfile): string {
  const step = (id: string) => visibleSteps(profile.answers).find((s) => s.id === id);
  const labels = (id: string) =>
    asArray(profile.answers[id])
      .map((v) => step(id)?.options.find((o) => o.value === v)?.label)
      .filter(Boolean);

  const occasions = labels('occasion');
  const silhouette = labels('silhouette')[0];
  const palette = labels('palette')[0];

  const parts: string[] = [];
  if (silhouette) parts.push(`${silhouette.toLowerCase()} silhouettes`);
  if (palette) parts.push(palette.toLowerCase());
  if (occasions.length) parts.push(`for ${occasions.join(' and ').toLowerCase()}`);

  const who = profile.answers.for === 'kids' ? 'For her, we’re thinking' : 'You lean toward';
  return parts.length ? `${who} ${parts.join(', ')}.` : 'Here’s a selection picked for you.';
}
