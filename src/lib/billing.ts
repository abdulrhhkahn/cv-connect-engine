import { supabase } from './supabase';

// ── Billing period ────────────────────────────────────────────
export type BillingPeriod = 'monthly' | 'yearly';

// ── Plan definitions ─────────────────────────────────────────
//   Monthly:  Growth $49/mo  |  Scale $149/mo
//   Yearly:   Growth $470/yr ($39/mo, save $118)
//             Scale $1,430/yr ($119/mo, save $358)
export const PLANS = {
  free: {
    label:    'Free',
    jobLimit: 2,
    badge:    'bg-secondary text-secondary-foreground',
    ring:     'border-border',
    monthly:  { price: '$0',         perMonth: '$0',   billed: null,         savings: null },
    yearly:   { price: '$0',         perMonth: '$0',   billed: null,         savings: null },
    features: [
      '2 active job postings',
      'AI job description generator',
      'Basic applicant review',
      'Standard search visibility',
    ],
  },
  growth: {
    label:    'Growth',
    jobLimit: 10,
    badge:    'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    ring:     'border-blue-500',
    monthly:  { price: '$49/mo',      perMonth: '$49',  billed: null,         savings: null },
    yearly:   { price: '$470/yr',     perMonth: '$39',  billed: 'billed $470/yr', savings: 'Save $118/yr' },
    features: [
      '10 active job postings',
      'Full candidate profiles',
      '1 featured listing/month',
      'Priority email support',
    ],
  },
  scale: {
    label:    'Scale',
    jobLimit: Infinity,
    badge:    'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    ring:     'border-purple-500',
    monthly:  { price: '$149/mo',     perMonth: '$149', billed: null,         savings: null },
    yearly:   { price: '$1,430/yr',   perMonth: '$119', billed: 'billed $1,430/yr', savings: 'Save $358/yr' },
    features: [
      'Unlimited job postings',
      'Unlimited featured listings',
      'Advanced match analytics',
      'Dedicated account support',
    ],
  },
} as const;

export type Plan = keyof typeof PLANS;

// ── Featured listing options ──────────────────────────────────
export const FEATURED_OPTIONS = [
  { days: 7,  price: '$29', label: '7 days',  description: 'Top of results for 1 week' },
  { days: 30, price: '$59', label: '30 days', description: 'Top of results for 1 month' },
] as const;

// ── Helpers ───────────────────────────────────────────────────
export function canAddJob(plan: Plan, activeJobCount: number): boolean {
  return activeJobCount < PLANS[plan].jobLimit;
}

export function isFeaturedActive(job: { featured?: boolean; featuredUntil?: Date | null }): boolean {
  return !!(job.featured && job.featuredUntil && new Date(job.featuredUntil) > new Date());
}

// ── Stripe Checkout ───────────────────────────────────────────
export async function createCheckout(params: {
  type:     'subscription' | 'featured';
  plan?:    Plan;
  billing?: BillingPeriod;
  jobId?:   string;
  days?:    number;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { ...params, returnUrl: window.location.href },
  });
  if (error) throw new Error(error.message ?? 'Checkout failed');
  if (!data?.url) throw new Error('No checkout URL returned from server');
  return data.url as string;
}
