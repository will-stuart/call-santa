import { useEffect, useState } from "react";
import { Snowfall } from "@/components/Snowfall";
import { Button } from "@/components/ui/button";
import { Download, Share, MoreVertical } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
            📱 Install Call Santa
          </h1>

          {isInstalled ? (
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-border">
              <p className="text-xl text-foreground mb-4">✅ App Installed!</p>
              <p className="text-muted-foreground">
                Look for "Call Santa" on your home screen to open the app.
              </p>
              <Button
                className="mt-6"
                onClick={() => (window.location.href = "/")}
              >
                Open App
              </Button>
            </div>
          ) : isIOS ? (
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-border">
              <p className="text-xl text-foreground mb-6">
                Add to your home screen:
              </p>
              <ol className="text-left text-muted-foreground space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <Share className="inline w-5 h-5 text-primary" /> Share
                    button at the bottom of Safari
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm shrink-0">
                    2
                  </span>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm shrink-0">
                    3
                  </span>
                  <span>Tap "Add" to install</span>
                </li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-border">
              <p className="text-xl text-muted-foreground mb-6">
                Install this app on your phone for the best experience!
              </p>
              <Button
                size="lg"
                onClick={handleInstall}
                className="gap-2"
              >
                <Download className="w-5 h-5" />
                Install App
              </Button>
            </div>
          ) : (
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-border">
              <p className="text-xl text-foreground mb-6">
                Add to your home screen:
              </p>
              <ol className="text-left text-muted-foreground space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <MoreVertical className="inline w-5 h-5 text-primary" /> menu
                    button in your browser
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm shrink-0">
                    2
                  </span>
                  <span>Tap "Install app" or "Add to Home Screen"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm shrink-0">
                    3
                  </span>
                  <span>Confirm to install</span>
                </li>
              </ol>
            </div>
          )}

          <Button
            variant="ghost"
            className="mt-8 text-muted-foreground"
            onClick={() => (window.location.href = "/")}
          >
            ← Back to Call Santa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Install;
