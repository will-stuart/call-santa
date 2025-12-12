import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Gift, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Snowfall } from "@/components/Snowfall";

interface Wish {
  id: string;
  child_name: string;
  present: string;
  details: string | null;
  created_at: string;
}

export default function Wishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishes = async () => {
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishes:", error);
      toast.error("Failed to load wishes");
    } else {
      setWishes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const deleteWish = async (id: string) => {
    const { error } = await supabase.from("wishes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting wish:", error);
      toast.error("Failed to delete wish");
    } else {
      setWishes((prev) => prev.filter((w) => w.id !== id));
      toast.success("Wish removed!");
    }
  };

  const groupedWishes = wishes.reduce((acc, wish) => {
    const name = wish.child_name;
    if (!acc[name]) acc[name] = [];
    acc[name].push(wish);
    return acc;
  }, {} as Record<string, Wish[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-christmas-red via-christmas-darkRed to-christmas-green p-4 relative overflow-hidden">
      <Snowfall />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Gift className="h-8 w-8" />
            Wish List
          </h1>
        </div>

        {loading ? (
          <div className="text-center text-white/80 py-12">Loading wishes...</div>
        ) : wishes.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="py-12 text-center">
              <Gift className="h-16 w-16 mx-auto mb-4 text-white/60" />
              <p className="text-white/80 text-lg">No wishes yet!</p>
              <p className="text-white/60 mt-2">
                When children tell Santa what they want, it will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedWishes).map(([childName, childWishes]) => (
              <Card key={childName} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-christmas-gold flex items-center gap-2">
                    🎁 {childName}'s Wishes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {childWishes.map((wish) => (
                    <div
                      key={wish.id}
                      className="flex items-start justify-between gap-3 p-3 bg-white/10 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{wish.present}</p>
                        {wish.details && (
                          <p className="text-white/70 text-sm mt-1">{wish.details}</p>
                        )}
                        <p className="text-white/50 text-xs mt-2">
                          {new Date(wish.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/60 hover:text-christmas-red hover:bg-white/20 shrink-0"
                        onClick={() => deleteWish(wish.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
