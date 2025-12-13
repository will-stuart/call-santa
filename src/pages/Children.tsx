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

interface Child {
  id: string;
  name: string;
  context: string | null;
}

const Children = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", context: "" });

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    if (error) {
      toast.error("Failed to load children");
      console.error(error);
    } else {
      setChildren(data || []);
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
      name: formData.name.trim(),
      context: formData.context.trim() || null,
    });

    if (error) {
      toast.error("Failed to add child");
      console.error(error);
    } else {
      toast.success(`${formData.name} added to the Elf Dossier!`);
      setFormData({ name: "", context: "" });
      setShowAddForm(false);
      fetchChildren();
    }
  };

  const handleUpdate = async (child: Child) => {
    const { error } = await supabase
      .from("children")
      .update({
        name: formData.name.trim(),
        context: formData.context.trim() || null,
      })
      .eq("id", child.id);

    if (error) {
      toast.error("Failed to update");
      console.error(error);
    } else {
      toast.success("Updated!");
      setEditingId(null);
      setFormData({ name: "", context: "" });
      fetchChildren();
    }
  };

  const handleDelete = async (child: Child) => {
    const { error } = await supabase.from("children").delete().eq("id", child.id);

    if (error) {
      toast.error("Failed to delete");
      console.error(error);
    } else {
      toast.success(`${child.name} removed`);
      fetchChildren();
    }
  };

  const startEdit = (child: Child) => {
    setEditingId(child.id);
    setFormData({ name: child.name, context: child.context || "" });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", context: "" });
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
                📋 Elf Dossier
              </h1>
              <p className="text-muted-foreground font-body text-sm">
                Add your children so Santa knows who he's talking to
              </p>
            </div>
          </div>

          {/* Children List */}
          <div className="space-y-4 mb-6">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : children.length === 0 ? (
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-4xl mb-4">🎄</p>
                  <p className="text-muted-foreground font-body">
                    No children added yet. Add your first child to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              children.map((child) => (
                <Card key={child.id} className="bg-card/80 backdrop-blur border-border">
                  {editingId === child.id ? (
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Magic Details</Label>
                        <Textarea
                          value={formData.context}
                          onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                          placeholder="Pet names, favorite toys, friends, achievements, recent events..."
                          rows={4}
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdate(child)} className="bg-primary hover:bg-primary/90">
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
                            {child.name}
                          </h3>
                          {child.context && (
                            <p className="text-muted-foreground font-body text-sm mt-2 whitespace-pre-wrap">
                              {child.context}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(child)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(child)}
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
                <CardTitle className="text-foreground font-display">Add Child</CardTitle>
                <CardDescription className="text-muted-foreground">
                  The more details you add, the more magical the conversation!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Child's Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Emma"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Magic Details (Elf Dossier)</Label>
                  <Textarea
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    placeholder="Tell Santa about your child! Include things like:
• Pet names (dog Max, cat Whiskers)
• Best friends' names
• Favorite toys or hobbies
• Recent achievements (learned to ride a bike!)
• School/teacher info
• What they want for Christmas
• Any 'naughty' moments to mention gently
• Any 'nice' things to praise"
                    rows={8}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" /> Add to Dossier
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
              <Plus className="h-5 w-5 mr-2" /> Add Child
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Children;
