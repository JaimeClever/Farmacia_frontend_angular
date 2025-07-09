// src/app/services/cliente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente'; // Asegúrate de que esta importación sea correcta

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:8080/api/clientes'; // Ajusta esta URL a la de tu API si es diferente

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  buscarPorDni(dni: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/dni/${dni}`);
  }

  // --- SOLUCIÓN: Métodos renombrados para coincidir con el componente ---
  crear(cliente: Cliente): Observable<Cliente> { // Renombrado de crearCliente a crear
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  actualizar(id: number, cliente: Cliente): Observable<Cliente> { // Renombrado de actualizarCliente a actualizar
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  eliminar(id: number): Observable<void> { // Renombrado de eliminarCliente a eliminar
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
