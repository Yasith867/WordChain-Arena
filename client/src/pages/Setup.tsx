import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateUser } from "@/hooks/use-game";
import { GameCard, CardTitle, CardDescription } from "@/components/GameCard";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/Input";
import { UserCircle2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Setup() {
  const [username, setUsername] = useState("");
  const [, setLocation] = useLocation();
  const createUser = useCreateUser();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    createUser.mutate(username, {
      onSuccess: (user) => {
        // Store user in localStorage for persistence across refreshes
        localStorage.setItem("wordrush_user", JSON.stringify(user));
        const redirect = sessionStorage.getItem("redirect_after_setup") || "/lobby";
        sessionStorage.removeItem("redirect_after_setup");
        setLocation(redirect);
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      <button 
        onClick={() => setLocation("/")}
        className="absolute top-8 left-8 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors z-20 group"
      >
        <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
      </button>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <GameCard>
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <UserCircle2 className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="text-center">
          <CardTitle>Who are you?</CardTitle>
          <CardDescription>
            Choose a unique username to represent you on the leaderboard.
          </CardDescription>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <NeonInput
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={12}
              autoFocus
            />
            <p className="text-xs text-center text-muted-foreground">
              Max 12 characters
            </p>
          </div>

          <NeonButton 
            type="submit" 
            fullWidth 
            isLoading={createUser.isPending}
            disabled={!username.trim()}
          >
            Continue
          </NeonButton>
        </form>
      </GameCard>
    </div>
  );
}
