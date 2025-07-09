// src/app/models/detalle-venta.ts
// Importa otros modelos si DetalleVenta depende de ellos, por ejemplo, Producto, Venta
import { Producto } from './producto'; // Asumiendo que tienes un modelo Producto
// import { Venta } from './venta'; // Descomenta si DetalleVenta hace referencia a un modelo Venta

export interface DetalleVenta {
  id?: number; // 'id' podría ser opcional si es nuevo
  cantidad: number;
  precioUnitario: number;
  subtotal?: number; // Calculado, usualmente. Opcional.
  producto: Producto; // Esto se vincula a tu modelo Producto
  // venta?: Venta; // Descomenta si DetalleVenta hace referencia a un modelo Venta
  // Agrega cualquier otra propiedad que exista en tu entidad DetalleVenta de Spring Boot
}
