// src/app/services/venta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaDTO } from '../models/ventas/venta-dto';
// --- SOLUCIÓN: Cambiado 'DetalleResponseDTO' a 'VentaDetalleResponseDTO' ---
import { VentaDetalleResponseDTO, VentaResponseDTO } from '../models/ventas/venta-response-dto';
import { ReportePorDiaDTO, ReportePorProductoDTO, ReportePorVendedorDTO } from '../models/ventas/reporte-dtos';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = 'http://localhost:8080/api/ventas'; // Ajusta esta URL a la de tu API si es diferente

  constructor(private http: HttpClient) { }

  crearVenta(venta: VentaDTO): Observable<VentaResponseDTO> {
    return this.http.post<VentaResponseDTO>(this.apiUrl, venta);
  }

  listarVentas(): Observable<VentaResponseDTO[]> {
    return this.http.get<VentaResponseDTO[]>(this.apiUrl);
  }

  obtenerReportePorDia(fechaDesde: string, fechaHasta: string): Observable<ReportePorDiaDTO[]> {
    return this.http.get<ReportePorDiaDTO[]>(`${this.apiUrl}/reportes/por-dia?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`);
  }

  obtenerReportePorProducto(fechaDesde: string, fechaHasta: string): Observable<ReportePorProductoDTO[]> {
    return this.http.get<ReportePorProductoDTO[]>(`${this.apiUrl}/reportes/por-producto?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`);
  }

  obtenerReportePorVendedor(fechaDesde: string, fechaHasta: string): Observable<ReportePorVendedorDTO[]> {
    return this.http.get<ReportePorVendedorDTO[]>(`${this.apiUrl}/reportes/por-vendedor?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`);
  }

  // Si necesitas obtener detalles de una venta específica por su ID
  obtenerDetallesVenta(ventaId: number): Observable<VentaDetalleResponseDTO[]> {
    return this.http.get<VentaDetalleResponseDTO[]>(`${this.apiUrl}/${ventaId}/detalles`);
  }
}
