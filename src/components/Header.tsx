import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { SeasonPassModal } from "@/components/SeasonPassModal";
import { LogIn, LogOut, Settings, Users, Crown } from "lucide-react";

interface HeaderProps {
  showAuthActions?: boolean;
}

const Header = ({ showAuthActions = false }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <button 
          onClick={() => navigate(user ? "/dashboard" : "/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">🎅</span>
          <span className="font-display font-bold text-foreground">Call Santa</span>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {showAuthActions && user ? (
            <>
              {isPremium ? (
                <span className="bg-accent text-accent-foreground text-xs font-display px-3 py-1 rounded-full mr-2">
                  ✨ Season Pass
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-accent hover:text-accent hover:bg-accent/10 font-display text-xs gap-1"
                >
                  <Crown className="h-4 w-4" /> Upgrade
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/children')}
                className="text-foreground hover:bg-card hover:text-foreground"
                title="Elf Dossier"
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="text-foreground hover:bg-card hover:text-foreground"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-foreground hover:bg-card hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-foreground hover:bg-primary/10 hover:text-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>

      <SeasonPassModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </header>
  );
};

export default Header;
