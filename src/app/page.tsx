
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CartoonButton } from '@/components/ui/CartoonButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SaldoIcon, FindMatchIcon, Gem } from '@/components/icons/ClashRoyaleIcons'; // Gem puede ser para depósito
import { useToast } from "@/hooks/use-toast";
import { Coins } from 'lucide-react';


const HomePageContent = () => {
  const { user, depositBalance } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  if (!user) {
    return <p>Cargando datos del usuario...</p>;
  }

  const handleFindMatch = () => {
    router.push('/matching');
  };

  const handleOpenDepositModal = () => {
    setIsDepositModalOpen(true);
    setDepositAmount('');
  };

  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false);
  };

  const handleDepositConfirm = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Monto Inválido",
        description: "Por favor, ingresa un monto de depósito válido y positivo.",
        variant: "destructive",
      });
      return;
    }
    depositBalance(amount);
    toast({
      title: "¡Depósito Confirmado!",
      description: `Has depositado ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount)}. Tu nuevo saldo es ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(user.balance + amount)}.`,
      variant: "default",
    });
    setIsDepositModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm shadow-card-medieval border-2 border-primary-dark overflow-hidden">
        <CardHeader className="bg-primary/10 p-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
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
        <CardContent className="p-6 text-center space-y-4">
          <CartoonButton
            size="default"
            variant="accent"
            onClick={handleFindMatch}
            className="w-full max-w-md mx-auto text-2xl py-6 shadow-lg hover:shadow-xl"
            iconLeft={<FindMatchIcon className="h-8 w-8" />}
          >
            Buscar Duelo ($6,000 COP)
          </CartoonButton>
          <CartoonButton
            size="medium"
            variant="secondary"
            onClick={handleOpenDepositModal}
            className="w-full max-w-xs mx-auto text-lg py-3"
            iconLeft={<Coins className="h-6 w-6" />}
          >
            Depositar Saldo
          </CartoonButton>
        </CardContent>
      </Card>

      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <Card className="w-full max-w-md shadow-xl border-2 border-accent">
            <CardHeader>
              <CardTitle className="text-3xl font-headline text-accent text-center">Depositar Saldo</CardTitle>
              <CardDescription className="text-center text-muted-foreground mt-2">
                Para depositar, realiza una transferencia Nequi a la cuenta <strong className="text-primary">3XX-XXX-XXXX</strong>.
                Luego, ingresa el monto exacto transferido y confirma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="depositAmount" className="text-lg text-foreground mb-2 block">
                  Monto a Depositar (COP)
                </Label>
                <Input 
                  id="depositAmount" 
                  type="number" 
                  placeholder="ej. 10000" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="text-lg py-3 h-12 border-2 focus:border-primary"
                  min="1000" // Ejemplo de monto mínimo
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={handleCloseDepositModal} className="w-full sm:w-auto text-lg py-3">Cancelar</Button>
              <CartoonButton 
                onClick={handleDepositConfirm} 
                className="w-full sm:w-auto"
                size="medium"
                iconLeft={<Coins className="h-5 w-5" />}
              >
                Confirmar Depósito
              </CartoonButton>
            </CardFooter>
          </Card>
        </div>
      )}
      
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
