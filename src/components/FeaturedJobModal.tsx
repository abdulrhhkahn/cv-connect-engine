import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Loader2, TrendingUp, Clock, Zap } from 'lucide-react';
import { FEATURED_OPTIONS, createCheckout, isFeaturedActive } from '@/lib/billing';
import { Job } from '@/lib/types';
import { toast } from 'sonner';

interface FeaturedJobModalProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  job:          Job | null;
}

const FeaturedJobModal = ({ open, onOpenChange, job }: FeaturedJobModalProps) => {
  const [selected, setSelected] = useState<number>(7);
  const [loading, setLoading]   = useState(false);

  const handlePurchase = async () => {
    if (!job) return;
    setLoading(true);
    try {
      const url = await createCheckout({ type: 'featured', jobId: job.id, days: selected });
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start checkout');
      setLoading(false);
    }
  };

  if (!job) return null;

  const currentlyFeatured = isFeaturedActive(job);
  const selectedOption    = FEATURED_OPTIONS.find((o) => o.days === selected)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Feature this job
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job preview */}
          <div className="bg-secondary/50 rounded-lg px-4 py-3">
            <p className="font-medium text-sm">{job.title}</p>
            <p className="text-xs text-muted-foreground">{job.location} · {job.type}</p>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-sm font-medium">What you get</p>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
                Pinned to the top of all job search results
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                Gold "Featured" badge increases click-through rate
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                Stand out from hundreds of standard listings
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                Automatically expires — no manual cancellation
              </div>
            </div>
          </div>

          {/* Duration picker */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURED_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setSelected(opt.days)}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  selected === opt.days
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-bold text-lg">{opt.price}</p>
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>

          {currentlyFeatured && job.featuredUntil && (
            <div className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
              Currently featured until{' '}
              <strong>{new Date(job.featuredUntil).toLocaleDateString()}</strong>.
              Purchasing extends from today.
            </div>
          )}

          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Redirecting to payment…</>
            ) : (
              <><Star className="h-4 w-4" />Pay {selectedOption.price} — Feature for {selected} days</>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Secure one-time payment via Stripe · No subscription
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeaturedJobModal;
