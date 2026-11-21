import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Snowfall } from '@/components/Snowfall';
import { toast } from 'sonner';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import logoHat from '@/assets/logo-hat.png';

const authSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Update mode if URL param changes
  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'signup');
  }, [searchParams]);

  // Direct checkout function that uses a provided access token
  const triggerCheckout = async (accessToken: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout. Please try again from the dashboard.');
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const shouldRedirectToSubscribe = searchParams.get('redirect') === 'subscribe';

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Welcome back!');
        
        if (shouldRedirectToSubscribe) {
          // Get fresh session and trigger checkout
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await triggerCheckout(session.access_token);
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Account created! Redirecting to checkout...');
        
        if (shouldRedirectToSubscribe) {
          // Get fresh session and trigger checkout
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await triggerCheckout(session.access_token);
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      <Snowfall />
      
      <Card className="w-full max-w-md relative z-10 storybook-card">
        <CardHeader className="text-center">
          <img src={logoHat} alt="Call Santa" width={1024} height={1024} loading="lazy" className="w-28 mx-auto mb-4 animate-float-gentle" />
          <CardTitle className="text-3xl font-display text-foreground">
            {isLogin ? 'Welcome Back!' : 'Join Call Santa'}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-body">
            {isLogin 
              ? 'Sign in to call Santa' 
              : 'Create an account to start calling Santa'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {/* Privacy consent for signup */}
            {!isLogin && (
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={agreedToPrivacy}
                  onCheckedChange={(checked) => setAgreedToPrivacy(checked === true)}
                  className="mt-1"
                />
                <label htmlFor="privacy" className="text-sm text-muted-foreground font-body leading-relaxed">
                  I agree to the{' '}
                  <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/terms" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    Terms of Use
                  </a>
                </label>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg py-6"
              disabled={isLoading || (!isLogin && !agreedToPrivacy)}
            >
              {isLoading ? '...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 font-body underline"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
          
          <p className="mt-6 text-center text-sm text-muted-foreground font-body">
            3 free calls included, then $30/mo Season Pass
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
