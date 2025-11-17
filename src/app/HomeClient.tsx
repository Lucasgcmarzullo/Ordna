'use client';

import { Suspense } from 'react';
import ClientPage from './ClientPage';

export default function HomeClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-cyan-600 to-blue-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Carregando...</p>
        </div>
      </div>
    }>
      <ClientPage />
    </Suspense>
  );
}
