import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface MatchmakingProps {
  usuarioId: string;
}

type Estado =
  | 'idle'
  | 'buscando'
  | 'emparejado'
  | 'cancelado'
  | 'timeout'
  | 'error';

interface MatchEvent {
  match?: boolean;
  partida?: { id: string };
  timeout?: boolean;
  cancelado?: boolean;
}

export default function Matchmaking({ usuarioId }: MatchmakingProps) {
  const [estado, setEstado] = useState<Estado>('idle');
  const sseRef = useRef<EventSource | null>(null);
  const router = useRouter();

  const limpiarSse = () => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      limpiarSse();
    };
  }, []);

  const abrirSse = () => {
    limpiarSse();
    const es = new EventSource(`/sse/matchmaking/${usuarioId}`);
    sseRef.current = es;

    es.onmessage = (e) => {
      try {
        const data: MatchEvent = JSON.parse(e.data);
        if (data.match && data.partida) {
          setEstado('emparejado');
          limpiarSse();
          router.push(`/partida/${data.partida.id}`);
        } else if (data.timeout) {
          setEstado('timeout');
          limpiarSse();
        } else if (data.cancelado) {
          setEstado('cancelado');
          limpiarSse();
        }
      } catch (err) {
        console.error('Error procesando SSE', err);
      }
    };

    es.onerror = (err) => {
      console.error('SSE error', err);
      setEstado('error');
    };
  };

  const buscarOponente = async () => {
    if (estado === 'buscando') return;
    setEstado('buscando');
    try {
      const resp = await fetch('/api/matchmaking/ejecutar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, modoJuego: 'classic' }),
      });
      const data = await resp.json();
      if (resp.ok) {
        if (data.status === 'esperando') {
          abrirSse();
        } else if (data.match && data.partida) {
          setEstado('emparejado');
          router.push(`/partida/${data.partida.id}`);
        } else {
          setEstado('error');
        }
      } else {
        setEstado('error');
      }
    } catch (err) {
      console.error('Error al buscar oponente', err);
      setEstado('error');
    }
  };

  const cancelarBusqueda = async () => {
    try {
      await fetch('/api/matchmaking/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId }),
      });
    } catch (err) {
      console.error('Error al cancelar', err);
    }
    limpiarSse();
    setEstado('cancelado');
  };

  return (
    <div className="space-y-4">
      <button
        onClick={buscarOponente}
        disabled={estado === 'buscando'}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Buscar oponente
      </button>

      {estado === 'buscando' && (
        <button
          onClick={cancelarBusqueda}
          className="ml-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Cancelar búsqueda
        </button>
      )}

      <div>
        {estado === 'idle' && <p>Listo para buscar.</p>}
        {estado === 'buscando' && <p>Buscando oponente...</p>}
        {estado === 'emparejado' && <p>Emparejado</p>}
        {estado === 'cancelado' && <p>Búsqueda cancelada</p>}
        {estado === 'timeout' && <p>No se encontró oponente</p>}
        {estado === 'error' && <p>Ocurrió un error</p>}
      </div>
    </div>
  );
}
