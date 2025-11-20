import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Configuração para deploy standalone (sem Vercel)
  output: 'standalone',
  
  // Configurações para reduzir erros de rede no console durante desenvolvimento
  onDemandEntries: {
    // Período em ms para manter páginas em memória
    maxInactiveAge: 25 * 1000,
    // Número de páginas que devem ser mantidas simultaneamente
    pagesBufferLength: 2,
  },
  
  // Desabilitar telemetria para reduzir requisições de rede
  telemetry: {
    enabled: false,
  },
  
  // Configurações de webpack para melhor tratamento de erros
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Configurar webpack para melhor tratamento de HMR
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    // Resolver problemas de importação circular
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        net: false,
        tls: false,
      },
    };
    
    return config;
  },
  
  // Configurações de transpilação
  transpilePackages: ['@supabase/supabase-js'],
};

export default nextConfig;
