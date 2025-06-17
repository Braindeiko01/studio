
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
import { CrownIcon, NequiIcon, PhoneIcon, RegisterIcon, ShieldIcon } from '@/components/icons/ClashRoyaleIcons';
import { LinkIcon as LucideLinkIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { User } from '@/types';

const registerSchema = z.object({
  phone: z.string().min(7, "El número de teléfono debe tener al menos 7 dígitos").regex(/^\d+$/, "El número de teléfono solo debe contener dígitos"),
  clashTag: z.string().min(3, "El Tag de Clash Royale debe tener al menos 3 caracteres").regex(/^[0289PYLQGRJCUV]{3,}$/i, "Formato de Tag de Clash Royale inválido (ej. #XXXXXXXX)"),
  nequiAccount: z.string().min(7, "El número de teléfono Nequi debe tener al menos 7 dígitos").regex(/^\d+$/, "El número de teléfono Nequi solo debe contener dígitos"),
  friendLink: z.string()
    .url({ message: "El link de invitación debe ser una URL válida." })
    .regex(/^https:\/\/link\.clashroyale\.com\/invite\/friend\/es\?tag=[0289PYLQGRJCUV]{3,}&token=[a-z0-9]+&platform=(android|ios)$/, { message: "Formato de link de invitación de Clash Royale inválido. Ejemplo: https://link.clashroyale.com/invite/friend/es?tag=TAG&token=token&platform=android" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: '',
      clashTag: '',
      nequiAccount: '',
      friendLink: '',
    },
  });

 useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true);
    // Simulate API call for registration
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUser: User = {
      id: `user-${Date.now()}`,
      phone: data.phone,
      clashTag: data.clashTag.toUpperCase().startsWith('#') ? data.clashTag.toUpperCase() : `#${data.clashTag.toUpperCase()}`,
      nequiAccount: data.nequiAccount,
      friendLink: data.friendLink,
      avatarUrl: `https://placehold.co/100x100.png?text=${data.clashTag[0]?.toUpperCase() || 'R'}`,
      balance: 0, 
    };
    
    login(newUser); 
    toast({
      title: "¡Registro Exitoso!",
      description: `¡Bienvenido a CR Duels, ${newUser.clashTag}!`,
      variant: "default",
    });
    router.push('/'); 
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 font-body animate-fade-in-up">
      <Card className="w-full max-w-md shadow-card-medieval border-2 border-accent">
        <CardHeader className="text-center">
          <CrownIcon className="mx-auto h-16 w-16 text-accent mb-4" />
          <CardTitle className="text-4xl font-headline text-accent">Crea Tu Cuenta</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            ¡Únete a CR Duels y empieza a apostar!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-foreground flex items-center"><PhoneIcon className="mr-2 h-5 w-5 text-primary" />Número de Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="ej. 3001234567" {...field} className="text-lg py-6 border-2 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clashTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-foreground flex items-center"><ShieldIcon className="mr-2 h-5 w-5 text-primary" />Tag de Clash Royale</FormLabel>
                    <FormControl>
                      <Input placeholder="ej. #P01Y2G3R" {...field} className="text-lg py-6 border-2 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nequiAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-foreground flex items-center"><NequiIcon className="mr-2 h-5 w-5 text-primary" />Número de teléfono enlazado con Nequi</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Número de teléfono de tu cuenta Nequi" {...field} className="text-lg py-6 border-2 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="https://link.clashroyale.com/..." {...field} className="text-lg py-6 border-2 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">Puedes encontrarlo en Clash Royale: Social &gt; Amigos &gt; Invitar amigo.</p>
                  </FormItem>
                )}
              />
              <CartoonButton type="submit" variant="accent" className="w-full mt-6" disabled={isLoading} iconLeft={<RegisterIcon />}>
                {isLoading ? 'Registrando...' : 'Registrarse y Jugar'}
              </CartoonButton>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?
          </p>
          <Button variant="link" asChild className="text-primary hover:text-accent font-semibold text-lg">
            <Link href="/login">Inicia Sesión Aquí</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
