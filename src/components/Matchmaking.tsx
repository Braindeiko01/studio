"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CartoonButton } from '@/components/ui/CartoonButton';

interface MatchmakingProps {
  jwtToken: string;
}

interface SseMessage {
  match?: boolean;
  partida?: { id: string };
  timeout?: boolean;
  cancelado?: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export default function Matchmaking({ jwtToken }: MatchmakingProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'buscando' | 'emparejado' | 'cancelado' | 'timeout' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const closeSse = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  const startSearch = async () => {
    if (status === 'buscando') return; // evitar duplicados
    setStatus('buscando');
    setMessage('Buscando oponente...');
    try {
      const res = await fetch(`${BACKEND_URL}/api/matchmaking/ejecutar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ modoJuego: 'classic' }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'esperando') {
        openSse();
      } else if (data.match && data.partida) {
        setStatus('emparejado');
        setMessage('Emparejado');
        router.push(`/partida/${data.partida.id}`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Error');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Error de red');
    }
  };

  const openSse = async () => {
    closeSse();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch(`${BACKEND_URL}/sse/matchmaking`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        signal: controller.signal,
      });
      if (!response.body) {
        throw new Error('Sin cuerpo en SSE');
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const chunk = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (chunk.startsWith('data:')) {
            try {
              const data: SseMessage = JSON.parse(chunk.slice(5).trim());
              handleSseMessage(data);
            } catch (err) {
              console.error('Error al parsear SSE', err);
            }
          }
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error('Error SSE', err);
        setStatus('error');
        setMessage('Error de conexión');
      }
    }
  };

  const handleSseMessage = (data: SseMessage) => {
    if (data.match && data.partida) {
      setStatus('emparejado');
      setMessage('Emparejado');
      closeSse();
      router.push(`/partida/${data.partida.id}`);
    } else if (data.timeout) {
      setStatus('timeout');
      setMessage('No se encontró oponente.');
      closeSse();
    } else if (data.cancelado) {
      setStatus('cancelado');
      setMessage('Búsqueda cancelada');
      closeSse();
    }
  };

  const cancelSearch = async () => {
    if (status !== 'buscando') return;
    try {
      await fetch(`${BACKEND_URL}/api/matchmaking/cancelar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
    } catch (err) {
      // ignore error
    }
    closeSse();
    setStatus('cancelado');
    setMessage('Búsqueda cancelada');
  };

  useEffect(() => {
    return () => {
      closeSse();
    };
  }, []);

  return (
    <div className="space-y-2">
      {status !== 'buscando' ? (
        <CartoonButton onClick={startSearch}>Buscar oponente</CartoonButton>
      ) : (
        <CartoonButton variant="secondary" onClick={cancelSearch}>
          Cancelar búsqueda
        </CartoonButton>
      )}
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}

