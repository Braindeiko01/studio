
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
import { CrownIcon, LoginIcon, PhoneIcon } from '@/components/icons/ClashRoyaleIcons';
import { useToast } from "@/hooks/use-toast";
import type { User } from '@/types';

const loginSchema = z.object({
  phone: z.string().min(7, "El número de teléfono debe tener al menos 7 dígitos").regex(/^\d+$/, "El número de teléfono solo debe contener dígitos"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    // Simulate API call for login
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you would fetch user data based on phone number.
    // For this scaffold, we'll use a mock user if phone is "0000000" or create a new-like user.
    let mockUser: User;
    if (data.phone === "0000000") { // Demo existing user
        mockUser = {
            id: 'user-123-demo',
            phone: data.phone,
            clashTag: 'Player#ABC',
            nequiAccount: '3001112233', // Specific Nequi for demo user
            avatarUrl: 'https://placehold.co/100x100.png?text=P',
            balance: 50000,
            friendLink: 'https://link.clashroyale.com/invite/friend/es?tag=DEMOTAG&token=demotoken&platform=android',
        };
    } else { // Simulate a new user being "found" or a generic user for other numbers
        mockUser = {
            id: `user-${Date.now()}`,
            phone: data.phone,
            clashTag: 'NewUser#TAG',
            nequiAccount: data.phone, // Nequi number defaults to main phone
            avatarUrl: `https://placehold.co/100x100.png?text=${data.phone[0]}`,
            balance: 10000, // Starting balance
            friendLink: undefined, // New users would set this on registration
        };
    }
    
    login(mockUser);
    toast({
      title: "¡Inicio de Sesión Exitoso!",
      description: `¡Bienvenido de nuevo, ${mockUser.clashTag}!`,
      variant: "default",
    });
    router.push('/');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 font-body animate-fade-in-up">
      <Card className="w-full max-w-md shadow-card-medieval border-2 border-primary-dark">
        <CardHeader className="text-center">
          <CrownIcon className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-4xl font-headline text-primary">CR Duels</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Ingresa tu número de teléfono para unirte a la batalla!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-foreground flex items-center">
                      <PhoneIcon className="mr-2 h-5 w-5 text-primary" /> Número de Teléfono
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="ej. 3001234567" 
                        {...field}
                        className="text-lg py-6 border-2 focus:border-primary"
                        aria-label="Número de Teléfono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CartoonButton type="submit" className="w-full" disabled={isLoading} iconLeft={<LoginIcon />}>
                {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
              </CartoonButton>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?
          </p>
          <Button variant="link" asChild className="text-primary hover:text-accent font-semibold text-lg">
            <Link href="/register">Crear Cuenta</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
