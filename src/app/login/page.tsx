
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CartoonButton } from '@/components/ui/CartoonButton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CrownIcon, GoogleIcon } from '@/components/icons/ClashRoyaleIcons'; // Assuming GoogleIcon is in ClashRoyaleIcons
import { useToast } from "@/hooks/use-toast";
import { loginWithGoogleAction } from '@/lib/actions';
import type { User, GoogleAuthValues } from '@/types';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push('/');
    }
  }, [auth.isAuthenticated, router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Simulate Google Sign-In popup and data retrieval
    // In a real app, this would involve a Google SDK call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
    
    const simulatedGoogleData: GoogleAuthValues = {
      googleId: `google-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Unique simulated Google ID
      email: `testuser${Math.floor(Math.random() * 1000)}@example.com`,
      username: `GoogleUser${Math.floor(Math.random() * 100)}`,
      avatarUrl: `https://placehold.co/100x100.png?text=G${Math.floor(Math.random() * 10)}`,
    };

    try {
      const response = await loginWithGoogleAction(
        simulatedGoogleData.googleId,
        simulatedGoogleData.email,
        simulatedGoogleData.username,
        simulatedGoogleData.avatarUrl
      );

      if (response.user) {
        if (response.needsProfileCompletion) {
          // Store the partial user data temporarily to pre-fill the next step
          // In a real app, consider more secure ways to pass this if sensitive, or use state management
          try {
            sessionStorage.setItem('pendingGoogleAuthData', JSON.stringify(response.user));
            router.push('/register?step=2'); // Redirect to complete profile
          } catch (e) {
            console.error("Error setting sessionStorage:", e);
            toast({ title: "Error de Sesión", description: "No se pudo guardar la información temporal. Intenta de nuevo.", variant: "destructive"});
          }
        } else {
          auth.login(response.user as User); // Cast as User as needsProfileCompletion is false
          toast({ title: "¡Bienvenido!", description: `Hola ${response.user.username}`, variant: "default" });
          router.push('/');
        }
      } else {
        toast({ title: "Error", description: response.error || "No se pudo iniciar sesión.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error de autenticación", description: error.message || "Ocurrió un error inesperado.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  if (auth.isLoading) {
    return <p>Verificando autenticación...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 font-body animate-fade-in-up">
      <Card className="w-full max-w-md shadow-card-medieval border-2 border-accent">
        <CardHeader className="text-center">
          <CrownIcon className="mx-auto h-16 w-16 text-accent mb-4" />
          <CardTitle className="text-4xl font-headline text-accent">Iniciar Sesión</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Accede a tu cuenta de CR Duels para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-4">
          <CartoonButton 
            onClick={handleGoogleLogin} 
            className="w-full" 
            variant="default" 
            disabled={isLoading}
            iconLeft={<GoogleIcon className="h-6 w-6"/>}
          >
            {isLoading ? 'Conectando...' : 'Iniciar Sesión con Google'}
          </CartoonButton>
          <p className="text-sm text-muted-foreground">
            El inicio de sesión tradicional con teléfono y contraseña no está disponible. Por favor, usa Google.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-1 mt-4">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?
          </p>
          <Button variant="link" asChild className="text-primary hover:text-accent font-semibold text-base">
            <Link href="/register">Regístrate Aquí</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
