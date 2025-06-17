"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CartoonButton } from '@/components/ui/CartoonButton';
import { SaldoIcon, FindMatchIcon, SwordsIcon, ChestIcon } from '@/components/icons/ClashRoyaleIcons';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const HomePageContent = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    // This should ideally be handled by AuthGuard, but as a fallback:
    return <p>Loading user data...</p>;
  }

  const handleFindMatch = () => {
    router.push('/matching');
  };

  // Mock data for recent activity or stats
  const gamesPlayed = 15;
  const winRate = 60; // percentage
  const nextRewardProgress = 75; // percentage

  return (
    <div className="space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm shadow-card-medieval border-2 border-primary-dark overflow-hidden">
        <CardHeader className="bg-primary/10 p-6 flex flex-row items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-accent shadow-lg">
              <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100.png?text=${user.clashTag?.[0] || 'U'}`} alt={user.clashTag} data-ai-hint="gaming avatar" />
              <AvatarFallback className="text-3xl bg-primary/30 text-primary-foreground">{user.clashTag?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl font-headline text-primary">{user.clashTag}</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">Welcome back, Duelist!</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end text-2xl font-bold text-accent">
              <SaldoIcon className="h-7 w-7 mr-2" />
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(user.balance)}
            </div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <CartoonButton
            size="default"
            variant="accent"
            onClick={handleFindMatch}
            className="w-full max-w-md mx-auto text-2xl py-6 shadow-lg hover:shadow-xl"
            iconLeft={<FindMatchIcon className="h-8 w-8" />}
          >
            Find Match ($6,000 COP)
          </CartoonButton>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-card-medieval border-2 border-primary-dark">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <SwordsIcon className="mr-2 h-6 w-6 text-accent" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Games Played:</span>
              <span className="font-bold text-lg text-primary">{gamesPlayed}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Win Rate:</span>
              <span className="font-bold text-lg text-green-500">{winRate}%</span>
            </div>
            <Progress value={winRate} aria-label={`${winRate}% win rate`} className="h-3 [&>div]:bg-green-500" />
          </CardContent>
        </Card>

        <Card className="shadow-card-medieval border-2 border-primary-dark">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <ChestIcon className="mr-2 h-6 w-6 text-accent" />
              Next Reward
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">Complete 5 more matches to unlock a bonus chest!</p>
            <Progress value={nextRewardProgress} aria-label={`${nextRewardProgress}% progress to next reward`} className="h-3 [&>div]:bg-accent" />
             <p className="text-xs text-right text-muted-foreground">{nextRewardProgress}%</p>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
};

export default function HomePage() {
  return (
    <AppLayout>
      <HomePageContent />
    </AppLayout>
  );
}
