
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
import { SaldoIcon, FindMatchIcon } from '@/components/icons/ClashRoyaleIcons';
import { useToast } from "@/hooks/use-toast";
import { Coins, UploadCloud } from 'lucide-react';


const HomePageContent = () => {
  const { user, depositBalance } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositScreenshotFile, setDepositScreenshotFile] = useState<File | null>(null);

  if (!user) {
    return <p>Cargando datos del usuario...</p>;
  }

  const handleFindMatch = () => {
    router.push('/matching');
  };

  const handleOpenDepositModal = () => {
    setIsDepositModalOpen(true);
    setDepositAmount('6000'); 
    setDepositScreenshotFile(null);
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
    if (amount < 6000) {
      toast({
        title: "Monto Inválido",
        description: "El monto mínimo de depósito es de 6,000 COP.",
        variant: "destructive",
      });
      return;
    }
    if (amount % 6000 !== 0) {
      toast({
        title: "Monto Inválido",
        description: "El monto del depósito debe ser un múltiplo de 6,000 COP (ej. 6.000, 12.000, 18.000, etc.).",
        variant: "destructive",
      });
      return;
    }
    if (!depositScreenshotFile) {
      toast({
        title: "Comprobante Requerido",
        description: "Por favor, adjunta el comprobante de la transacción.",
        variant: "destructive",
      });
      return;
    }

    // depositBalance(amount); // This would actually add the balance
    toast({
      title: "¡Solicitud de Depósito Recibida!",
      description: `Has solicitado un depósito de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount)}. Tu comprobante (${depositScreenshotFile.name}) está siendo revisado. Tu saldo se actualizará una vez verificado.`,
      variant: "default",
    });
    setIsDepositModalOpen(false);
    setDepositAmount('6000');
    setDepositScreenshotFile(null);
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
                Realiza una transferencia Nequi a la cuenta <strong className="text-primary">305-288-1517</strong>.
                El monto del depósito debe ser un <strong className="text-primary">mínimo de 6,000 COP</strong> y en <strong className="text-primary">múltiplos de 6,000 COP</strong> (ej. 6.000, 12.000, 18.000, etc.).
                Luego, ingresa el monto exacto y adjunta el comprobante.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="depositAmount" className="text-lg text-foreground mb-2 block">
                  Monto a Depositar (COP)
                </Label>
                <Input 
                  id="depositAmount" 
                  type="number" 
                  placeholder="ej. 6000" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="text-lg py-3 h-12 border-2 focus:border-primary"
                  min="6000"
                  step="6000"
                />
              </div>
              <div>
                <Label htmlFor="depositScreenshot" className="text-lg text-foreground mb-2 block flex items-center">
                  <UploadCloud className="mr-2 h-5 w-5 text-primary" /> Adjuntar Comprobante Nequi
                </Label>
                <Input 
                  id="depositScreenshot" 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setDepositScreenshotFile(e.target.files ? e.target.files[0] : null)}
                  className="h-12 w-full border border-input rounded-md px-3 py-2 text-base file:bg-primary file:text-primary-foreground hover:file:bg-primary-dark file:rounded-md file:border-0 file:px-4 file:py-2 file:mr-3 file:font-semibold"
                />
                {depositScreenshotFile && <p className="text-sm text-muted-foreground mt-2">Seleccionado: {depositScreenshotFile.name}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 p-6 pt-0 mt-6">
              <Button variant="outline" onClick={handleCloseDepositModal} className="w-full sm:w-auto" size="sm">Cancelar</Button>
              <CartoonButton 
                onClick={handleDepositConfirm} 
                className="w-full sm:w-auto"
                size="small"
                iconLeft={<Coins className="h-5 w-5" />}
                disabled={!depositAmount || parseFloat(depositAmount) < 6000 || parseFloat(depositAmount) % 6000 !== 0 || !depositScreenshotFile}
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

