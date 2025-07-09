// src/app/models/ventas/venta-response-dto.ts
// import { LocalDate } from '@js-joda/core'; // <-- ELIMINAR esta línea

export interface VentaDetalleResponseDTO {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaResponseDTO {
  id: number;
  fecha: string; // <-- Cambiado de LocalDate a string
  total: number;
  clienteId?: number;
  clienteNombre: string;
  clienteDni: string;
  vendedorId: number;
  vendedorUsername: string;
  detalles: VentaDetalleResponseDTO[];
}
