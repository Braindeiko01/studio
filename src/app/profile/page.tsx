
"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Label component might not be used if InfoRow handles labels
import { CartoonButton } from '@/components/ui/CartoonButton';
import { ShieldIcon as ClashTagIcon, Edit3, Save, Link as LinkIcon } from 'lucide-react'; // Used Lucide's Shield for ClashTag
import { NequiIcon, PhoneIcon } from '@/components/icons/ClashRoyaleIcons'; // Custom icons
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
    friendLink: user?.friendLink || '',
  });

  if (!user) return <p>Cargando perfil...</p>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Validate friendLink format if it's provided and changed
      if (formData.friendLink && !/^https:\/\/link\.clashroyale\.com\/invite\/friend\/es\?tag=[0289PYLQGRJCUV]{3,}&token=[a-z0-9]+&platform=(android|ios)$/.test(formData.friendLink)) {
        toast({ title: "Error", description: "El formato del link de amigo de Clash Royale es inválido.", variant: "destructive"});
        return;
      }

      if (formData.clashTag && formData.nequiAccount) {
        updateUser({ 
          clashTag: formData.clashTag, 
          nequiAccount: formData.nequiAccount,
          avatarUrl: formData.avatarUrl || user.avatarUrl, // Keep old if new is empty
          friendLink: formData.friendLink || '', // Allow clearing the link
        });
        toast({ title: "¡Perfil Actualizado!", description: "Tus cambios han sido guardados.", variant: "default" });
      } else {
        toast({ title: "Error", description: "Los campos de Tag y Nequi no pueden estar vacíos.", variant: "destructive"});
        setFormData({ clashTag: user.clashTag, nequiAccount: user.nequiAccount, avatarUrl: user.avatarUrl, friendLink: user.friendLink });
      }
    } else {
      setFormData({ clashTag: user.clashTag, nequiAccount: user.nequiAccount, avatarUrl: user.avatarUrl, friendLink: user.friendLink || '' });
    }
    setIsEditing(!isEditing);
  };

  const InfoRow = ({ icon, label, value, name, editingValue, onChange, isEditing, type = "text", placeholder }: { icon: React.ReactNode, label: string, value: string, name?: string, editingValue?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, isEditing?: boolean, type?: string, placeholder?: string }) => (
    <div className="flex items-center space-x-4 py-3 border-b border-border last:border-b-0">
      <div className="flex-shrink-0 w-8 h-8 text-primary flex items-center justify-center">{icon}</div>
      <div className="flex-grow">
        <p className="text-sm text-muted-foreground">{label}</p>
        {isEditing && name && onChange ? (
          <Input 
            type={type}
            name={name}
            value={editingValue} 
            onChange={onChange} 
            placeholder={placeholder}
            className="text-lg font-semibold border-2 focus:border-accent py-2" 
          />
        ) : (
          <p className="text-lg font-semibold text-foreground break-all">{value || "-"}</p>
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
            <>
              <Input 
                name="clashTag"
                placeholder="Tu Tag de Clash Royale"
                value={formData.clashTag}
                onChange={handleInputChange}
                className="text-center text-2xl font-headline text-primary border-2 focus:border-accent py-2 mt-2"
              />
              <Input 
                name="avatarUrl"
                placeholder="URL del Avatar (ej. https://placehold.co/128x128.png)"
                value={formData.avatarUrl}
                onChange={handleInputChange}
                className="text-center text-sm font-semibold border-2 focus:border-accent py-2 mt-2"
              />
            </>
          ) : (
            <CardTitle className="text-4xl font-headline text-primary">{user.clashTag}</CardTitle>
          )}
          <CardDescription className="text-muted-foreground mt-1 text-lg">Administra tu identidad en CR Duels.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-2">
          <InfoRow icon={<ClashTagIcon />} label="Tag de Clash Royale" value={user.clashTag} name="clashTag" editingValue={formData.clashTag} onChange={handleInputChange} isEditing={isEditing} />
          <InfoRow icon={<NequiIcon />} label="Cuenta Nequi" value={user.nequiAccount} name="nequiAccount" editingValue={formData.nequiAccount} onChange={handleInputChange} isEditing={isEditing} />
          <InfoRow icon={<LinkIcon />} label="Link de Amigo Clash Royale" value={user.friendLink || "No establecido"} name="friendLink" editingValue={formData.friendLink} onChange={handleInputChange} isEditing={isEditing} placeholder="https://link.clashroyale.com/..." />
          <InfoRow icon={<PhoneIcon />} label="Teléfono Registrado" value={user.phone} />
          <div className="flex items-center space-x-4 py-3">
             <div className="flex-shrink-0 w-8 h-8 text-primary flex items-center justify-center">💰</div>
             <div className="flex-grow">
                <p className="text-sm text-muted-foreground">Saldo</p>
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
            {isEditing ? 'Guardar Cambios' : 'Editar Perfil'}
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
