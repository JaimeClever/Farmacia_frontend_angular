// src/app/models/ventas/venta-dto.ts

export interface VentaDTO {
  clienteId?: number | null; // ID del cliente existente (si se selecciona)
  usarDni: boolean; // Indica si se usará DNI para identificar/crear cliente
  dniCliente?: string | null; // DNI del cliente (si se usa usarDni)
  nombresCliente?: string | null; // Nombres del cliente (para cliente nuevo/anónimo si se usa DNI)
  items: VentaItemDTO[]; // Lista de productos en la venta
}

export interface VentaItemDTO { // <--- ¡ESTA LÍNEA DEBE TENER 'export' AL INICIO!
  productoId: number;
  cantidad: number;
}
