// src/app/features/productos/productos.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // Importamos DomSanitizer

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './productos.html',
  styleUrls: ['./productos.scss']
})
export class ProductosComponent implements OnInit {

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  productoForm: FormGroup;
  editandoProducto: Producto | null = null;
  mensajeEstado: string = '';
  isError: boolean = false;
  imagenPrevisualizacion: SafeUrl | string = ''; // Para mostrar la imagen seleccionada/existente

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    public sanitizer: DomSanitizer // ¡CORRECCIÓN AQUÍ! Cambiar a 'public' para acceso en el HTML
  ) {
    this.productoForm = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      descripcion: [''],
      codigoBarra: [''],
      fechaVencimiento: [null], // Se inicializa con null
      lote: [''],
      fabricante: [''],
      presentacion: [''],
      requiereReceta: [false],
      categoriaId: [null],
      imagenBase64: [null] // Control para la cadena Base64
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos(): void {
    this.productoService.listarTodos().subscribe({
      next: (data: Producto[]) => this.productos = data,
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar productos:', err);
        this.mensajeEstado = 'Error al cargar productos: ' + (err.error?.message || err.message);
        this.isError = true;
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.listarTodas().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
        console.log('Categorías cargadas para productos:', this.categorias);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar categorías:', err);
        this.mensajeEstado = 'Error al cargar categorías: ' + (err.error?.message || err.message);
        this.isError = true;
      }
    });
  }

  onFileSelected(event: Event): void {
    this.mensajeEstado = '';
    this.isError = false;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      // Validar tipo de archivo
      if (!file.type.match('image.*')) {
        this.mensajeEstado = 'Por favor, seleccione un archivo de imagen válido (JPG, PNG, GIF, etc.).';
        this.isError = true;
        this.productoForm.get('imagenBase64')?.setValue(null);
        this.imagenPrevisualizacion = '';
        return;
      }

      reader.onload = () => {
        const base64String = reader.result as string;
        this.productoForm.get('imagenBase64')?.setValue(base64String);
        this.imagenPrevisualizacion = this.sanitizer.bypassSecurityTrustUrl(base64String);
      };

      reader.onerror = (error) => {
        console.error('Error al leer el archivo:', error);
        this.mensajeEstado = 'Error al leer el archivo de imagen.';
        this.isError = true;
        this.productoForm.get('imagenBase64')?.setValue(null);
        this.imagenPrevisualizacion = '';
      };

      reader.readAsDataURL(file); // Lee el archivo como Base64
    } else {
      this.productoForm.get('imagenBase64')?.setValue(null);
      this.imagenPrevisualizacion = '';
    }
  }

  guardarProducto(): void {
    this.mensajeEstado = '';
    this.isError = false;

    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.mensajeEstado = 'Por favor, complete todos los campos obligatorios y válidos.';
      this.isError = true;
      console.warn('Formulario inválido. Revise los campos del producto.');
      return;
    }

    const productoData: Producto = { ...this.productoForm.value };

    // ¡CORRECCIÓN AQUÍ! Eliminamos el `|| productoData.categoriaId === ''`
    if (productoData.categoriaId === null || productoData.categoriaId === undefined) {
      productoData.categoriaId = null;
    }

    // Si fechaVencimiento es una cadena vacía, conviértela a null
    if (productoData.fechaVencimiento === '') {
      productoData.fechaVencimiento = null;
    }


    if (this.editandoProducto) {
      if (!this.editandoProducto.id) {
        this.mensajeEstado = 'Error: ID del producto para actualizar no encontrado.';
        this.isError = true;
        return;
      }
      this.productoService.actualizarProducto(this.editandoProducto.id, productoData).subscribe({
        next: (productoActualizado: Producto) => {
          this.mensajeEstado = 'Producto actualizado con éxito.';
          this.isError = false;
          console.log('Producto actualizado con éxito:', productoActualizado);
          this.cargarProductos();
          this.limpiarFormulario();
        },
        error: (err: HttpErrorResponse) => {
          this.mensajeEstado = 'Error al actualizar producto: ' + (err.error?.message || err.message);
          this.isError = true;
          console.error('Error al actualizar producto:', err);
        }
      });
    } else {
      this.productoService.crearProducto(productoData).subscribe({
        next: (nuevoProducto: Producto) => {
          this.mensajeEstado = 'Nuevo producto creado con éxito.';
          this.isError = false;
          console.log('Nuevo producto creado con éxito:', nuevoProducto);
          this.cargarProductos();
          this.limpiarFormulario();
        },
        error: (err: HttpErrorResponse) => {
          this.mensajeEstado = 'Error al crear producto: ' + (err.error?.message || err.message);
          this.isError = true;
          console.error('Error al crear producto:', err);
        }
      });
    }
  }

  editarProducto(producto: Producto): void {
    this.editandoProducto = producto;
    const formattedProducto = { ...producto };

    // Para la fecha, asegúrate de que sea una cadena vacía si es null o undefined para el input type="date"
    formattedProducto.fechaVencimiento = formattedProducto.fechaVencimiento || '';

    this.productoForm.patchValue(formattedProducto);

    // Previsualizar la imagen existente si hay una
    if (producto.imagenBase64) {
      this.imagenPrevisualizacion = this.sanitizer.bypassSecurityTrustUrl(producto.imagenBase64);
    } else {
      this.imagenPrevisualizacion = '';
    }
  }

  eliminarProducto(id: number): void {
    this.mensajeEstado = '';
    this.isError = false;

    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.mensajeEstado = 'Producto eliminado con éxito.';
          this.isError = false;
          console.log('Producto eliminado:', id);
          this.cargarProductos();
          if (this.editandoProducto?.id === id) {
            this.limpiarFormulario();
          }
        },
        error: (err: HttpErrorResponse) => {
          this.mensajeEstado = 'Error al eliminar producto: ' + (err.error?.message || err.message);
          this.isError = true;
          console.error('Error al eliminar producto:', err);
        }
      });
    }
  }

  limpiarFormulario(): void {
    this.productoForm.reset({
      requiereReceta: false,
      categoriaId: null,
      fechaVencimiento: null,
      imagenBase64: null // Limpiar el control de imagen
    });
    this.editandoProducto = null;
    this.imagenPrevisualizacion = ''; // Limpiar la previsualización de imagen
    Object.keys(this.productoForm.controls).forEach(key => {
      this.productoForm.get(key)?.setErrors(null);
    });
    this.mensajeEstado = '';
    this.isError = false;
  }

  getCategoryName(categoriaId: number | undefined | null): string {
    if (categoriaId === null || categoriaId === undefined) {
      return 'Sin Categoría';
    }
    const categoria = this.categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : 'Categoría Desconocida';
  }
}
