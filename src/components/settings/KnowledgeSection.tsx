import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Pencil, Trash2, Lock, Crown, Loader2 } from "lucide-react";
import { FREE_KNOWLEDGE_LIMIT } from "@/constants/limits";
import type { KnowledgeEntry } from "@/types";

interface KnowledgeSectionProps {
  entries: KnowledgeEntry[];
  isLoading: boolean;
  isPremium: boolean;
  onAdd: () => void;
  onEdit: (entry: KnowledgeEntry, index: number) => void;
  onDelete: (entry: KnowledgeEntry) => void;
  onUpgrade: () => void;
}

export function KnowledgeSection({
  entries,
  isLoading,
  isPremium,
  onAdd,
  onEdit,
  onDelete,
  onUpgrade,
}: KnowledgeSectionProps) {
  const isEntryLocked = (index: number) => !isPremium && index >= FREE_KNOWLEDGE_LIMIT;

  return (
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
            onClick={onAdd}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-display"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center px-6">
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
                    className={`flex items-center justify-between px-6 py-4 ${locked ? 'opacity-50 bg-muted/30' : ''}`}
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
                          onClick={onUpgrade}
                          className="text-accent hover:text-accent hover:bg-accent/10 font-display text-xs gap-1"
                        >
                          <Crown className="h-3.5 w-3.5" /> Upgrade
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(entry, index)}
                            className="text-muted-foreground hover:text-foreground h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(entry)}
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
              <div className="px-6 py-4 bg-accent/10 border-t border-accent/20">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-accent" />
                    <p className="text-sm font-body text-foreground">
                      <span className="font-semibold">{entries.length - FREE_KNOWLEDGE_LIMIT} entries locked.</span>{" "}
                      Upgrade for unlimited!
                    </p>
                  </div>
                  <Button
                    onClick={onUpgrade}
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
  );
}
