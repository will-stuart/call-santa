import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string | undefined;
  isPremium: boolean;
  confirmText: string;
  onConfirmTextChange: (value: string) => void;
  isDeleting: boolean;
  onDelete: () => void;
}

export function DeleteAccountDialog({
  isOpen,
  onOpenChange,
  userEmail,
  isPremium,
  confirmText,
  onConfirmTextChange,
  isDeleting,
  onDelete,
}: DeleteAccountDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground font-display">
            Delete Your Account?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3">
            <p>
              This action is <strong className="text-destructive">permanent and cannot be undone</strong>.
              All your data will be deleted, including:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Your profile and account</li>
              <li>All Santa's Knowledge entries</li>
              <li>Call history and usage data</li>
            </ul>
            {isPremium && (
              <p className="text-accent font-medium">
                Note: You have an active subscription. You'll need to cancel it first.
              </p>
            )}
            <p className="pt-2">
              Type your email address <strong>{userEmail}</strong> to confirm:
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirmText}
          onChange={(e) => onConfirmTextChange(e.target.value)}
          placeholder="Enter your email address"
          className="bg-input border-border text-foreground"
        />
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onConfirmTextChange("")}
            className="border-border text-foreground"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={confirmText !== userEmail || isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
