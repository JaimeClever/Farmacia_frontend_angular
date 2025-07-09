export interface ReportePorDiaDTO {
  fecha: string; // ISO date string "YYYY-MM-DD"
  cantidadVentas: number;
  totalVentas: number;
}

export interface ReportePorProductoDTO {
  productoId: number;
  productoNombre: string;
  totalCantidadVendida: number;
  totalIngresosGenerados: number;
}

export interface ReportePorVendedorDTO {
  vendedorId: number;
  vendedorUsername: string;
  cantidadVentas: number;
  totalVendido: number;
}
