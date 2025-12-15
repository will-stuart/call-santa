import { Snowfall } from "@/components/Snowfall";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Phone, Sparkles, Heart, Shield, Star } from "lucide-react";
import Header from "@/components/Header";
import santaImage from "@/assets/santa.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <Header />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          <img src={santaImage} alt="Santa" className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6" />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
            Don't just talk to Santa.
            <br />
            <span className="text-primary">Talk to their Santa.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body max-w-2xl mx-auto mb-8">
            The first conversational voice platform that gives Santa a memory. Create an "Elf Dossier" and watch your
            child's face light up when Santa knows their pet's name, their teacher, and exactly what they wished for.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-xl py-7 px-10"
            >
              <Phone className="mr-2 h-5 w-5" />
              Start Your Free Call
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground font-body">
            ✨ 3 free calls included • No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-4">
            Irrefutable Proof of Magic
          </h2>
          <p className="text-muted-foreground text-center font-body max-w-2xl mx-auto mb-12">
            Every parent knows the struggle of keeping the magic alive. Most Santa apps are generic recordings.
            Call Santa creates real-time, two-way conversations powered by hyper-realistic voice technology.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">The Elf Dossier</h3>
                <p className="text-muted-foreground font-body text-sm">
                  A simple form where you input the "Magic Details" — pet names, best friends, recent achievements, and
                  even those "naughty" moments. Santa weaves them naturally into conversation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">Hyper-Real Voice</h3>
                <p className="text-muted-foreground font-body text-sm">
                  Advanced voice technology ensures Santa laughs, pauses, and responds instantly — eliminating the
                  robotic "thinking" silence that ruins the illusion.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">Real Conversations</h3>
                <p className="text-muted-foreground font-body text-sm">
                  Not pre-recorded. Not scripted. Your child can ask questions, share stories, and have a genuine
                  back-and-forth conversation with Santa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">The Season Pass</h2>
          <p className="text-muted-foreground font-body mb-12">
            Unlimited holiday magic through December 31st
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="bg-card/80 backdrop-blur border-border h-full">
              <CardContent className="pt-8 pb-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">Free Trial</h3>
                <div className="text-4xl font-display font-bold text-foreground mb-4">$0</div>
                <ul className="text-left space-y-3 text-muted-foreground font-body text-sm mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" /> 3 calls with Santa
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" /> 3 minutes total
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" /> 1 Santa Knowledge entry
                  </li>
                </ul>
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth?mode=signup")}
                  className="w-full border-border text-foreground hover:bg-primary/10 hover:text-foreground font-display mt-auto"
                >
                  Try Free
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur border-primary/50 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-display px-3 py-1 rounded-bl-lg">
                BEST VALUE
              </div>
              <CardContent className="pt-8 pb-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">Season Pass</h3>
                <div className="text-4xl font-display font-bold text-foreground mb-1">$30</div>
                <p className="text-sm text-muted-foreground mb-4">per month</p>
                <ul className="text-left space-y-3 text-muted-foreground font-body text-sm mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" /> 30 calls per month
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" /> 100 minutes per month
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" /> No cap on Santa knowledge
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" /> Multiple people supported
                  </li>
                </ul>
                <Button
                  onClick={() => navigate("/auth?mode=signup&redirect=subscribe")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display mt-auto"
                >
                  Get Your Season Pass
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl mb-2">🎄</p>
          <p className="text-muted-foreground font-body text-sm">Call Santa — Preserving the magic of Christmas</p>
          <p className="text-muted-foreground/50 font-body text-xs mt-4">
            © 2024 Call Santa. Made with ❤️ for families everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
