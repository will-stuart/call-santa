import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { Snowfall } from "@/components/Snowfall";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/");
    }
  }, [isSignedIn, isLoaded, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-bounce">🎅</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
            🎅 Northline
          </h1>
          <p className="text-muted-foreground font-body">
            Sign in to talk to Santa
          </p>
        </div>

        <div className="w-full max-w-md">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin" className="font-display">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="font-display">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="flex justify-center">
              <SignIn 
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-card border-border shadow-xl",
                    headerTitle: "text-foreground font-display",
                    headerSubtitle: "text-muted-foreground",
                    formButtonPrimary: "bg-primary hover:bg-primary/90",
                    formFieldInput: "bg-background border-border text-foreground",
                    formFieldLabel: "text-foreground",
                    footerActionLink: "text-primary hover:text-primary/80",
                    identityPreviewText: "text-foreground",
                    identityPreviewEditButton: "text-primary",
                  }
                }}
              />
            </TabsContent>
            <TabsContent value="signup" className="flex justify-center">
              <SignUp 
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-card border-border shadow-xl",
                    headerTitle: "text-foreground font-display",
                    headerSubtitle: "text-muted-foreground",
                    formButtonPrimary: "bg-primary hover:bg-primary/90",
                    formFieldInput: "bg-background border-border text-foreground",
                    formFieldLabel: "text-foreground",
                    footerActionLink: "text-primary hover:text-primary/80",
                  }
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground font-body">
          🎄 1 free call included, then $30 Season Pass 🎄
        </p>
      </div>
    </div>
  );
};

export default Auth;
