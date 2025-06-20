
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CartoonButton } from '@/components/ui/CartoonButton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CrownIcon, GoogleIcon } from '@/components/icons/ClashRoyaleIcons'; // Import GoogleIcon
import { useToast } from "@/hooks/use-toast";
import { loginWithGoogleAction } from '@/lib/actions'; // Usaremos este nuevo action
import type { GoogleAuthValues } from '@/types';

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
    // Simulación del flujo "Sign in with Google"
    // En una implementación real, aquí usarías Firebase Auth para obtener el usuario de Google.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de red
    
    // Simulamos datos de un usuario de Google existente o nuevo
    // Si el usuario ya existe en la base de datos simulada, el googleId coincidirá.
    // Si es un usuario nuevo para el backend, se registrará tras pedir completar perfil.
    const simulatedGoogleData: GoogleAuthValues = {
      googleId: `google-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Esto debería ser un ID persistente si el usuario ya existe en Google
      email: `loginexample${Math.floor(Math.random()*1000)}@example.com`,
      username: `ReturningGoogleUser${Math.floor(Math.random()*100)}`,
      avatarUrl: `https://placehold.co/100x100.png?text=L${Math.floor(Math.random()*10)}`,
    };

    // Intentamos "iniciar sesión" o registrar al usuario con estos datos simulados de Google
    const result = await loginWithGoogleAction(
      simulatedGoogleData.googleId, 
      simulatedGoogleData.email, 
      simulatedGoogleData.username,
      simulatedGoogleData.avatarUrl
    );

    if (result.user) {
      if (result.needsProfileCompletion) {
        // El usuario se autenticó con Google pero es nuevo en nuestra BD,
        // necesitamos redirigirlo para que complete su perfil.
        // Podríamos pasar los datos de Google a la página de registro/completar perfil
        // a través de query params o un estado global temporal si fuera necesario.
        // Por simplicidad, lo redirigimos a /register, que ahora maneja ese flujo.
        toast({
          title: "¡Casi Listo!",
          description: "Hemos conectado tu cuenta de Google. Por favor, completa tu perfil para continuar.",
          variant: "default",
        });
        // Guardamos los datos de google para pre-rellenar el form de completar perfil en /register
        // Esto es una simulación. En una app real, Firebase Auth manejaría este estado.
        sessionStorage.setItem('pendingGoogleAuthData', JSON.stringify(result.user));
        router.push('/register?step=2'); // Indica a la página de registro que es para completar perfil
      } else {
        // El usuario ya existía y se cargaron sus datos completos.
        auth.login(result.user);
        toast({
          title: "¡Inicio de Sesión Exitoso!",
          description: `¡Bienvenido de nuevo, ${result.user.username}!`,
          variant: "default",
        });
        router.push('/');
      }
    } else if (result.error) {
      toast({
        title: "Error de Inicio de Sesión",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };
  
  // Efecto para leer datos de Google pendientes si venimos de un login que necesita completar perfil
  useEffect(() => {
    if (router.query?.step === '2' && sessionStorage.getItem('pendingGoogleAuthData')) {
        const data = JSON.parse(sessionStorage.getItem('pendingGoogleAuthData')!);
        // Aquí, la página de registro (si es a la que se redirige) podría usar 'data'
        // para pre-rellenar el formulario de completar perfil.
        // Como esta es la página de login, solo limpiamos.
        sessionStorage.removeItem('pendingGoogleAuthData');
    }
  }, [router.query]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 font-body animate-fade-in-up">
      <Card className="w-full max-w-md shadow-card-medieval border-2 border-primary-dark">
        <CardHeader className="text-center">
          <CrownIcon className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-4xl font-headline text-primary">CR Duels</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Inicia sesión o regístrate para empezar a jugar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CartoonButton 
            onClick={handleGoogleLogin} 
            className="w-full" 
            variant="default" 
            disabled={isLoading || auth.isLoading}
            iconLeft={<GoogleIcon className="h-6 w-6"/>}
          >
            {isLoading || auth.isLoading ? 'Conectando...' : 'Continuar con Google'}
          </CartoonButton>
           <p className="text-xs text-muted-foreground mt-4 text-center">
            El inicio de sesión tradicional con teléfono y contraseña ya no está disponible. Utiliza Google para acceder.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            ¿Es tu primera vez aquí?
          </p>
          <Button variant="link" asChild className="text-primary hover:text-accent font-semibold text-lg">
            <Link href="/register">Regístrate con Google</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    