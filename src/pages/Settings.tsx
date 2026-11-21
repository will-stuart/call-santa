import { SantaMemoryCard } from "@/components/settings/SantaMemoryCard";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useCallLimits } from "@/hooks/useCallLimits";
import { supabase } from "@/integrations/supabase/client";
import { Snowfall } from "@/components/Snowfall";
import { SeasonPassModal } from "@/components/SeasonPassModal";
import { BarChart3, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SettingsSkeleton } from "@/components/SettingsSkeleton";
import { FREE_KNOWLEDGE_LIMIT, MAX_NAME_LENGTH, MAX_CONTEXT_LENGTH } from "@/constants/limits";
import type { KnowledgeEntry, UsageData } from "@/types";
import {
  SubscriptionCard,
  UsageCard,
  KnowledgeSection,
  AccountManagementCard,
  KnowledgeModal,
  DeleteAccountDialog,
} from "@/components/settings";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut, session } = useAuth();
  const { subscriptionEnd, isPremium, subscribe, manageSubscription, isLoading, refresh } = useSubscription();
  const { checkCallLimits } = useCallLimits();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  // Knowledge state
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [formData, setFormData] = useState({ name: "", context: "" });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Account management state
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Refresh subscription status when page loads
  useEffect(() => {
    refresh();
    fetchEntries();
  }, [refresh, user]);

  // Load usage AFTER subscription status is known
  useEffect(() => {
    if (!isLoading) {
      loadUsage();
    }
  }, [isLoading, isPremium]);

  const loadUsage = async () => {
    if (!usage) setIsLoadingUsage(true);
    try {
      const limits = await checkCallLimits(isPremium, subscriptionEnd);
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

  // Export data handler
  const handleExportData = async () => {
    if (!session) return;
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `call-santa-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (!session || !user?.email || deleteConfirmText !== user.email) return;
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      if (data?.error === 'active_subscription') {
        toast.error("Please cancel your subscription first");
        setShowDeleteDialog(false);
        setDeleteConfirmText("");
        await manageSubscription();
        return;
      }

      if (data?.success) {
        toast.success("Account deleted successfully");
        await signOut();
        navigate('/');
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const showSkeleton = (isLoading || isLoadingUsage || isLoadingKnowledge) && !usage;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <Snowfall />
      <Header showAuthActions />

      <div className="relative z-10 min-h-screen px-4 pb-4 pt-24 md:px-8 md:pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Back to Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
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

          {/* Skeleton Loading State */}
          {showSkeleton && <SettingsSkeleton />}

          {/* Content - only show when initial load is complete */}
          {!showSkeleton && (
            <>
              <SubscriptionCard
                isPremium={isPremium}
                isLoading={isLoading}
                subscriptionEnd={subscriptionEnd}
                isSubscribing={isSubscribing}
                onUpgrade={handleUpgrade}
                onManage={handleManage}
              />

              <UsageCard
                isPremium={isPremium}
                isLoading={isLoadingUsage}
                usage={usage}
              />

              <KnowledgeSection
                entries={entries}
                isLoading={isLoadingKnowledge}
                isPremium={isPremium}
                onAdd={openAddModal}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onUpgrade={() => setShowUpgradeModal(true)}
              />

              <SantaMemoryCard />

              <AccountManagementCard
                isExporting={isExporting}
                onExport={handleExportData}
                onDeleteClick={() => setShowDeleteDialog(true)}
              />
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <KnowledgeModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        isEditing={!!editingEntry}
        formData={formData}
        onNameChange={handleNameChange}
        onContextChange={handleContextChange}
        onSave={handleSave}
        onCancel={closeModal}
      />

      <SeasonPassModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />

      <DeleteAccountDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        userEmail={user?.email}
        isPremium={isPremium}
        confirmText={deleteConfirmText}
        onConfirmTextChange={setDeleteConfirmText}
        isDeleting={isDeleting}
        onDelete={handleDeleteAccount}
      />

      <Footer />
    </div>
  );
};

export default Settings;
