
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CartoonButton } from '@/components/ui/CartoonButton';
import { SaldoIcon, FindMatchIcon } from '@/components/icons/ClashRoyaleIcons';

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
              <CardTitle className="text-3xl font-headline text-primary">{user.username}</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">¡Bienvenido de nuevo, Duelista!</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end text-2xl font-bold text-accent">
              <SaldoIcon className="h-7 w-7 mr-2" />
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(user.balance)}
            </div>
            <p className="text-sm text-muted-foreground">Saldo Actual</p>
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
            Buscar Duelo ($6,000 COP)
          </CartoonButton>
        </CardContent>
      </Card>
      
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
