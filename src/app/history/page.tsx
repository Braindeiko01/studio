
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
  const lostBets = bets.f<ctrl63>