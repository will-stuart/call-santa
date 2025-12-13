import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { Snowfall } from '@/components/Snowfall';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const { status, subscriptionEnd, isPremium, isLoading, subscribe, manageSubscription, refresh } = useSubscription();
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      await subscribe();
      toast.success('Redirecting to checkout...');
    } catch (error) {
      toast.error('Failed to start checkout');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleManage = async () => {
    try {
      await manageSubscription();
    } catch (error) {
      toast.error('Failed to open subscription management');
    }
  };

  // Refresh subscription status when page loads (in case returning from Stripe)
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 p-4">
      <Snowfall />
      
      <div className="relative z-10 max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-white mb-6 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-white/95 backdrop-blur shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-800 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Subscription
            </CardTitle>
            <CardDescription>
              Manage your Santa Calls subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : isPremium ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-green-800 font-semibold">Premium Active</p>
                  {subscriptionEnd && (
                    <p className="text-sm text-green-600 mt-1">
                      Renews: {new Date(subscriptionEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <p className="text-center text-gray-600 text-sm">
                  Enjoy unlimited calls to Santa! 🎅
                </p>
                <Button
                  onClick={handleManage}
                  variant="outline"
                  className="w-full"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600 font-medium">Free Plan</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Limited features
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-green-50 border-2 border-red-200 rounded-lg p-4">
                  <h3 className="font-bold text-red-800 text-center mb-2">
                    🎄 Premium Plan - $9.99/month
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Unlimited calls to Santa</li>
                    <li>✓ Personalized conversations</li>
                    <li>✓ Add multiple children</li>
                    <li>✓ Custom context for each child</li>
                  </ul>
                </div>

                <Button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  {isSubscribing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Crown className="w-4 h-4 mr-2" />
                  )}
                  Upgrade to Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
