import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCreateGame, useJoinGame } from "@/hooks/use-game";
import { GameCard, CardTitle, CardDescription } from "@/components/GameCard";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/Input";
import { Bot, Users, Play, ArrowRight, Gamepad2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Lobby() {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createGame = useCreateGame();
  const joinGame = useJoinGame();

  useEffect(() => {
    const stored = localStorage.getItem("wordrush_user");
    if (!stored) {
      setLocation("/setup");
      return;
    }
    setUser(JSON.parse(stored));
  }, [setLocation]);

  const handleCreateGame = (isBot: boolean) => {
    if (!user) return;
    createGame.mutate(
      { hostId: user.id, isBotGame: isBot },
      {
        onSuccess: (data) => {
          // Immediately join the game we just created
          joinGame.mutate(
            { gameId: data.gameId, userId: user.id },
            {
              onSuccess: () => setLocation(`/game/${data.gameId}`),
              onError: (err) => toast({ title: "Failed to join created game", description: err.message, variant: "destructive" })
            }
          );
        },
        onError: (err) => toast({ title: "Failed to create game", description: err.message, variant: "destructive" })
      }
    );
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode) return;

    joinGame.mutate(
      { gameId: joinCode.toUpperCase(), userId: user.id },
      {
        onSuccess: () => setLocation(`/game/${joinCode.toUpperCase()}`),
        onError: (err) => toast({ title: "Cannot join game", description: err.message, variant: "destructive" })
      }
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Dynamic background shapes */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10">
        
        {/* Create Game Section */}
        <GameCard className="h-full flex flex-col justify-between" delay={0.1}>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/20">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold font-display">New Game</h2>
            </div>
            
            <p className="text-muted-foreground mb-8">Start a fresh session and invite friends or practice with AI.</p>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCreateGame(false)}
                disabled={createGame.isPending}
                className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-blue-300 transition-colors">Create Multiplayer</div>
                    <div className="text-xs text-muted-foreground">Get an invite link</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCreateGame(true)}
                disabled={createGame.isPending}
                className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-purple-300 transition-colors">Bot Match</div>
                    <div className="text-xs text-muted-foreground">Practice solo</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
              </motion.button>
            </div>
          </div>
        </GameCard>

        {/* Join Game Section */}
        <GameCard className="h-full flex flex-col justify-between" delay={0.2}>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold font-display">Join Game</h2>
            </div>

            <p className="text-muted-foreground mb-8">Enter a 6-character game code to join an existing lobby.</p>

            <form onSubmit={handleJoinGame} className="space-y-4">
              <div className="relative">
                <NeonInput
                  placeholder="GAME CODE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="uppercase tracking-[0.5em] text-center font-bold text-2xl h-16"
                />
              </div>
              <NeonButton 
                type="submit" 
                fullWidth 
                variant="secondary"
                disabled={joinCode.length < 6 || joinGame.isPending}
                isLoading={joinGame.isPending}
              >
                Join Lobby
              </NeonButton>
            </form>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-muted-foreground">
              Logged in as <span className="text-primary font-bold">{user.username}</span>
            </p>
          </div>
        </GameCard>

      </div>
    </div>
  );
}
