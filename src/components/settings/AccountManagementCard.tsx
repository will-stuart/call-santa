import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX, Download, Trash2, Loader2 } from "lucide-react";

interface AccountManagementCardProps {
  isExporting: boolean;
  onExport: () => void;
  onDeleteClick: () => void;
}

export function AccountManagementCard({
  isExporting,
  onExport,
  onDeleteClick,
}: AccountManagementCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur border-border mt-6">
      <CardHeader>
        <div className="space-y-1.5">
          <CardTitle className="text-foreground font-display flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Account & Data
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Export your data or delete your account
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Data */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm">Export My Data</h3>
            <p className="text-xs text-muted-foreground">Download all your data as a JSON file</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isExporting}
            className="border-border text-foreground hover:bg-foreground hover:text-background hover:border-foreground"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" /> Export
              </>
            )}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm">Delete Account</h3>
            <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteClick}
            className="bg-destructive hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
