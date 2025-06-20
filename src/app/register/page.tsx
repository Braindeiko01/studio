
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CartoonButton } from '@/components/ui/CartoonButton';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CrownIcon, PhoneIcon, RegisterIcon, UserIcon as AppUserIcon, GoogleIcon } from '@/components/icons/ClashRoyaleIcons';
import { LinkIcon as LucideLinkIcon, ShieldQuestionIcon, MailIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { CompleteProfileFormValues, GoogleAuthValues, RegisterWithGoogleData, User } from '@/types';
import { registerUserAction } from '@/lib/actions';

// Schema para el segundo paso: completar perfil (simplificado)
const completeProfileSchema = z.object({
  phone: z.string().min(7, "El número de teléfono debe tener al menos 7 dígitos").regex(/^\d+$/, "El número de teléfono solo debe contener dígitos"),
  friendLink: z.string()
    .url({ message: "El link de invitación debe ser una URL válida." })
    .regex(/^https:\/\/link\.clashroyale\.com\/invite\/friend\/es\?tag=([0289PYLQGRJCUV]{3,})&token=[a-z0-9]+&platform=(android|ios)$/, { message: "Formato de link de invitación de Clash Royale inválido." }),
});

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [googleAuthData, setGoogleAuthData] = useState<GoogleAuthValues | null>(null);
  const [step, setStep] = useState(1);

  const form = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      phone: '',
      friendLink: '',
    },
  });

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push('/');
    }
  }, [auth.isAuthenticated, router]);
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    const simulatedGoogleData: GoogleAuthValues = {
      googleId: `google-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      email: `user${Math.floor(Math.random()*1000)}@example.com`,
      username: `GoogleUser${Math.floor(Math.random()*100)}`, // Campo 'nombre' de Google
      avatarUrl: `https://placehold.co/100x100.png?text=G${Math.floor(Math.random()*10)}`,
    };
    setGoogleAuthData(simulatedGoogleData);
    form.reset({ phone: '', friendLink: '' });
    setStep(2);
    setIsLoading(false);
    toast({ title: "Conectado con Google", description: `Hola ${simulatedGoogleData.username}, por favor completa tu perfil.`});
  };


  const onSubmitProfile: SubmitHandler<CompleteProfileFormValues> = async (profileData) => {
    if (!googleAuthData) {
      toast({ title: "Error", description: "No se encontraron datos de Google. Por favor, intenta de nuevo.", variant: "destructive"});
      setStep(1);
      return;
    }
    setIsLoading(true);

    let extractedClashTag = '';
    if (profileData.friendLink) {
        const tagRegex = /tag=([0289PYLQGRJCUV]{3,})&/i;
        const match = profileData.friendLink.match(tagRegex);
        if (match && match[1]) {
            extractedClashTag = `#${match[1].toUpperCase()}`;
        }
    }

    if (!extractedClashTag) {
        toast({ title: "Error de Formulario", description: "No se pudo extraer el Tag de Clash Royale del link de amigo. Por favor, verifica el link.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    const fullRegistrationData: RegisterWithGoogleData = {
      googleId: googleAuthData.googleId,
      email: googleAuthData.email,
      username: googleAuthData.username, // Este es el 'nombre' de Google
      avatarUrl: googleAuthData.avatarUrl,
      phone: profileData.phone,
      friendLink: profileData.friendLink,
      clashTag: extractedClashTag,
    };

    const result = await registerUserAction(fullRegistrationData);

    if (result.user) {
      auth.login(result.user as User); // Asegurar el tipo User
      toast({
        title: "¡Registro Exitoso!",
        description: `¡Bienvenido a CR Duels, ${result.user.username}!`,
        variant: "default",
      });
      router.push('/');
    } else if (result.error) {
      toast({
        title: "Error de Registro",
        description: result.error,
        variant: "destructive",
      });
      if (result.error.includes("ya está registrado") || result.error.includes("ya está en uso")) {
        setStep(1); 
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 font-body animate-fade-in-up">
      <Card className="w-full max-w-lg shadow-card-medieval border-2 border-accent">
        <CardHeader className="text-center">
          <CrownIcon className="mx-auto h-16 w-16 text-accent mb-4" />
          <CardTitle className="text-4xl font-headline text-accent">
            {step === 1 ? "Crea Tu Cuenta" : `Completa tu Perfil, ${googleAuthData?.username || ''}`}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            {step === 1 ? "¡Únete a CR Duels y empieza a apostar!" : "Necesitamos unos detalles más para empezar."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <CartoonButton 
              onClick={handleGoogleSignIn} 
              className="w-full" 
              variant="default" 
              disabled={isLoading}
              iconLeft={<GoogleIcon className="h-6 w-6"/>}
            >
              {isLoading ? 'Conectando...' : 'Continuar con Google'}
            </CartoonButton>
          )}

          {step === 2 && googleAuthData && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-6">
                 {/* Campo de Email (No editable, solo informativo si se decide mostrar) */}
                 {/* 
                 <div>
                    <Label className="text-lg text-foreground flex items-center"><MailIcon className="mr-2 h-5 w-5 text-primary" />Correo Electrónico (de Google)</Label>
                    <Input value={googleAuthData.email} readOnly className="text-base py-5 border-2 focus:border-primary bg-muted/50 cursor-not-allowed mt-1" />
                 </div>
                 */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg text-foreground flex items-center"><PhoneIcon className="mr-2 h-5 w-5 text-primary" />Número de teléfono - Nequi</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="ej. 3001234567" {...field} className="text-base py-5 border-2 focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">Este número se usará para tu cuenta y para transacciones Nequi.</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="friendLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg text-foreground flex items-center"><LucideLinkIcon className="mr-2 h-5 w-5 text-primary" />Link de Amigo de Clash Royale</FormLabel>
                      <FormControl>
                        <Input placeholder="https://link.clashroyale.com/..." {...field} className="text-base py-5 border-2 focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">Tu Tag de jugador (ej. #P01Y2G3R) se extraerá automáticamente de este link.</p>
                    </FormItem>
                  )}
                />
                <CartoonButton type="submit" variant="accent" className="w-full mt-8" disabled={isLoading} iconLeft={<RegisterIcon />}>
                  {isLoading ? 'Registrando...' : 'Completar Registro y Jugar'}
                </CartoonButton>
                 <Button variant="outline" onClick={() => { setStep(1); setGoogleAuthData(null); }} className="w-full mt-3">
                    Cancelar y Volver
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-1 mt-4">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?
          </p>
          <Button variant="link" asChild className="text-primary hover:text-accent font-semibold text-base">
            <Link href="/login">Inicia Sesión Aquí</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
    
