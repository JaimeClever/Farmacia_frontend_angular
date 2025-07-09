// src/app/models/devolucion-entity.ts

// Asegúrate de que esta importación apunta al archivo correcto
import { DetalleVenta } from './detalle-venta';
// import { Venta } from './venta'; // Si usas Venta en DetalleVenta y tienes el modelo

export interface Devolucion {
  id: number;
  cantidadDevuelta: number;
  motivo: string;
  fecha: string; // O Date, dependiendo de cómo manejes las fechas
  detalleVenta: DetalleVenta; // Ahora TypeScript sabe que DetalleVenta viene del archivo importado
  // Agrega cualquier otro campo de tu entidad Devolucion de Java
}

// *** ELIMINA O COMENTA ESTA SECCIÓN COMPLETA si ya tienes './detalle-venta.ts' ***
// La declaración de DetalleVenta local que estaba aquí es la que causa el conflicto.
/*
export interface DetalleVenta {
  id: number;
  cantidad: number;
  precioUnitario: number;
  // ... otras propiedades de DetalleVenta si las tenías aquí
}
*/
