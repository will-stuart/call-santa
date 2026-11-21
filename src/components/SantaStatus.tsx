interface SantaStatusProps {
  isSpeaking: boolean;
  isConnected: boolean;
  isMuted?: boolean;
  pushToTalk?: boolean;
}

export function SantaStatus({ isSpeaking, isConnected, isMuted, pushToTalk }: SantaStatusProps) {
  if (!isConnected) return null;

  return (
    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border border-border">
      <div
        className={`w-3 h-3 rounded-full ${
          isSpeaking ? "bg-christmas-green animate-pulse" : "bg-christmas-gold"
        }`}
      />
      <span className="font-display font-medium text-foreground">
        {isSpeaking
          ? "Santa is speaking..."
          : isMuted
            ? pushToTalk ? "Hold the big button to talk" : "You're muted – Santa can talk"
            : "Santa is listening..."}
      </span>
    </div>
  );
}
