import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useCallLimits } from "@/hooks/useCallLimits";
import { supabase } from "@/integrations/supabase/client";
import { Snowfall } from "@/components/Snowfall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SeasonPassModal } from "@/components/SeasonPassModal";
import { Crown, Star, Loader2, Phone, Clock, BarChart3, BookOpen, Plus, Pencil, Trash2, Lock, ChevronLeft, Ticket } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

interface KnowledgeEntry {
  id: string;
  name: string;
  context: string | null;
}

const MAX_NAME_LENGTH = 50;
const MAX_CONTEXT_LENGTH = 500;
const FREE_KNOWLEDGE_LIMIT = 1;

const Settings = () => {
  const { user } = useAuth();
  const { status, subscriptionEnd, isPremium, subscribe, manageSubscription, isLoading, refresh } = useSubscription();
  const { checkCallLimits, PREMIUM_CALLS_LIMIT, PREMIUM_MINUTES_LIMIT, FREE_CALLS_LIMIT, FREE_MINUTES_LIMIT } = useCallLimits();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [usage, setUsage] = useState<{
    callsUsed: number;
    callsLimit: number;
    minutesUsed: number;
    minutesLimit: number;
  } | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  // Knowledge state
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [formData, setFormData] = useState({ name: "", context: "" });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Refresh subscription status and usage when page loads
  useEffect(() => {
    refresh();
    loadUsage();
    fetchEntries();
  }, [refresh, user]);

  const loadUsage = async () => {
    // Only show loading spinner on initial load (when no data exists)
    if (!usage) {
      setIsLoadingUsage(true);
    }
    try {
      const limits = await checkCallLimits();
      setUsage({
        callsUsed: limits.callsUsed,
        callsLimit: limits.callsLimit,
        minutesUsed: limits.minutesUsed,
        minutesLimit: limits.minutesLimit,
      });
    } catch (error) {
      console.error("Error loading usage:", error);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const fetchEntries = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    if (error) {
      toast.error("Failed to load knowledge");
      console.error(error);
    } else {
      setEntries(data || []);
    }
    setIsLoadingKnowledge(false);
  };

  const handleUpgrade = async () => {
    setIsSubscribing(true);
    try {
      toast.info("Redirecting to checkout...");
      await subscribe();
    } catch (error) {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleManage = async () => {
    try {
      toast.info("Opening subscription management...");
      await manageSubscription();
    } catch (error) {
      toast.error("Failed to open portal. Please try again.");
    }
  };

  // Knowledge handlers
  const handleSave = async () => {
    if (!user || !formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (editingEntry) {
      const { error } = await supabase
        .from("children")
        .update({
          name: formData.name.trim().slice(0, MAX_NAME_LENGTH),
          context: formData.context.trim().slice(0, MAX_CONTEXT_LENGTH) || null,
        })
        .eq("id", editingEntry.id);

      if (error) {
        toast.error("Failed to update");
        console.error(error);
      } else {
        toast.success("Updated!");
        closeModal();
        fetchEntries();
      }
    } else {
      const willBeLocked = !isPremium && entries.length >= FREE_KNOWLEDGE_LIMIT;
      
      const { error } = await supabase.from("children").insert({
        user_id: user.id,
        name: formData.name.trim().slice(0, MAX_NAME_LENGTH),
        context: formData.context.trim().slice(0, MAX_CONTEXT_LENGTH) || null,
      });

      if (error) {
        toast.error("Failed to add entry");
        console.error(error);
      } else {
        if (willBeLocked) {
          toast.success(`${formData.name} added! Upgrade to unlock.`);
          closeModal();
          fetchEntries();
          setTimeout(() => setShowUpgradeModal(true), 300);
        } else {
          toast.success(`${formData.name} added!`);
          closeModal();
          fetchEntries();
        }
      }
    }
  };

  const handleDelete = async (entry: KnowledgeEntry) => {
    const { error } = await supabase.from("children").delete().eq("id", entry.id);

    if (error) {
      toast.error("Failed to delete");
      console.error(error);
    } else {
      toast.success(`${entry.name} removed`);
      fetchEntries();
    }
  };

  const openAddModal = () => {
    setEditingEntry(null);
    setFormData({ name: "", context: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (entry: KnowledgeEntry, index: number) => {
    if (!isPremium && index >= FREE_KNOWLEDGE_LIMIT) {
      toast.error("Upgrade to Season Pass to edit this entry!");
      return;
    }
    setEditingEntry(entry);
    setFormData({ name: entry.name, context: entry.context || "" });
    setIsModalOpen(true);
  };

  const isEntryLocked = (index: number) => {
    return !isPremium && index >= FREE_KNOWLEDGE_LIMIT;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setFormData({ name: "", context: "" });
  };

  const handleNameChange = (value: string) => {
    if (value.length <= MAX_NAME_LENGTH) {
      setFormData({ ...formData, name: value });
    }
  };

  const handleContextChange = (value: string) => {
    if (value.length <= MAX_CONTEXT_LENGTH) {
      setFormData({ ...formData, context: value });
    }
  };

  const callsPercent = usage ? Math.min((usage.callsUsed / usage.callsLimit) * 100, 100) : 0;
  const minutesPercent = usage ? Math.min((usage.minutesUsed / usage.minutesLimit) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <Header showAuthActions />

      <div className="relative z-10 min-h-screen px-4 pb-4 pt-24 md:px-8 md:pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Back to Dashboard */}
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4 font-body text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-7 w-7" />
              Settings
            </h1>
          </div>

          {/* Subscription Card */}
          <Card className="bg-card/80 backdrop-blur border-border mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="text-foreground font-display flex items-center gap-2">
                    {isPremium ? (
                      <>
                        <Crown className="h-5 w-5 text-accent" />
                        Season Pass Active
                      </>
                    ) : (
                      <>
                        <Star className="h-5 w-5 text-muted-foreground" />
                        Free Plan
                      </>
                    )}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {isLoading ? (
                      "Checking subscription..."
                    ) : isPremium ? (
                      `Your Season Pass is active through ${subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString() : "December 31st"}`
                    ) : (
                      `${FREE_CALLS_LIMIT} free calls & ${FREE_MINUTES_LIMIT} minutes. Upgrade for more!`
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isPremium ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-accent" />
                      <span className="font-display font-semibold text-foreground">Season Pass Benefits</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 font-body">
                      <li>✓ {PREMIUM_CALLS_LIMIT} calls per month</li>
                      <li>✓ {PREMIUM_MINUTES_LIMIT} minutes per month</li>
                      <li>✓ Full Elf Dossier customization</li>
                      <li>✓ Multiple children supported</li>
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleManage}
                    className="w-full border-border text-foreground hover:bg-card hover:text-foreground font-display"
                  >
                    Manage Subscription
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-accent" />
                      <span className="font-display font-semibold text-foreground">Season Pass - $30</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 font-body">
                      <li>✓ {PREMIUM_CALLS_LIMIT} calls per month</li>
                      <li>✓ {PREMIUM_MINUTES_LIMIT} minutes per month</li>
                      <li>✓ Full Elf Dossier customization</li>
                      <li>✓ Multiple children supported</li>
                      <li>✓ Safe & family-friendly</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleUpgrade}
                    disabled={isSubscribing}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display py-6 text-lg"
                  >
                    {isSubscribing ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Ticket className="h-5 w-5 mr-2" />
                    )}
                    Get Your Season Pass
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Card */}
          <Card className="bg-card/80 backdrop-blur border-border mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="text-foreground font-display flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Your Usage
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {isPremium ? "Season Pass usage this billing period" : "Free plan usage"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsage ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : usage ? (
                <div className="space-y-6">
                  {/* Calls Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4" />
                        <span className="font-body">Calls</span>
                      </div>
                      <span className="text-muted-foreground font-body">
                        {usage.callsUsed} / {usage.callsLimit} used
                      </span>
                    </div>
                    <Progress value={callsPercent} className="h-3" />
                  </div>

                  {/* Minutes Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-body">Minutes</span>
                      </div>
                      <span className="text-muted-foreground font-body">
                        {usage.minutesUsed} / {usage.minutesLimit} used
                      </span>
                    </div>
                    <Progress value={minutesPercent} className="h-3" />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Unable to load usage data</p>
              )}
            </CardContent>
          </Card>

          {/* Santa's Knowledge Card */}
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="text-foreground font-display flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Santa's Knowledge
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Add people and details so Santa knows who he's talking to
                  </CardDescription>
                </div>
                <Button
                  onClick={openAddModal}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-display"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingKnowledge ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : entries.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <p className="text-4xl mb-4">🎄</p>
                  <p className="text-muted-foreground font-body">
                    No knowledge added yet. Tap "Add" to get started!
                  </p>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-border">
                    {entries.map((entry, index) => {
                      const locked = isEntryLocked(index);
                      return (
                        <li 
                          key={entry.id} 
                          className={`flex items-center justify-between p-4 ${locked ? 'opacity-50 bg-muted/30' : ''}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-semibold text-foreground truncate">
                                {entry.name}
                              </h3>
                              {locked && (
                                <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                            {entry.context && (
                              <p className="text-muted-foreground font-body text-sm truncate">
                                {entry.context}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 ml-4">
                            {locked ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowUpgradeModal(true)}
                                className="text-accent hover:text-accent hover:bg-accent/10 font-display text-xs gap-1"
                              >
                                <Crown className="h-3.5 w-3.5" /> Upgrade
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditModal(entry, index)}
                                  className="text-muted-foreground hover:text-foreground h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(entry)}
                                  className="text-muted-foreground hover:text-destructive h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  
                  {/* Upgrade banner for free users with locked entries */}
                  {!isPremium && entries.length > FREE_KNOWLEDGE_LIMIT && (
                    <div className="p-4 bg-accent/10 border-t border-accent/20">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-accent" />
                          <p className="text-sm font-body text-foreground">
                            <span className="font-semibold">{entries.length - FREE_KNOWLEDGE_LIMIT} entries locked.</span>{" "}
                            Upgrade for unlimited!
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowUpgradeModal(true)}
                          size="sm"
                          className="bg-accent hover:bg-accent/90 text-accent-foreground font-display"
                        >
                          Get Season Pass
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">
              {editingEntry ? "Edit Knowledge" : "Add Knowledge"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingEntry 
                ? "Update the details below" 
                : "Add people or details Santa should know about"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Name</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.name.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                maxLength={MAX_NAME_LENGTH}
                placeholder="e.g., Emma, Mom, Grandpa Joe"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Details</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.context.length}/{MAX_CONTEXT_LENGTH}
                </span>
              </div>
              <Textarea
                value={formData.context}
                onChange={(e) => handleContextChange(e.target.value)}
                maxLength={MAX_CONTEXT_LENGTH}
                placeholder="What should Santa know? Interests, personality, recent events..."
                rows={5}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSave} 
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {editingEntry ? "Save Changes" : "Add Knowledge"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={closeModal}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SeasonPassModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
};

export default Settings;