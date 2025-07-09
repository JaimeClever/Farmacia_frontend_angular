// src/app/features/categoria/categorias.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './categoria.html', // Corrected: .component.html
  styleUrls: ['./categoria.scss'] // Corrected: .component.scss
})
export class CategoriasComponent implements OnInit {

  categorias: Categoria[] = [];
  categoriaForm: FormGroup;
  editandoCategoria: Categoria | null = null;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService
  ) {
    this.categoriaForm = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      descripcion: [''] // No validator needed if optional
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.listarTodas().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (err: any) => console.error('Error al cargar categorías:', err)
    });
  }

  guardarCategoria(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      console.warn('Formulario de categoría inválido.');
      return;
    }

    const categoriaData: Categoria = this.categoriaForm.value;

    if (this.editandoCategoria) {
      this.categoriaService.actualizarCategoria(this.editandoCategoria.id!, categoriaData).subscribe({
        next: (categoriaActualizada: Categoria) => {
          console.log('Categoría actualizada con éxito:', categoriaActualizada);
          this.cargarCategorias();
          this.limpiarFormulario();
        },
        error: (err: any) => {
          console.error('Error al actualizar categoría:', err);
          alert('Error al actualizar la categoría. Verifique los datos e intente de nuevo.');
        }
      });
    } else {
      this.categoriaService.crearCategoria(categoriaData).subscribe({
        next: (nuevaCategoria: Categoria) => {
          console.log('Nueva categoría creada con éxito:', nuevaCategoria);
          this.cargarCategorias();
          this.limpiarFormulario();
        },
        error: (err: any) => {
          console.error('Error al crear categoría:', err);
          alert('Error al crear la categoría. Verifique los datos e intente de nuevo.');
        }
      });
    }
  }

  editarCategoria(categoria: Categoria): void {
    this.editandoCategoria = categoria;
    this.categoriaForm.patchValue(categoria);
  }

  eliminarCategoria(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      this.categoriaService.eliminarCategoria(id).subscribe({
        next: () => {
          console.log('Categoría eliminada:', id);
          this.cargarCategorias();
          if (this.editandoCategoria?.id === id) {
            this.limpiarFormulario();
          }
        },
        error: (err: any) => {
          console.error('Error al eliminar categoría:', err);
          alert('Error al eliminar la categoría. Intente de nuevo.');
        }
      });
    }
  }

  limpiarFormulario(): void {
    this.categoriaForm.reset();
    this.editandoCategoria = null;
    Object.keys(this.categoriaForm.controls).forEach(key => {
      this.categoriaForm.get(key)?.setErrors(null);
    });
  }
}
