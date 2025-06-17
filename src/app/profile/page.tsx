"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CartoonButton } from '@/components/ui/CartoonButton';
import { ShieldIcon, NequiIcon, PhoneIcon, Edit3, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';

const ProfilePageContent = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    clashTag: user?.clashTag || '',
    nequiAccount: user?.nequiAccount || '',
    avatarUrl: user?.avatarUrl || '',
  });

  if (!user) return <p>Loading profile...</p>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      if (formData.clashTag && formData.nequiAccount) {
        updateUser({ 
          clashTag: formData.clashTag, 
          nequiAccount: formData.nequiAccount,
          avatarUrl: formData.avatarUrl || user.avatarUrl // Keep old if new is empty
        });
        toast({ title: "Profile Updated!", description: "Your changes have been saved.", variant: "default" });
      } else {
        toast({ title: "Error", description: "Fields cannot be empty.", variant: "destructive"});
        // Reset form data to current user data if save fails due to empty fields
        setFormData({ clashTag: user.clashTag, nequiAccount: user.nequiAccount, avatarUrl: user.avatarUrl });
      }
    } else {
      // Initialize form data with current user data when entering edit mode
      setFormData({ clashTag: user.clashTag, nequiAccount: user.nequiAccount, avatarUrl: user.avatarUrl });
    }
    setIsEditing(!isEditing);
  };

  const InfoRow = ({ icon, label, value, name, editingValue, onChange, isEditing }: { icon: React.ReactNode, label: string, value: string, name?: string, editingValue?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, isEditing?: boolean }) => (
    <div className="flex items-center space-x-4 py-3 border-b border-border last:border-b-0">
      <div className="flex-shrink-0 w-8 h-8 text-primary">{icon}</div>
      <div className="flex-grow">
        <p className="text-sm text-muted-foreground">{label}</p>
        {isEditing && name && onChange ? (
          <Input 
            name={name}
            value={editingValue} 
            onChange={onChange} 
            className="text-lg font-semibold border-2 focus:border-accent py-2" 
          />
        ) : (
          <p className="text-lg font-semibold text-foreground">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-card-medieval border-2 border-primary-dark overflow-hidden">
        <CardHeader className="bg-primary/10 text-center p-6">
          <Avatar className="h-32 w-32 mx-auto border-4 border-accent shadow-lg mb-4">
            <AvatarImage src={isEditing ? formData.avatarUrl : user.avatarUrl || `https://placehold.co/128x128.png?text=${user.clashTag?.[0] || 'U'}`} alt={user.clashTag} data-ai-hint="gaming avatar large" />
            <AvatarFallback className="text-5xl bg-primary/30 text-primary-foreground">{user.clashTag?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          {isEditing ? (
            <Input 
              name="avatarUrl"
              placeholder="Avatar URL (e.g. https://placehold.co/128x128.png)"
              value={formData.avatarUrl}
              onChange={handleInputChange}
              className="text-center text-lg font-semibold border-2 focus:border-accent py-2 mt-2"
            />
          ) : (
            <CardTitle className="text-4xl font-headline text-primary">{user.clashTag}</CardTitle>
          )}
          <CardDescription className="text-muted-foreground mt-1 text-lg">Manage your RoyaleDuel identity.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-2">
          <InfoRow icon={<ShieldIcon />} label="Clash Royale Tag" value={user.clashTag} name="clashTag" editingValue={formData.clashTag} onChange={handleInputChange} isEditing={isEditing} />
          <InfoRow icon={<NequiIcon />} label="Nequi Account" value={user.nequiAccount} name="nequiAccount" editingValue={formData.nequiAccount} onChange={handleInputChange} isEditing={isEditing} />
          <InfoRow icon={<PhoneIcon />} label="Registered Phone" value={user.phone} />
          <div className="flex items-center space-x-4 py-3">
             <div className="flex-shrink-0 w-8 h-8 text-primary">💰</div>
             <div className="flex-grow">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-lg font-semibold text-accent">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(user.balance)}</p>
             </div>
          </div>
        </CardContent>
        <CardFooter className="p-6">
          <CartoonButton 
            onClick={handleEditToggle} 
            variant={isEditing ? "accent" : "default"}
            className="w-full"
            iconLeft={isEditing ? <Save /> : <Edit3 />}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </CartoonButton>
        </CardFooter>
      </Card>
    </div>
  );
};

export default function ProfilePage() {
  return (
    <AppLayout>
      <ProfilePageContent />
    </AppLayout>
  );
}
