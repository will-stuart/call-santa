import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Snowfall } from "@/components/Snowfall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface KnowledgeEntry {
  id: string;
  name: string;
  context: string | null;
}

const MAX_NAME_LENGTH = 50;
const MAX_CONTEXT_LENGTH = 500;

const Children = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
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

  const handleAdd = async () => {
    if (!user || !formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

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
      setFormData({ name: "", context: "" });
      setShowAddForm(false);
      fetchEntries();
    }
  };

  const handleUpdate = async (entry: KnowledgeEntry) => {
    const { error } = await supabase
      .from("children")
      .update({
        name: formData.name.trim().slice(0, MAX_NAME_LENGTH),
        context: formData.context.trim().slice(0, MAX_CONTEXT_LENGTH) || null,
      })
      .eq("id", entry.id);

    if (error) {
      toast.error("Failed to update");
      console.error(error);
    } else {
      toast.success("Updated!");
      setEditingId(null);
      setFormData({ name: "", context: "" });
      fetchEntries();
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

  const startEdit = (entry: KnowledgeEntry) => {
    setEditingId(entry.id);
    setFormData({ name: entry.name, context: entry.context || "" });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
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
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-foreground hover:bg-card hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                📋 Santa's Knowledge
              </h1>
              <p className="text-muted-foreground font-body text-sm">
                Add people and details so Santa knows who he's talking to
              </p>
            </div>
          </div>

          {/* Knowledge List */}
          <div className="space-y-4 mb-6">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : entries.length === 0 ? (
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-4xl mb-4">🎄</p>
                  <p className="text-muted-foreground font-body">
                    No knowledge added yet. Add your first entry to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => (
                <Card key={entry.id} className="bg-card/80 backdrop-blur border-border">
                  {editingId === entry.id ? (
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-foreground">Name</Label>
                          <span className="text-xs text-muted-foreground">{formData.name.length}/{MAX_NAME_LENGTH}</span>
                        </div>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          maxLength={MAX_NAME_LENGTH}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-foreground">Details</Label>
                          <span className="text-xs text-muted-foreground">{formData.context.length}/{MAX_CONTEXT_LENGTH}</span>
                        </div>
                        <Textarea
                          value={formData.context}
                          onChange={(e) => handleContextChange(e.target.value)}
                          maxLength={MAX_CONTEXT_LENGTH}
                          placeholder="Interests, personality, recent events, things Santa should know..."
                          rows={4}
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdate(entry)} className="bg-primary hover:bg-primary/90">
                          <Save className="h-4 w-4 mr-2" /> Save
                        </Button>
                        <Button variant="ghost" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-display font-semibold text-foreground">
                            {entry.name}
                          </h3>
                          {entry.context && (
                            <p className="text-muted-foreground font-body text-sm mt-2 whitespace-pre-wrap">
                              {entry.context}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(entry)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(entry)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Add Form */}
          {showAddForm ? (
            <Card className="bg-card/80 backdrop-blur border-primary/50">
              <CardHeader>
                <CardTitle className="text-foreground font-display">Add Knowledge</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Add people or details Santa should know about
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-foreground">Name</Label>
                    <span className="text-xs text-muted-foreground">{formData.name.length}/{MAX_NAME_LENGTH}</span>
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
                    <span className="text-xs text-muted-foreground">{formData.context.length}/{MAX_CONTEXT_LENGTH}</span>
                  </div>
                  <Textarea
                    value={formData.context}
                    onChange={(e) => handleContextChange(e.target.value)}
                    maxLength={MAX_CONTEXT_LENGTH}
                    placeholder="What should Santa know? Include things like interests, personality, recent events, relationships..."
                    rows={6}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" /> Add Knowledge
                  </Button>
                  <Button variant="ghost" onClick={() => { setShowAddForm(false); setFormData({ name: "", context: "" }); }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={() => { setShowAddForm(true); setEditingId(null); }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display py-6"
            >
              <Plus className="h-5 w-5 mr-2" /> Add Knowledge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Children;
