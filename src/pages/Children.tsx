import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Snowfall } from "@/components/Snowfall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, BookOpen, Crown } from "lucide-react";
import { toast } from "sonner";

interface KnowledgeEntry {
  id: string;
  name: string;
  context: string | null;
}

const MAX_NAME_LENGTH = 50;
const MAX_CONTEXT_LENGTH = 500;
const FREE_KNOWLEDGE_LIMIT = 1;

const Children = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [formData, setFormData] = useState({ name: "", context: "" });

  useEffect(() => {
    fetchEntries();
  }, [user]);

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
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user || !formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (editingEntry) {
      // Update existing
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
      // Add new
      const { error } = await supabase.from("children").insert({
        user_id: user.id,
        name: formData.name.trim().slice(0, MAX_NAME_LENGTH),
        context: formData.context.trim().slice(0, MAX_CONTEXT_LENGTH) || null,
      });

      if (error) {
        toast.error("Failed to add entry");
        console.error(error);
      } else {
        toast.success(`${formData.name} added!`);
        closeModal();
        fetchEntries();
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
    // Check limit for free users
    if (!isPremium && entries.length >= FREE_KNOWLEDGE_LIMIT) {
      toast.error("Free plan allows 1 knowledge entry. Upgrade for unlimited!");
      return;
    }
    setEditingEntry(null);
    setFormData({ name: "", context: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (entry: KnowledgeEntry) => {
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-foreground hover:bg-card hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-7 w-7" />
                  Santa's Knowledge
                </h1>
                <p className="text-muted-foreground font-body text-sm">
                  Add people and details so Santa knows who he's talking to
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isPremium && (
                <span className="text-xs text-muted-foreground font-body">
                  {entries.length}/{FREE_KNOWLEDGE_LIMIT}
                </span>
              )}
              <Button
                onClick={openAddModal}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-display"
                disabled={!isPremium && entries.length >= FREE_KNOWLEDGE_LIMIT}
              >
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>

          {/* Knowledge List */}
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="p-0">
              {isLoading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : entries.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-4xl mb-4">🎄</p>
                  <p className="text-muted-foreground font-body">
                    No knowledge added yet. Tap "Add" to get started!
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {entries.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground truncate">
                          {entry.name}
                        </h3>
                        {entry.context && (
                          <p className="text-muted-foreground font-body text-sm truncate">
                            {entry.context}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(entry)}
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
                      </div>
                    </li>
                  ))}
                </ul>
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
    </div>
  );
};

export default Children;