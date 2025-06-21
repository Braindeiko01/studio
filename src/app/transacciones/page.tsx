"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CartoonButton } from '@/components/ui/CartoonButton';
import { useToast } from '@/hooks/use-toast';
import useApprovedTransactionsSse, { ApprovedTransaction } from '@/hooks/useApprovedTransactionsSse';
import { approveTransactionAction } from '@/lib/actions';

export default function TransactionsPage() {
  const approved = useApprovedTransactionsSse();
  const { toast } = useToast();
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!transactionId) return;
    setLoading(true);
    const result = await approveTransactionAction(transactionId);
    setLoading(false);
    if (result.success) {
      toast({ title: 'Transacción aprobada', description: `ID ${transactionId} aprobada` });
      setTransactionId('');
    } else {
      toast({ title: 'Error', description: result.error || 'No se pudo aprobar', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl">Transacciones Aprobadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-6">
            {approved.length === 0 && (
              <li className="text-muted-foreground">Aún no hay transacciones aprobadas.</li>
            )}
            {approved.map((t: ApprovedTransaction) => (
              <li key={t.id} className="border p-2 rounded">
                <span className="font-semibold">{t.id}</span> - {t.tipo} por {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(t.monto)}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="ID de transacción"
            />
            <CartoonButton onClick={handleApprove} disabled={!transactionId || loading}>
              {loading ? 'Enviando...' : 'Aprobar'}
            </CartoonButton>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
