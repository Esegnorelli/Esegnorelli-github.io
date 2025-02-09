declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';

// Adicionar tipos para o Supabase
declare namespace Supabase {
  interface User {
    id: string;
    email?: string;
  }
} 