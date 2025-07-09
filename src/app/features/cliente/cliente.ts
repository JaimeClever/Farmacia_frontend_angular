// src/app/features/cliente/clientes.component.ts
// (Asegúrate de que este archivo se llame clientes.component.ts)

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './cliente.html', // <-- Asegúrate de que este archivo exista
  styleUrls: ['./cliente.scss']
})
export class ClientesComponent implements OnInit {

  clientes: Cliente[] = [];
  clienteForm: FormGroup;
  editandoCliente: Cliente | null = null;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService
  ) {
    this.clienteForm = this.fb.group({
      id: [null],
      nombres: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]]
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clienteService.listarTodos().subscribe({
      next: (data: Cliente[]) => {
        this.clientes = data;
        console.log('Clientes cargados:', this.clientes);
      },
      error: (err: any) => console.error('Error al cargar clientes:', err)
    });
  }

  guardarCliente(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      console.warn('Formulario inválido');
      return;
    }

    const clienteData: Cliente = this.clienteForm.value;

    if (this.editandoCliente) {
      this.clienteService.actualizar(this.editandoCliente.id!, clienteData).subscribe({
        next: (clienteActualizado: Cliente) => {
          console.log('Cliente actualizado:', clienteActualizado);
          this.cargarClientes();
          this.limpiarFormulario();
        },
        error: (err: any) => console.error('Error al actualizar cliente:', err)
      });
    } else {
      this.clienteService.crear(clienteData).subscribe({
        next: (nuevoCliente: Cliente) => {
          console.log('Nuevo cliente creado:', nuevoCliente);
          this.cargarClientes();
          this.limpiarFormulario();
        },
        error: (err: any) => console.error('Error al crear cliente:', err)
      });
    }
  }

  editarCliente(cliente: Cliente): void {
    this.editandoCliente = cliente;
    this.clienteForm.patchValue(cliente);
  }

  eliminarCliente(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      this.clienteService.eliminar(id).subscribe({
        next: () => {
          console.log('Cliente eliminado:', id);
          this.cargarClientes();
          if (this.editandoCliente?.id === id) {
            this.limpiarFormulario();
          }
        },
        error: (err: any) => console.error('Error al eliminar cliente:', err)
      });
    }
  }

  limpiarFormulario(): void {
    this.clienteForm.reset();
    this.editandoCliente = null;
    Object.keys(this.clienteForm.controls).forEach(key => {
      this.clienteForm.get(key)?.setErrors(null);
    });
  }
}
