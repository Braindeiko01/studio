"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SwordsIcon, CrownIcon } from '@/components/icons/ClashRoyaleIcons';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion'; // For animations

// Mock opponent data
const mockOpponents = [
  { id: 'opp1', clashTag: 'DuelKing#123', avatarUrl: 'https://placehold.co/128x128.png?text=DK', dataAiHint: 'gaming avatar king' },
  { id: 'opp2', clashTag: 'ArenaPro#456', avatarUrl: 'https://placehold.co/128x128.png?text=AP', dataAiHint: 'gaming avatar pro' },
  { id: 'opp3', clashTag: 'Legend#789', avatarUrl: 'https://placehold.co/128x128.png?text=L', dataAiHint: 'gaming avatar legend' },
];

const MatchingPageContent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState("Searching for opponent...");
  const [progress, setProgress] = useState(0);
  const [opponent, setOpponent] = useState<{ id: string; clashTag: string; avatarUrl: string; dataAiHint: string; } | null>(null);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5; // Slower progress for more suspense
      });
    }, 250); // Update progress every 250ms

    // Simulate finding an opponent
    const searchTimeout = setTimeout(() => {
      const randomOpponent = mockOpponents[Math.floor(Math.random() * mockOpponents.length)];
      setOpponent(randomOpponent);
      setStatus(`Opponent Found: ${randomOpponent.clashTag}!`);
    }, 5000); // Find opponent after 5 seconds

    // Simulate match starting and redirecting
    const matchStartTimeout = setTimeout(() => {
      if (opponent || mockOpponents[0]) { // Use a fallback if opponent state isn't updated fast enough
        const currentOpponent = opponent || mockOpponents[0];
        setStatus(`Match starting with ${currentOpponent.clashTag}!`);
        // Create a mock match ID
        const matchId = `match_${user.id}_vs_${currentOpponent.id}_${Date.now()}`;
        router.push(`/chat/${matchId}?opponentTag=${encodeURIComponent(currentOpponent.clashTag)}&opponentAvatar=${encodeURIComponent(currentOpponent.avatarUrl)}`);
      } else {
         // Fallback if opponent is still null after timeout (should not happen with current logic)
         router.push('/'); 
      }
    }, 8000); // Start match after 8 seconds (3 seconds after finding opponent)

    return () => {
      clearInterval(interval);
      clearTimeout(searchTimeout);
      clearTimeout(matchStartTimeout);
    };
  }, [user, router, opponent]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardTitle className="text-5xl font-headline text-primary flex items-center justify-center">
          <CrownIcon className="h-12 w-12 mr-3 text-accent animate-pulse" />
          Matchmaking
        </CardTitle>
      </motion.div>

      <div className="relative w-full max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-around">
          {/* User Avatar */}
          <motion.div
            initial={{ x: -100, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center space-y-2"
          >
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-accent shadow-xl">
              <AvatarImage src={user.avatarUrl || `https://placehold.co/128x128.png?text=${user.clashTag?.[0] || 'U'}`} alt={user.clashTag} data-ai-hint="gaming avatar user" />
              <AvatarFallback className="text-5xl bg-primary/30">{user.clashTag?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <p className="text-xl font-semibold text-foreground">{user.clashTag}</p>
          </motion.div>

          {/* Swords Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 120 }}
          >
            <SwordsIcon className="h-16 w-16 md:h-24 md:w-24 text-destructive animate-subtle-bounce" />
          </motion.div>
          

          {/* Opponent Avatar (Placeholder or Actual) */}
          <motion.div
            initial={{ x: 100, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center space-y-2"
          >
            <AnimatePresence>
            {opponent ? (
              <motion.div
                key="opponent-found"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center space-y-2"
              >
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-destructive shadow-xl">
                  <AvatarImage src={opponent.avatarUrl} alt={opponent.clashTag} data-ai-hint={opponent.dataAiHint} />
                  <AvatarFallback className="text-5xl bg-destructive/30">{opponent.clashTag?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <p className="text-xl font-semibold text-foreground">{opponent.clashTag}</p>
              </motion.div>
            ) : (
              <motion.div 
                key="opponent-searching"
                className="flex flex-col items-center space-y-2"
              >
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-muted bg-muted/50 animate-pulse">
                  <AvatarFallback className="text-5xl text-muted-foreground">?</AvatarFallback>
                </Avatar>
                <p className="text-xl font-semibold text-muted-foreground">Searching...</p>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <Card className="w-full max-w-lg shadow-card-medieval border-2 border-primary-dark">
        <CardHeader>
            <CardTitle className="text-2xl text-primary">{status}</CardTitle>
        </CardHeader>
        <CardContent>
            <Progress value={progress} className="w-full h-4 [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-primary" />
            <p className="text-sm text-muted-foreground mt-2">Bet Amount: $6,000 COP</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function MatchingPage() {
  return (
    <AppLayout>
      <MatchingPageContent />
    </AppLayout>
  );
}
