import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Gamepad2, Zap, Clock, Users } from "lucide-react";
import { NeonButton } from "@/components/NeonButton";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />

      <div className="max-w-4xl w-full z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-6 border border-primary/20 backdrop-blur-md">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 text-gradient drop-shadow-2xl">
            WORD CHAIN<br />RUSH
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
            The fast-paced multiplayer word association game where every second counts.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-12"
        >
          {[
            { icon: Users, title: "2-4 Players", desc: "Challenge friends or bots" },
            { icon: Clock, title: "5 Seconds", desc: "Think fast or lose points" },
            { icon: Gamepad2, title: "5 Rounds", desc: "Prove your vocabulary" }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col items-center hover:bg-white/5 transition-colors">
              <item.icon className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <NeonButton 
            onClick={() => setLocation("/setup")}
            className="text-lg px-12 py-6 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)]"
          >
            PLAY NOW
          </NeonButton>
        </motion.div>
      </div>
    </div>
  );
}
