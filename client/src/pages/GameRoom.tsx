import { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { useGame, useStartGame, useSubmitWord } from "@/hooks/use-game";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/Input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Copy, Trophy, Timer, Play, Users } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

// COMPONENTS FOR GAME STAGES

function WaitingLobby({ game, userId, isHost }: { game: any, userId: number, isHost: boolean }) {
  const startGame = useStartGame();
  const { toast } = useToast();

  const handleStart = () => {
    if (game.players.length < 2) return;
    startGame.mutate(game.id, {
      onError: (err) => toast({ title: "Failed to start", description: err.message, variant: "destructive" })
    });
  };

  const copyCode = () => {
    const inviteLink = `${window.location.origin}/game/${game.id}`;
    navigator.clipboard.writeText(inviteLink);
    toast({ title: "Copied!", description: "Invite link copied to clipboard." });
  };

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight">LOBBY</h1>
        <div 
          onClick={copyCode}
          className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
        >
          <span className="text-2xl font-mono font-bold tracking-widest text-primary">{game.id}</span>
          <Copy className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Waiting for players...</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {game.players.map((p: any) => (
          <motion.div 
            key={p.userId}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card/50 border border-white/10 p-4 rounded-xl flex flex-col items-center justify-center aspect-square"
          >
            <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center text-xl font-bold ${p.userId === userId ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground'}`}>
              {p.username[0].toUpperCase()}
            </div>
            <span className="font-medium truncate w-full text-center">{p.username}</span>
            {p.userId === game.hostId && <span className="text-xs text-primary mt-1 px-2 py-0.5 bg-primary/10 rounded">HOST</span>}
          </motion.div>
        ))}
        {Array.from({ length: Math.max(0, 4 - game.players.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center aspect-square">
            <Users className="w-8 h-8 text-white/5" />
          </div>
        ))}
      </div>

      {isHost && (
        <div className="pt-8 flex justify-center">
          <NeonButton 
            onClick={handleStart} 
            disabled={game.players.length < 2 || startGame.isPending}
            className="w-full max-w-sm text-lg py-6"
            isLoading={startGame.isPending}
          >
            {game.players.length < 2 ? "Waiting for players..." : "START GAME"}
          </NeonButton>
        </div>
      )}
      {!isHost && (
        <p className="text-center text-sm text-muted-foreground animate-pulse">Waiting for host to start...</p>
      )}
    </div>
  );
}

function Countdown() {
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-500 to-cyan-500 drop-shadow-[0_0_50px_rgba(139,92,246,0.5)]"
        >
          {count > 0 ? count : "GO!"}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Gameplay({ game, userId }: { game: any, userId: number }) {
  const [word, setWord] = useState("");
  const submitWord = useSubmitWord();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const currentPlayer = game.players.find((p: any) => p.userId === userId);
  const hasSubmitted = currentPlayer?.hasSubmitted;
  const isRoundOver = game.status === "finished"; // Simplified check, ideally check roundEndsAt
  
  // Calculate progress for timer bar (5s duration)
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    if (!game.roundEndsAt) return;
    const end = new Date(game.roundEndsAt).getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, end - now);
      const percent = (left / 5000) * 100;
      setProgress(percent);
    }, 50); // smooth update

    return () => clearInterval(interval);
  }, [game.roundEndsAt]);

  // Focus input on new round
  useEffect(() => {
    if (!hasSubmitted && inputRef.current) {
      inputRef.current.focus();
      setWord("");
    }
  }, [game.round, hasSubmitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word) return;

    // Client-side validation for instant feedback
    const lastChar = game.currentWord.slice(-1).toLowerCase();
    const firstChar = word.trim().charAt(0).toLowerCase();
    
    if (firstChar !== lastChar) {
      toast({ 
        title: "Invalid Word", 
        description: `Must start with '${lastChar.toUpperCase()}'`, 
        variant: "destructive" 
      });
      return;
    }

    submitWord.mutate(
      { gameId: game.id, userId, word },
      {
        onError: (err) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
        onSuccess: () => {
          setWord("");
        }
      }
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-between min-h-[80vh]">
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-8 px-4 py-3 bg-white/5 rounded-full border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {game.round}
          </div>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Round</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-white">{currentPlayer?.score} pts</span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full space-y-12">
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={game.currentWord}
            className="text-sm text-muted-foreground uppercase tracking-widest font-medium"
          >
            Current Word
          </motion.div>
          <motion.h1 
            key={`word-${game.currentWord}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl md:text-8xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-2xl"
          >
            {game.currentWord}
          </motion.h1>
          <div className="text-2xl text-primary font-mono font-bold mt-2 animate-bounce">
            Ends with "{game.currentWord.slice(-1).toUpperCase()}"
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full max-w-md h-2 bg-secondary rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-primary"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Input Area */}
        <div className="w-full max-w-md relative">
          <AnimatePresence mode="wait">
            {!hasSubmitted ? (
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <NeonInput
                  ref={inputRef}
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder={`Word starting with ${game.currentWord.slice(-1).toUpperCase()}...`}
                  className="h-16 text-2xl"
                  autoComplete="off"
                  disabled={submitWord.isPending}
                />
                <NeonButton 
                  type="submit" 
                  fullWidth 
                  className="h-14 text-lg"
                  disabled={!word || submitWord.isPending}
                >
                  SUBMIT
                </NeonButton>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-green-500/10 border border-green-500/20 rounded-2xl"
              >
                <h3 className="text-2xl font-bold text-green-400 mb-2">Submitted!</h3>
                <p className="text-muted-foreground">Waiting for other players...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Player Statuses */}
      <div className="w-full grid grid-cols-4 gap-4 mt-8">
        {game.players.map((p: any) => (
          <div 
            key={p.userId} 
            className={cn(
              "flex flex-col items-center p-3 rounded-xl border transition-colors",
              p.hasSubmitted 
                ? "bg-green-500/5 border-green-500/20" 
                : "bg-card/50 border-white/5"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2",
              p.hasSubmitted ? "bg-green-500 text-black" : "bg-secondary text-muted-foreground"
            )}>
              {p.hasSubmitted ? "✓" : "..."}
            </div>
            <span className="text-xs font-medium truncate max-w-full">{p.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameFinished({ game, userId }: { game: any, userId: number }) {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#06b6d4', '#ffffff']
    });
  }, []);

  const sortedPlayers = [...game.players].sort((a: any, b: any) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isWinner = winner.userId === userId;

  return (
    <div className="max-w-md w-full mx-auto text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring" }}
        className="space-y-4"
      >
        <Trophy className="w-24 h-24 mx-auto text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
        <h1 className="text-5xl font-black font-display text-gradient">
          {isWinner ? "VICTORY!" : "GAME OVER"}
        </h1>
        <p className="text-xl text-muted-foreground">
          Winner: <span className="text-white font-bold">{winner.username}</span>
        </p>
      </motion.div>

      <div className="bg-card/50 border border-white/10 rounded-2xl overflow-hidden">
        {sortedPlayers.map((p: any, i) => (
          <div 
            key={p.userId}
            className={cn(
              "flex items-center justify-between p-4 border-b border-white/5 last:border-0",
              p.userId === userId && "bg-primary/5"
            )}
          >
            <div className="flex items-center gap-4">
              <span className={cn(
                "w-8 h-8 flex items-center justify-center rounded font-bold text-sm",
                i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                i === 1 ? "bg-gray-400/20 text-gray-400" :
                i === 2 ? "bg-orange-700/20 text-orange-600" :
                "text-muted-foreground"
              )}>
                #{i + 1}
              </span>
              <span className={cn("font-medium", p.userId === userId && "text-primary")}>
                {p.username} {p.userId === userId && "(You)"}
              </span>
            </div>
            <span className="font-bold text-lg">{p.score}</span>
          </div>
        ))}
      </div>

      <NeonButton onClick={() => setLocation("/lobby")} fullWidth>
        Back to Lobby
      </NeonButton>
    </div>
  );
}

// MAIN PAGE COMPONENT

export default function GameRoom() {
  const [, params] = useRoute("/game/:id");
  const [, setLocation] = useLocation();
  const gameId = params?.id;
  
  const { data: game, isLoading, error } = useGame(gameId || null);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const joinGame = useJoinGame();
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("wordrush_user");
    if (!stored) {
      // Store current path to redirect back after setup
      sessionStorage.setItem("redirect_after_setup", `/game/${gameId}`);
      setLocation("/setup");
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    // Auto-join if not already in game
    if (game && !game.players.some((p: any) => p.userId === userData.id)) {
      joinGame.mutate(
        { gameId: game.id, userId: userData.id },
        {
          onError: (err) => {
            toast({ title: "Failed to join", description: err.message, variant: "destructive" });
            setLocation("/lobby");
          }
        }
      );
    }
  }, [game, setLocation, gameId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
        <p className="text-muted-foreground mb-8">This game ID doesn't exist or has expired.</p>
        <NeonButton onClick={() => setLocation("/lobby")}>Return to Lobby</NeonButton>
      </div>
    );
  }

  if (!user) return null;

  const isHost = game.hostId === user.id;

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 opacity-20" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

      {/* Game Stages */}
      <div className="w-full max-w-5xl flex-1 flex flex-col justify-center py-12 z-10">
        {game.status === 'waiting' && <WaitingLobby game={game} userId={user.id} isHost={isHost} />}
        {game.status === 'countdown' && <Countdown />}
        {game.status === 'playing' && <Gameplay game={game} userId={user.id} />}
        {game.status === 'finished' && <GameFinished game={game} userId={user.id} />}
      </div>
    </div>
  );
}
