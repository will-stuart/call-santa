import { Snowfall } from "@/components/Snowfall";
import { OrnamentDivider } from "@/components/OrnamentDivider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Phone, Sparkles, Heart, Star, BookOpen, Check } from "lucide-react";
import Header from "@/components/Header";
import logoHat from "@/assets/logo-hat.png";

const HeroStars = () => (
  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
    <Star className="absolute top-[18%] left-[12%] h-4 w-4 text-accent fill-accent/60 animate-twinkle" />
    <Star className="absolute top-[28%] right-[15%] h-3 w-3 text-accent fill-accent/50 animate-twinkle" style={{ animationDelay: "0.8s" }} />
    <Star className="absolute top-[60%] left-[8%] h-3 w-3 text-accent fill-accent/40 animate-twinkle" style={{ animationDelay: "1.6s" }} />
    <Star className="absolute top-[70%] right-[10%] h-4 w-4 text-accent fill-accent/50 animate-twinkle" style={{ animationDelay: "2.4s" }} />
    <Star className="absolute top-[12%] left-[45%] h-2.5 w-2.5 text-accent fill-accent/40 animate-twinkle" style={{ animationDelay: "1.2s" }} />
  </div>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <Header />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16 pt-24">
        <HeroStars />
        <div className="text-center max-w-4xl mx-auto">
          <img
            src={logoHat}
            alt="Call Santa"
            width={1024}
            height={1024}
            className="w-56 md:w-72 mx-auto mb-2 animate-float-gentle drop-shadow-[0_12px_32px_hsl(350_60%_4%/0.6)]"
          />
          <p className="font-script text-2xl md:text-3xl text-accent mb-4">The North Pole is calling…</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
            Don't just talk to Santa.
            <br />
            <span className="text-accent">Talk to </span>
            <span className="font-script text-accent font-normal">their</span>
            <span className="text-accent"> Santa.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body max-w-2xl mx-auto mb-8">
            The first conversational voice platform that gives Santa a memory. Create an "Elf Dossier" and watch your
            child's face light up when Santa knows their pet's name, their teacher, and exactly what they wished for.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-xl py-7 px-10 rounded-full shadow-[0_8px_30px_-6px_hsl(var(--primary)/0.6)]"
            >
              <Phone className="mr-2 h-5 w-5" />
              Start Your Free Call
            </Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground font-body flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            3 free calls included • No credit card required
          </p>
        </div>
      </section>

      <OrnamentDivider />

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="font-script text-2xl text-accent text-center mb-2">How the magic works</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-4">
            Irrefutable Proof of Magic
          </h2>
          <p className="text-muted-foreground text-center font-body max-w-2xl mx-auto mb-12">
            Every parent knows the struggle of keeping the magic alive. Most Santa apps are generic recordings.
            Call Santa creates real-time, two-way conversations powered by hyper-realistic voice technology.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="storybook-card p-6">
              <div className="icon-medallion w-14 h-14 mb-4">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">The Elf Dossier</h3>
              <p className="text-muted-foreground font-body text-sm">
                A simple form where you input the "Magic Details" — pet names, best friends, recent achievements, and
                even those "naughty" moments. Santa weaves them naturally into conversation.
              </p>
            </div>

            <div className="storybook-card p-6">
              <div className="icon-medallion w-14 h-14 mb-4">
                <Phone className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">Hyper-Real Voice</h3>
              <p className="text-muted-foreground font-body text-sm">
                Advanced voice technology ensures Santa laughs, pauses, and responds instantly — eliminating the
                robotic "thinking" silence that ruins the illusion.
              </p>
            </div>

            <div className="storybook-card p-6">
              <div className="icon-medallion w-14 h-14 mb-4">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">Real Conversations</h3>
              <p className="text-muted-foreground font-body text-sm">
                Not pre-recorded. Not scripted. Your child can ask questions, share stories, and have a genuine
                back-and-forth conversation with Santa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <OrnamentDivider />

      {/* Pricing Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-script text-2xl text-accent mb-2">One simple pass</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">The Season Pass</h2>
          <p className="text-muted-foreground font-body mb-12">
            A whole season of holiday magic for the whole family
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="storybook-card p-8 h-full flex flex-col text-left">
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">Free Trial</h3>
              <div className="text-4xl font-display font-bold text-foreground mb-4">$0</div>
              <ul className="space-y-3 text-muted-foreground font-body text-sm mb-6 flex-1">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> 3 calls with Santa
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> 3 minutes total
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> 1 Santa Knowledge entry
                </li>
              </ul>
              <Button
                variant="outline"
                onClick={() => navigate("/auth?mode=signup")}
                className="w-full border-border text-foreground hover:bg-primary/10 hover:text-foreground font-display rounded-full mt-auto"
              >
                Try Free
              </Button>
            </div>

            <div className="storybook-card p-8 h-full flex flex-col text-left relative overflow-hidden border-accent/40 shadow-[0_0_50px_-12px_hsl(var(--accent)/0.4)]">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-display px-3 py-1 rounded-bl-xl">
                BEST VALUE
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">Season Pass</h3>
              <div className="text-4xl font-display font-bold text-foreground mb-1">$30</div>
              <p className="text-sm text-muted-foreground mb-4">per month</p>
              <ul className="space-y-3 text-muted-foreground font-body text-sm mb-6 flex-1">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent fill-accent/40" /> 30 calls per month
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent fill-accent/40" /> 100 minutes per month
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent fill-accent/40" /> No cap on Santa knowledge
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent fill-accent/40" /> Multiple people supported
                </li>
              </ul>
              <Button
                onClick={() => navigate("/auth?mode=signup&redirect=subscribe")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display rounded-full mt-auto shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.6)]"
              >
                Get Your Season Pass
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-script text-2xl text-accent mb-2">Ho ho ho!</p>
          <p className="text-muted-foreground font-body text-sm">Call Santa — Preserving the magic of Christmas</p>
          <p className="text-muted-foreground/50 font-body text-xs mt-4">
            © 2025 Call Santa. Made with love for families everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
