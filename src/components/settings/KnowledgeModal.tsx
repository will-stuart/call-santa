import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MAX_NAME_LENGTH, MAX_CONTEXT_LENGTH } from "@/constants/limits";

interface KnowledgeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: { name: string; context: string };
  onNameChange: (value: string) => void;
  onContextChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function KnowledgeModal({
  isOpen,
  onOpenChange,
  isEditing,
  formData,
  onNameChange,
  onContextChange,
  onSave,
  onCancel,
}: KnowledgeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground font-display">
            {isEditing ? "Edit Knowledge" : "Add Knowledge"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
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
              onChange={(e) => onNameChange(e.target.value)}
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
              onChange={(e) => onContextChange(e.target.value)}
              maxLength={MAX_CONTEXT_LENGTH}
              placeholder="What should Santa know? Interests, personality, recent events..."
              rows={5}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onSave}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isEditing ? "Save Changes" : "Add Knowledge"}
            </Button>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
