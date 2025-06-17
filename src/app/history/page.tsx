"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import type { Bet } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText, SwordsIcon, VictoryIcon, DefeatIcon, InfoIcon } from '@/components/icons/ClashRoyaleIcons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/storage';

const BET_HISTORY_STORAGE_KEY = 'royaleDuelBetHistory';

const HistoryPageContent = () => {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Load bets from localStorage
      const storedBets = getLocalStorageItem<Bet[]>(`${BET_HISTORY_STORAGE_KEY}_${user.id}`);
      if (storedBets) {
        setBets(storedBets);
      } else {
        // Populate with mock data if no history exists for the user
        const mockBets: Bet[] = [
          { id: 'bet1', userId: user.id, matchId: 'match1', amount: 6000, result: 'win', opponentTag: 'RivalPlayer#1', matchDate: new Date(Date.now() - 86400000).toISOString() },
          { id: 'bet2', userId: user.id, matchId: 'match2', amount: 6000, result: 'loss', opponentTag: 'ProGamer#X', matchDate: new Date(Date.now() - 2 * 86400000).toISOString() },
          { id: 'bet3', userId: user.id, matchId: 'match3', amount: 6000, result: 'win', opponentTag: 'DuelMaster#7', matchDate: new Date(Date.now() - 3 * 86400000).toISOString() },
        ];
        setBets(mockBets);
        setLocalStorageItem(`${BET_HISTORY_STORAGE_KEY}_${user.id}`, mockBets);
      }
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) return <p>Loading match history...</p>;
  if (!user) return <p>User not found.</p>;

  const wonBets = bets.filter(bet => bet.result === 'win');
  const lostBets = bets.filter(bet => bet.result === 'loss');

  const BetCard = ({ bet }: { bet: Bet }) => (
    <Card className="shadow-card-medieval border-2 border-primary-dark/50 hover:border-accent transition-all duration-200 ease-in-out transform hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-x-2 pb-2">
        <div className="flex items-center space-x-2">
          {bet.result === 'win' ? <VictoryIcon className="h-8 w-8" /> : <DefeatIcon className="h-8 w-8" />}
          <CardTitle className={`text-2xl font-headline ${bet.result === 'win' ? 'text-green-600' : 'text-destructive'}`}>
            {bet.result === 'win' ? 'Victory!' : 'Defeat'}
          </CardTitle>
        </div>
        <div className="text-lg font-semibold text-accent">
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(bet.amount)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Against: <span className="font-semibold text-foreground">{bet.opponentTag}</span></p>
        <p className="text-sm text-muted-foreground">Date: {new Date(bet.matchDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm shadow-card-medieval border-2 border-primary-dark">
        <CardHeader>
          <CardTitle className="text-4xl font-headline text-primary flex items-center">
            <ScrollText className="mr-3 h-10 w-10 text-accent" /> Match History
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Review your past duels and glories.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-primary/10 p-2 rounded-lg">
          <TabsTrigger value="all" className="text-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md py-3">All ({bets.length})</TabsTrigger>
          <TabsTrigger value="won" className="text-lg data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md py-3">Won ({wonBets.length})</TabsTrigger>
          <TabsTrigger value="lost" className="text-lg data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:shadow-md py-3">Lost ({lostBets.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {bets.length === 0 ? (
             <Card className="text-center p-10 shadow-card-medieval border-2 border-border">
                <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No matches played yet.</p>
                <p className="text-sm text-muted-foreground">Go find a match and start your legend!</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bets.map(bet => <BetCard key={bet.id} bet={bet} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="won" className="mt-6">
         {wonBets.length === 0 ? (
             <Card className="text-center p-10 shadow-card-medieval border-2 border-border">
                <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No victories yet.</p>
                 <p className="text-sm text-muted-foreground">Keep dueling to claim your wins!</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {wonBets.map(bet => <BetCard key={bet.id} bet={bet} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="lost" className="mt-6">
          {lostBets.length === 0 ? (
             <Card className="text-center p-10 shadow-card-medieval border-2 border-border">
                <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No defeats on record!</p>
                <p className="text-sm text-muted-foreground">Either you're undefeated or haven't played yet.</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lostBets.map(bet => <BetCard key={bet.id} bet={bet} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function HistoryPage() {
  return (
    <AppLayout>
      <HistoryPageContent />
    </AppLayout>
  );
}
