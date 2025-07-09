// src/app/models/producto.ts

// ... (other imports if any)

export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioInicial?: number;
  stock: number;
  imagenBase64?: string;

  categoriaId?: number | null;

  // New pharmaceutical-specific fields
  codigoBarra?: string;
  // --- CORRECCIÓN CLAVE AQUÍ ---
  fechaVencimiento?: string | null; // Ahora permite string, undefined, o null
  lote?: string;
  fabricante?: string;
  presentacion?: string;
  requiereReceta?: boolean;
}
