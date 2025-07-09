// src/app/models/cliente.ts
export interface Cliente {
  id?: number;
  nombres: string;
  dni?: string;
  direccion?: string;
  telefono?: string;
  email?: string; // <--- Maybe it's 'email' instead of 'correo'?
  correo?: string; // <--- ADD THIS LINE if your backend uses 'correo'
  // Add any other properties you have for your Cliente entity
}
