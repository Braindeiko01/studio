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
import { useToast } from "@/hooks/use-toast";
import type { User } from '@/types';

const registerSchema = z.object({
  phone: z.string().min(7, "Phone number must be at least 7 digits").regex(/^\d+$/, "Phone number must be digits only"),
  clashTag: z.string().min(3, "Clash Royale Tag must be at least 3 characters").regex(/^[0289PYLQGRJCUV]{3,}$/i, "Invalid Clash Royale Tag format (e.g. #XXXXXXXX)"),
  nequiAccount: z.string().min(7, "Nequi account must be at least 7 digits").regex(/^\d+$/, "Nequi account must be digits only"),
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
      id: `user-${Date.now()}`, // Generate a unique ID
      phone: data.phone,
      clashTag: data.clashTag.toUpperCase().startsWith('#') ? data.clashTag.toUpperCase() : `#${data.clashTag.toUpperCase()}`,
      nequiAccount: data.nequiAccount,
      avatarUrl: `https://placehold.co/100x100.png?text=${data.clashTag[0]?.toUpperCase() || 'R'}`,
      balance: 0, // New users start with 0 balance, or a small welcome gift
    };
    
    login(newUser); // Log the user in immediately after registration
    toast({
      title: "Registration Successful!",
      description: `Welcome to CR Duel, ${newUser.clashTag}!`,
      variant: "default",
    });
    router.push('/'); // Redirect to home or dashboard
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 font-body animate-fade-in-up">
      <Card className="w-full max-w-md shadow-card-medieval border-2 border-accent">
        <CardHeader className="text-center">
          <CrownIcon className="mx-auto h-16 w-16 text-accent mb-4" />
          <CardTitle className="text-4xl font-headline text-accent">Create Your Account</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Join CR Duel and start betting!
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
                    <FormLabel className="text-lg text-foreground flex items-center"><PhoneIcon className="mr-2 h-5 w-5 text-primary" />Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., 3001234567" {...field} className="text-lg py-6 border-2 focus:border-primary" />
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
                    <FormLabel className="text-lg text-foreground flex items-center"><ShieldIcon className="mr-2 h-5 w-5 text-primary" />Clash Royale Tag</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., #XXXXXXXX" {...field} className="text-lg py-6 border-2 focus:border-primary" />
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
                    <FormLabel className="text-lg text-foreground flex items-center"><NequiIcon className="mr-2 h-5 w-5 text-primary" />Nequi Account</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Your Nequi phone number" {...field} className="text-lg py-6 border-2 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CartoonButton type="submit" variant="accent" className="w-full mt-6" disabled={isLoading} iconLeft={<RegisterIcon />}>
                {isLoading ? 'Registering...' : 'Register & Play'}
              </CartoonButton>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?
          </p>
          <Button variant="link" asChild className="text-primary hover:text-accent font-semibold text-lg">
            <Link href="/login">Log In Here</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
