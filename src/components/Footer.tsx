import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative z-10 py-6 px-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Security Badge */}
        <Link 
          to="/privacy" 
          className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-display hover:bg-primary/20 transition-colors"
        >
          <Shield className="h-4 w-4" />
          <span>Secure & Zero-Retention</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground font-body">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
