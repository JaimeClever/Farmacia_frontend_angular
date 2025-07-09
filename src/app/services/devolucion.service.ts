// src/app/services/devolucion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DevolucionDTO } from '../models/devolucion'; // Ruta correcta a tu DTO
// CORRECCIÓN 4: Eliminar la importación a 'devolucion-entity' si no existe el archivo.
// Si deseas tipar la respuesta, DEBES crear este archivo:
// import { Devolucion } from '../models/devolucion-entity'; // Descomenta y crea si es necesario.

@Injectable({
  providedIn: 'root'
})
export class DevolucionService {
  private apiUrl = 'http://localhost:8080/api/devoluciones'; // ¡Asegúrate que esta URL coincida con tu backend!

  constructor(private http: HttpClient) { }

  /**
   * Registra una nueva devolución en el sistema.
   * @param devolucionData Los datos de la devolución a registrar.
   * @returns Un Observable con la Devolucion registrada o la respuesta del backend.
   */
  // Si no tienes devolucion-entity.ts, el tipo de retorno debe ser 'any' o un tipo más específico que sí tengas.
  registrarDevolucion(devolucionData: DevolucionDTO): Observable<any> {
    return this.http.post<any>(this.apiUrl, devolucionData);
  }

  // Si necesitas listar devoluciones, podrías añadir un método GET aquí
  // listarDevoluciones(): Observable<Devolucion[]> {
  //   return this.http.get<Devolucion[]>(this.apiUrl);
  // }
}
