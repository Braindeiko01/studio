
"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import type { Bet } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollTextIcon, VictoryIcon, DefeatIcon, InfoIcon } from '@/components/icons/ClashRoyaleIcons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HistoryPageContent = () => {
  const { user, isLoading: authIsLoading } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (!authIsLoading) {
      if (user) {
        // En un sistema real, aquí se haría un fetch del historial de apuestas del usuario desde un backend.
        // Como actualmente no hay persistencia de apuestas entre sesiones ni un backend,
        // el historial de `bets` permanecerá vacío.
        setBets([]); // Inicializa como vacío.
      } else {
        setBets([]); // También vacío si no hay usuario
      }
      setIsPageLoading(false);
    }
  }, [user, authIsLoading]);

  if (isPageLoading || authIsLoading) return <p>Cargando historial de duelos...</p>;
  if (!user) return <p>Debes iniciar sesión para ver tu historial.</p>;

  const wonBets = bets.filter(bet => bet.result === 'win');
  const lostBets = bets.filter(bet => bet.result === 'loss');

  const BetCard = ({ bet }: { bet: Bet }) => (
    <Card className="shadow-card-medieval border-2 border-primary-dark/50 hover:border-accent transition-all duration-200 ease-in-out transform hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-x-2 pb-2">
        <div className="flex items-center space-x-2">
          {bet.result === 'win' ? <VictoryIcon className="h-8 w-8" /> : <DefeatIcon className="h-8 w-8" />}
          <CardTitle className={`text-2xl font-headline ${bet.result === 'win' ? 'text-green-600' : 'text-destructive'}`}>
            {bet.result === 'win' ? '¡Victoria!' : 'Derrota'}
          </CardTitle>
        </div>
        <div className="text-lg font-semibold text-accent">
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(bet.amount)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Contra: <span className="font-semibold text-foreground">{bet.opponentTag}</span></p>
        <p className="text-sm text-muted-foreground">Fecha: {new Date(bet.matchDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </CardContent>
    </Card>
  );

  const NoMatchesCard = ({title, description} : {title: string, description: string}) => (
    <Card className="text-center p-10 shadow-card-medieval border-2 border-border col-span-full">
        <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm shadow-card-medieval border-2 border-primary-dark">
        <CardHeader>
          <CardTitle className="text-4xl font-headline text-primary flex items-center">
            <ScrollTextIcon className="mr-3 h-10 w-10 text-accent" /> Historial de Duelos
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Revisa tus duelos pasados y tus glorias.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-primary/10 p-2 rounded-lg">
          <TabsTrigger value="all" className="text-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md py-3">Todos ({bets.length})</TabsTrigger>
          <TabsTrigger value="won" className="text-lg data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md py-3">Ganados ({wonBets.length})</TabsTrigger>
          <TabsTrigger value="lost" className="text-lg data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:shadow-md py-3">Perdidos ({lostBets.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {bets.length === 0 ? (
             <NoMatchesCard title="Aún no has jugado duelos." description="¡Busca un duelo y comienza tu leyenda!"/>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bets.map(bet => <BetCard key={bet.id} bet={bet} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="won" className="mt-6">
         {wonBets.length === 0 ? (
             <NoMatchesCard title="Aún no tienes victorias." description="¡Sigue batallando para reclamar tus triunfos!"/>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {wonBets.map(bet => <BetCard key={bet.id} bet={bet} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="lost" className="mt-6">
          {lostBets.length === 0 ? (
             <NoMatchesCard title="¡Sin derrotas registradas!" description="Estás invicto o aún no has jugado."/>
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
