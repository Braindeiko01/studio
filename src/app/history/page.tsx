
"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import type { Bet } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollTextIcon, VictoryIcon, DefeatIcon, InfoIcon } from '@/components/icons/ClashRoyaleIcons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Ya no se usa localStorage directamente aquí para los bets, se simulará o vendrá del contexto/estado
// import { getLocalStorageItem, setLocalStorageItem } from '@/lib/storage';

// Ya no se usa esta llave directamente, la lógica de bets se manejará de forma diferente sin persistencia global.
// const BET_HISTORY_STORAGE_KEY = 'crDuelsBetHistory';

const HistoryPageContent = () => {
  const { user, isLoading: authIsLoading } = useAuth(); // Renombrado isLoading para evitar conflicto
  const [bets, setBets] = useState<Bet[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (!authIsLoading && user) {
      // Simulación: Si tuviéramos un backend, aquí se haría un fetch del historial de apuestas del usuario.
      // Por ahora, si el usuario tiene un historial de apuestas en su objeto (lo cual no es el caso actualmente),
      // o si queremos mockearlo, lo haríamos aquí.
      // Como no hay persistencia de bets entre sesiones sin localStorage y sin BD,
      // el historial estará vacío o será mockeado cada vez.
      
      // Vamos a mantener la lógica de mock data si no hay bets, para que la página no esté siempre vacía.
      // En un sistema real, esto vendría del servidor.
      // Para la simulación, necesitamos una forma de "recordar" los bets del usuario si es que se guardaron en una sesión previa.
      // Como hemos quitado localStorage, cada vez que se cargue esta página, se usarán los mocks si no hay otra fuente.
      // Si la lógica de 'bets' se almacenara en el objeto `user` (no es el caso), podríamos usar eso.

      const mockBets: Bet[] = [
        { id: 'bet1', userId: user.id, matchId: 'match1', amount: 6000, result: 'win', opponentTag: 'RivalPlayer#1', matchDate: new Date(Date.now() - 86400000).toISOString() },
        { id: 'bet2', userId: user.id, matchId: 'match2', amount: 6000, result: 'loss', opponentTag: 'ProGamer#X', matchDate: new Date(Date.now() - 2 * 86400000).toISOString() },
        { id: 'bet3', userId: user.id, matchId: 'match3', amount: 6000, result: 'win', opponentTag: 'DuelMaster#7', matchDate: new Date(Date.now() - 3 * 86400000).toISOString() },
      ].sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
      
      // Para esta simulación, mostraremos los mock bets.
      // En un sistema real, `setBets` recibiría los datos del servidor.
      setBets(mockBets);
      setIsPageLoading(false);

    } else if (!authIsLoading && !user) {
      setIsPageLoading(false); // No hay usuario, no hay historial que cargar
    }
  }, [user, authIsLoading]);

  if (isPageLoading || authIsLoading) return <p>Cargando historial de duelos...</p>;
  if (!user) return <p>Debes iniciar sesión para ver tu historial.</p>; // Mensaje actualizado

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
