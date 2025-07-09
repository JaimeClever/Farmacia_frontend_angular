// src/app/features/devoluciones/devoluciones.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
// CORRECCIÓN 1: Asegúrate de que la ruta al servicio sea correcta
import { DevolucionService } from '../../services/devolucion.service';
import { DevolucionDTO } from '../../models/devolucion';

// Importa HttpErrorResponse para tipar el error correctamente
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-devoluciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf],
  templateUrl: './devoluciones.html', // Doble verificación de .component.html
  styleUrls: ['./devoluciones.scss'] // Doble verificación de .component.scss
})
export class DevolucionesComponent implements OnInit {

  devolucionForm: FormGroup;
  mensajeEstado: string = '';
  isError: boolean = false;

  constructor(
    private fb: FormBuilder,
    // CORRECCIÓN 2: No necesitas `@Inject` si el servicio está correctamente anotado con `@Injectable()`
    private devolucionService: DevolucionService
  ) {
    this.devolucionForm = this.fb.group({
      detalleVentaId: [null, [Validators.required, Validators.min(1)]],
      cantidadDevuelta: [null, [Validators.required, Validators.min(1)]],
      motivo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Aquí podrías cargar datos iniciales si fuera necesario, como una lista de detalles de venta
  }

  registrarDevolucion(): void {
    this.mensajeEstado = ''; // Limpiar mensajes anteriores
    this.isError = false;

    if (this.devolucionForm.invalid) {
      this.devolucionForm.markAllAsTouched();
      this.mensajeEstado = 'Por favor, complete todos los campos obligatorios.';
      this.isError = true;
      console.warn('Formulario de devolución inválido.');
      return;
    }

    const devolucionData: DevolucionDTO = this.devolucionForm.value;

    this.devolucionService.registrarDevolucion(devolucionData).subscribe({
      // CORRECCIÓN 3: Tipado explícito de 'response' y 'error'
      next: (response: any) => { // 'any' porque no tenemos el modelo Devolucion de backend aún, o puedes crear uno
        this.mensajeEstado = 'Devolución registrada con éxito. ID: ' + response.id;
        this.isError = false;
        console.log('Devolución registrada:', response);
        this.limpiarFormulario();
      },
      error: (error: HttpErrorResponse) => { // Tipado explícito para 'error'
        this.mensajeEstado = 'Error al registrar la devolución: ' + (error.error?.message || error.message);
        this.isError = true;
        console.error('Error en el registro de devolución:', error);
      }
    });
  }

  limpiarFormulario(): void {
    this.devolucionForm.reset({
      detalleVentaId: null,
      cantidadDevuelta: null,
      motivo: ''
    });
    Object.keys(this.devolucionForm.controls).forEach(key => {
      this.devolucionForm.get(key)?.setErrors(null);
    });
  }
}
