// src/app/services/producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto'; // Importamos Producto
import { Categoria } from '../models/categoria'; // Importamos Categoria

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/api/productos'; // URL base para productos
  private categoriaApiUrl = 'http://localhost:8080/api/categorias'; // URL base para categorías

  constructor(private http: HttpClient) { }

  // Operaciones CRUD para Productos
  listarTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crearProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizarProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Método para obtener categorías (usado en el formulario de productos)
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.categoriaApiUrl);
  }
}
