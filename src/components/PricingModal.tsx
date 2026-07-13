import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Sparkles, Zap, Rocket } from 'lucide-react';
import { PLANS, Plan, BillingPeriod, createCheckout } from '@/lib/billing';
import { toast } from 'sonner';

interface PricingModalProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan:  Plan;
  reason?:      string;
}

const ICONS: Record<Plan, typeof Sparkles> = {
  free:   Sparkles,
  growth: Zap,
  scale:  Rocket,
};

const PricingModal = ({ open, onOpenChange, currentPlan, reason }: PricingModalProps) => {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');
  const [loading, setLoading] = useState<Plan | null>(null);

  const upgrade = async (plan: Plan) => {
    if (plan === 'free' || plan === currentPlan) return;
    setLoading(plan);
    try {
      const url = await createCheckout({ type: 'subscription', plan, billing });
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start checkout');
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Choose a plan</DialogTitle>
          {reason && <p className="text-sm text-muted-foreground mt-1">{reason}</p>}
        </DialogHeader>

        {/* ── Billing period toggle ──────────────────────────── */}
        <div className="flex items-center justify-center mt-2">
          <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-1">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                billing === 'yearly'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="bg-green-500/15 text-green-700 dark:text-green-400 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* ── Plan cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {(Object.entries(PLANS) as [Plan, (typeof PLANS)[Plan]][]).map(([key, plan]) => {
            const Icon      = ICONS[key];
            const isCurrent = key === currentPlan;
            const pricing   = plan[billing];
            const isHigher  = (currentPlan === 'free' && key !== 'free') ||
                              (currentPlan === 'growth' && key === 'scale');

            return (
              <div
                key={key}
                className={`rounded-xl border-2 p-5 flex flex-col gap-3 transition-colors ${
                  isCurrent ? 'border-primary bg-accent/30' : 'border-border'
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold">{plan.label}</span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                    {isHigher && !isCurrent && (
                      <Badge variant="secondary" className={`text-xs border ${plan.badge}`}>
                        {key === 'scale' ? 'Best value' : 'Popular'}
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-0.5">
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold tracking-tight">
                        {pricing.perMonth === '$0' ? '$0' : `$${pricing.perMonth.replace('$', '')}`}
                      </span>
                      {pricing.perMonth !== '$0' && (
                        <span className="text-sm text-muted-foreground mb-1">/mo</span>
                      )}
                    </div>

                    {/* Yearly sub-label */}
                    {billing === 'yearly' && 'billed' in pricing && pricing.billed && (
                      <p className="text-xs text-muted-foreground">{pricing.billed}</p>
                    )}
                    {billing === 'yearly' && 'savings' in pricing && pricing.savings && (
                      <p className="text-xs font-medium text-green-600 dark:text-green-500">
                        {pricing.savings}
                      </p>
                    )}
                    {billing === 'monthly' && pricing.perMonth !== '$0' && (
                      <p className="text-xs text-muted-foreground">billed monthly</p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent || loading !== null || key === 'free'}
                  onClick={() => upgrade(key)}
                  className="w-full"
                >
                  {loading === key ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting…</>
                  ) : isCurrent ? (
                    'Current plan'
                  ) : key === 'free' ? (
                    'Free plan'
                  ) : (
                    `Upgrade to ${plan.label}`
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-1">
          Secure payment via Paddle · Cancel anytime · No hidden fees
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
