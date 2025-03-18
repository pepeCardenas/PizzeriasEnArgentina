'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string; details?: string } | null>(null);

  const recreateCache = async () => {
    if (!confirm('¿Estás seguro de que quieres recrear la caché? Esta acción eliminará todos los datos en caché.')) {
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/admin/recreate-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: 'Error al recrear la caché',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Gestión de Caché</h2>
        <p className="mb-4">
          Usa esta función para recrear la tabla de caché en MongoDB. Esto eliminará todos los datos en caché
          y creará una nueva colección con los índices apropiados.
        </p>
        
        <button
          onClick={recreateCache}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Recreando caché...' : 'Recrear Caché'}
        </button>
        
        {result && (
          <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-semibold">{result.success ? 'Éxito' : 'Error'}</p>
            <p>{result.message || result.error}</p>
            {result.details && <p className="text-sm mt-2">{result.details}</p>}
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline">
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
