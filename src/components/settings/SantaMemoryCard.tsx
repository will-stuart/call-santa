import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Brain, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function SantaMemoryCard() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: enabled = false, isLoading: loadingToggle } = useQuery({
    queryKey: ["santa-remembers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("santa_remembers").eq("user_id", user!.id).maybeSingle();
      return !!data?.santa_remembers;
    },
  });

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ["santa-memories", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("santa_memories")
        .select("id, summary, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async (value: boolean) => {
      const { error } = await supabase.from("profiles").update({ santa_remembers: value }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["santa-remembers"] }),
    onError: () => toast.error("Couldn't change that setting. Please try again."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("santa_memories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["santa-memories"] }),
  });

  return (
    <Card className="bg-card/80 backdrop-blur border-border mt-6">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-foreground font-display flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Santa Remembers
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              After each call Santa saves a short note (like wishes or a pet's name) so he can bring it up next time.
              Call audio and full conversations are never saved.
            </CardDescription>
          </div>
          <Switch
            checked={enabled}
            disabled={loadingToggle || toggle.isPending}
            onCheckedChange={(v) => toggle.mutate(v)}
            aria-label="Santa remembers"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
        ) : memories.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body">
            {enabled ? "No notes yet — they'll appear here after your next call." : "Turned off. Santa won't keep any notes."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {memories.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-foreground font-body">{m.summary}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete note"
                  onClick={() => remove.mutate(m.id)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
