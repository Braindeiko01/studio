
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  
  const mode = searchParams.get('mode') as 'classic' | 'triple-draft' | null;
  const modeDisplay = mode === 'classic' ? 'Batalla Clásica' : mode === 'triple-draft' ? 'Triple Elección' : 'Duelo Estándar';

  const [status, setStatus] = useState(`Buscando oponente para ${modeDisplay}...`);
  const [progress, setProgress] = useState(0);
  const [opponent, setOpponent] = useState<{ id: string; clashTag: string; avatarUrl: string; dataAiHint: string; } | null>(null);

  useEffect(() => {
    if (!user) return;

    // Redirect if mode is not present or invalid, or if balance is insufficient
    if (!mode || (mode !== 'classic' && mode !== 'triple-draft')) {
      router.replace('/'); // Or a specific error page
      return;
    }
    if (user.balance < 6000) {
        // This check might be redundant if page.tsx already prevents navigation
        // but good for robustness.
        router.replace('/');
        return;
    }


    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5; 
      });
    }, 250); 

    const searchTimeout = setTimeout(() => {
      const randomOpponent = mockOpponents[Math.floor(Math.random() * mockOpponents.length)];
      setOpponent(randomOpponent);
      setStatus(`¡Oponente Encontrado: ${randomOpponent.clashTag} para ${modeDisplay}!`);
    }, 5000); 

    const matchStartTimeout = setTimeout(() => {
      if (opponent || mockOpponents[0]) { 
        const currentOpponent = opponent || mockOpponents[0];
        setStatus(`¡Duelo iniciando con ${currentOpponent.clashTag} (${modeDisplay})!`);
        const matchId = `match_${user.id}_vs_${currentOpponent.id}_${Date.now()}_${mode}`;
        router.push(`/chat/${matchId}?opponentTag=${encodeURIComponent(currentOpponent.clashTag)}&opponentAvatar=${encodeURIComponent(currentOpponent.avatarUrl)}`);
      } else {
         router.push('/'); 
      }
    }, 8000); 

    return () => {
      clearInterval(interval);
      clearTimeout(searchTimeout);
      clearTimeout(matchStartTimeout);
    };
  }, [user, router, opponent, mode, modeDisplay]);

  if (!user) return <p>Cargando...</p>;
  // Early return if mode is invalid (although useEffect should redirect)
  if (!mode || (mode !== 'classic' && mode !== 'triple-draft')) {
      return <p>Modo de juego no válido. Redirigiendo...</p>;
  }


  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardTitle className="text-4xl md:text-5xl font-headline text-primary flex items-center justify-center">
          <CrownIcon className="h-10 w-10 md:h-12 md:w-12 mr-3 text-accent animate-pulse" />
          Matchmaking: {modeDisplay}
        </CardTitle>
      </motion.div>

      <div className="relative w-full max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-around">
          <motion.div
            initial={{ x: -100, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center space-y-2"
          >
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-accent shadow-xl">
              <AvatarImage src={user.avatarUrl || `https://placehold.co/128x128.png?text=${user.clashTag?.[0] || 'U'}`} alt={user.clashTag} data-ai-hint="gaming avatar user"/>
              <AvatarFallback className="text-5xl bg-primary/30">{user.clashTag?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <p className="text-xl font-semibold text-foreground">{user.clashTag}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 120 }}
          >
            <SwordsIcon className="h-16 w-16 md:h-24 md:w-24 text-destructive animate-subtle-bounce" />
          </motion.div>
          
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
                  <AvatarImage src={opponent.avatarUrl} alt={opponent.clashTag} data-ai-hint={opponent.dataAiHint}/>
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
                <p className="text-xl font-semibold text-muted-foreground">Buscando...</p>
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
            <p className="text-sm text-muted-foreground mt-2">Monto de Apuesta: $6,000 COP</p>
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

