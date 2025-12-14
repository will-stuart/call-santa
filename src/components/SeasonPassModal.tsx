import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { Crown, Check } from "lucide-react";
import { toast } from "sonner";

interface SeasonPassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customMessage?: string;
}

const benefits = [
  "30 calls per month",
  "100 minutes of talk time",
  "Full Elf Dossier customization",
  "Multiple people supported",
  "Safe & family-friendly",
];

export const SeasonPassModal = ({ open, onOpenChange, customMessage }: SeasonPassModalProps) => {
  const { subscribe } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    toast.info("Taking you to checkout...");
    try {
      await subscribe();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground font-display flex items-center gap-2">
            <Crown className="h-5 w-5 text-accent" />
            Season Pass
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {customMessage || "Unlock the full Call Santa experience"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Price */}
          <div className="text-center py-2">
            <span className="text-3xl font-display font-bold text-foreground">$30</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          {/* Benefits */}
          <ul className="space-y-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm font-body text-foreground">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-display"
            >
              {isLoading ? "Loading..." : "Get Your Season Pass 🎫"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeasonPassModal;
