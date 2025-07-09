// src/app/features/ventas/ventas.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule, NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { Cliente } from '../../models/cliente';
import { Producto } from '../../models/producto';
import { VentaDTO, VentaItemDTO } from '../../models/ventas/venta-dto'; // Importación correcta
import { VentaResponseDTO } from '../../models/ventas/venta-response-dto';
import { ReportePorDiaDTO, ReportePorProductoDTO, ReportePorVendedorDTO } from '../../models/ventas/reporte-dtos';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgFor, NgIf, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './ventas.html', // Asegúrate de que sea .component.html
  styleUrls: ['./ventas.scss']
})
export class VentasComponent implements OnInit {

  ventaForm: FormGroup;
  clientes: Cliente[] = [];
  productos: Producto[] = []; // Todos los productos cargados
  filteredProductos: Producto[] = []; // Productos mostrados en la lista/grid
  ventasExistentes: VentaResponseDTO[] = [];

  reportePorDia: ReportePorDiaDTO[] = [];
  reportePorProducto: ReportePorProductoDTO[] = [];
  reportePorVendedor: ReportePorVendedorDTO[] = [];
  reporteFechaDesde: string = '';
  reporteFechaHasta: string = '';

  mensajeEstado: string = '';
  isError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private ventaService: VentaService,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    public sanitizer: DomSanitizer
  ) {
    this.ventaForm = this.fb.group({
      clienteId: [null],
      usarDni: [false],
      dniCliente: [''],
      nombresCliente: [''],
      productoBusqueda: [''],
      items: this.fb.array([])
    });

    this.ventaForm.get('usarDni')?.valueChanges.subscribe(usarDni => {
      const dniControl = this.ventaForm.get('dniCliente');
      const clienteIdControl = this.ventaForm.get('clienteId');
      const nombresClienteControl = this.ventaForm.get('nombresCliente');

      dniControl?.clearValidators();
      clienteIdControl?.clearValidators();
      nombresClienteControl?.clearValidators();

      if (usarDni) {
        dniControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
      } else {
        clienteIdControl?.setValidators(Validators.required);
      }
      dniControl?.updateValueAndValidity();
      clienteIdControl?.updateValueAndValidity();
      nombresClienteControl?.updateValueAndValidity();
    });

    this.ventaForm.get('dniCliente')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((dni: string) => {
        if (dni && dni.length === 8) {
          this.mensajeEstado = 'Buscando cliente...';
          this.isError = false;
          return this.clienteService.buscarPorDni(dni).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 404) {
                this.mensajeEstado = 'Cliente no encontrado. Se creará/registrará la venta con este DNI y nombre (si se proporciona).';
                this.isError = false;
              } else {
                this.mensajeEstado = 'Error al buscar cliente: ' + (err.error?.message || err.message);
                this.isError = true;
                console.error('Error al buscar cliente por DNI:', err);
              }
              this.ventaForm.get('nombresCliente')?.setValue('');
              return of(null);
            })
          );
        }
        this.mensajeEstado = '';
        this.isError = false;
        this.ventaForm.get('nombresCliente')?.setValue('');
        return of(null);
      })
    ).subscribe(cliente => {
      if (cliente) {
        // FIX: Usar cliente.nombres aquí
        this.ventaForm.get('nombresCliente')?.setValue(cliente.nombres);
        this.ventaForm.get('clienteId')?.setValue(cliente.id);
        this.mensajeEstado = `Cliente encontrado: ${cliente.nombres}.`;
        this.isError = false;
      } else {
        this.ventaForm.get('clienteId')?.setValue(null);
      }
    });

    this.ventaForm.get('productoBusqueda')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterProductos(searchTerm);
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarProductos();
    this.cargarVentas();
  }

  get items(): FormArray {
    return this.ventaForm.get('items') as FormArray;
  }

  addItem(productToAdd: Producto, initialQuantity: number = 1): void {
    const existingItem = this.items.controls.find(control => control.get('productoId')?.value === productToAdd.id);

    if (existingItem) {
        const currentQuantity = existingItem.get('cantidad')?.value;
        const newQuantity = currentQuantity + initialQuantity;

        if (productToAdd.stock < newQuantity) {
            this.mensajeEstado = `Stock insuficiente para ${productToAdd.nombre}. Disponible: ${productToAdd.stock}. En carrito: ${currentQuantity}.`;
            this.isError = true;
            return;
        }
        existingItem.get('cantidad')?.setValue(newQuantity);
        this.mensajeEstado = `Cantidad de ${productToAdd.nombre} actualizada a ${newQuantity}.`;
        this.isError = false;
    } else {
        if (productToAdd.stock < initialQuantity) {
            this.mensajeEstado = `Stock insuficiente para ${productToAdd.nombre}. Disponible: ${productToAdd.stock}.`;
            this.isError = true;
            return;
        }

        const itemFormGroup = this.fb.group({
            productoId: [productToAdd.id, Validators.required],
            cantidad: [initialQuantity, [Validators.required, Validators.min(1)]]
        });
        this.items.push(itemFormGroup);
        this.mensajeEstado = `"${productToAdd.nombre}" añadido al carrito.`;
        this.isError = false;
    }
    this.productos = this.productos.map(p =>
      p.id === productToAdd.id ? { ...p, stock: p.stock - initialQuantity } : p
    );
    this.filterProductos(this.ventaForm.get('productoBusqueda')?.value || '');
  }


  removeItem(index: number): void {
    const itemControl = this.items.at(index) as FormGroup;
    const productoId = itemControl.get('productoId')?.value;
    const cantidad = itemControl.get('cantidad')?.value;

    this.items.removeAt(index);

    this.productos = this.productos.map(p =>
      p.id === productoId ? { ...p, stock: p.stock + cantidad } : p
    );
    this.filterProductos(this.ventaForm.get('productoBusqueda')?.value || '');
    this.mensajeEstado = `Producto eliminado del carrito.`;
    this.isError = false;
  }

  cargarClientes(): void {
    this.clienteService.listarTodos().subscribe({
      next: (data: Cliente[]) => this.clientes = data,
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar clientes:', err);
        this.mensajeEstado = 'Error al cargar clientes: ' + (err.error?.message || err.message);
        this.isError = true;
      }
    });
  }

  cargarProductos(): void {
    this.productoService.listarTodos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
        this.filterProductos('');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar productos:', err);
        this.mensajeEstado = 'Error al cargar productos: ' + (err.error?.message || err.message);
        this.isError = true;
      }
    });
  }

  filterProductos(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredProductos = [...this.productos];
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      this.filteredProductos = this.productos.filter(prod =>
        prod.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
        (prod.codigoBarra && prod.codigoBarra.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
  }


  cargarVentas(): void {
    this.ventaService.listarVentas().subscribe({
      next: (data: VentaResponseDTO[]) => this.ventasExistentes = data,
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar ventas:', err);
        this.mensajeEstado = 'Error al cargar ventas: ' + (err.error?.message || err.message);
        this.isError = true;
      }
    });
  }

  crearVenta(): void {
    this.mensajeEstado = '';
    this.isError = false;

    if (this.ventaForm.invalid) {
      this.ventaForm.markAllAsTouched();
      this.items.controls.forEach(control => {
        (control as FormGroup).controls['productoId'].markAsTouched();
        (control as FormGroup).controls['cantidad'].markAsTouched();
      });
      this.mensajeEstado = 'Por favor, complete todos los campos obligatorios y válidos.';
      this.isError = true;
      console.warn('Formulario de venta inválido');
      return;
    }

    if (this.items.length === 0) {
      this.mensajeEstado = 'Debe agregar al menos un producto a la venta.';
      this.isError = true;
      return;
    }

    const rawFormValue = this.ventaForm.value;
    const ventaDto: VentaDTO = {
      clienteId: rawFormValue.clienteId,
      usarDni: rawFormValue.usarDni,
      dniCliente: rawFormValue.dniCliente,
      nombresCliente: rawFormValue.nombresCliente,
      items: rawFormValue.items.map((item: { productoId: number, cantidad: number }) => ({
        productoId: item.productoId,
        cantidad: item.cantidad
      }))
    };

    if (!ventaDto.usarDni) {
        if (ventaDto.clienteId === null) {
            this.mensajeEstado = 'Por favor, seleccione un cliente existente.';
            this.isError = true;
            return;
        }
        ventaDto.dniCliente = null;
        ventaDto.nombresCliente = null;
    } else {
        if (!ventaDto.dniCliente || ventaDto.dniCliente.trim() === '') {
            this.mensajeEstado = 'El DNI del cliente es obligatorio si elige usar DNI.';
            this.isError = true;
            return;
        }
        if (this.ventaForm.get('clienteId')?.value === null && (!ventaDto.nombresCliente || ventaDto.nombresCliente.trim() === '')) {
            this.mensajeEstado = 'Cliente no encontrado por DNI. Por favor, ingrese un nombre para cliente anónimo o nuevo.';
            this.isError = true;
            return;
        }
        ventaDto.clienteId = null;
    }


    this.ventaService.crearVenta(ventaDto).subscribe({
      next: (response: VentaResponseDTO) => {
        this.mensajeEstado = `Venta ${response.id} creada con éxito. Total: S/. ${response.total.toFixed(2)}.`;
        this.isError = false;
        console.log('Venta creada con éxito:', response);
        this.limpiarFormulario();
        this.cargarVentas();
        this.cargarProductos();
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeEstado = 'Error al crear la venta: ' + (err.error?.message || err.message);
        this.isError = true;
        console.error('Error al crear venta:', err);
        if (err.status === 400 && err.error?.message?.includes('stock')) {
            this.mensajeEstado = 'Error: No hay suficiente stock para uno o más productos. Por favor, revise las cantidades.';
        }
      }
    });
  }

  limpiarFormulario(): void {
    this.ventaForm.reset({
      clienteId: null,
      usarDni: false,
      dniCliente: '',
      nombresCliente: '',
      productoBusqueda: ''
    });
    while (this.items.length !== 0) {
      this.items.removeAt(0);
    }
    this.mensajeEstado = '';
    this.isError = false;
    this.cargarProductos();
  }

  getItemPrecio(itemControl: AbstractControl): number {
    const itemFormGroup = itemControl as FormGroup;
    const productoId = itemFormGroup.get('productoId')?.value;
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? producto.precio : 0.00;
  }

  getProductoNombreEnCarrito(itemControl: AbstractControl): string {
    const itemFormGroup = itemControl as FormGroup;
    const productoId = itemFormGroup.get('productoId')?.value;
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? producto.nombre : 'Producto desconocido';
  }

  getTotalVenta(): number {
    let total = 0;
    this.items.controls.forEach(itemControl => {
      const itemFormGroup = itemControl as FormGroup;
      const productoId = itemFormGroup.get('productoId')?.value;
      const cantidad = itemFormGroup.get('cantidad')?.value;

      if (productoId && cantidad) {
        const producto = this.productos.find(p => p.id === productoId);
        if (producto) {
          total += producto.precio * cantidad;
        }
      }
    });
    return total;
  }

  generarReportes(): void {
    this.mensajeEstado = '';
    this.isError = false;
    if (!this.reporteFechaDesde || !this.reporteFechaHasta) {
      this.mensajeEstado = 'Por favor, seleccione un rango de fechas para los reportes.';
      this.isError = true;
      return;
    }

    this.ventaService.obtenerReportePorDia(this.reporteFechaDesde, this.reporteFechaHasta).subscribe({
      next: (data: ReportePorDiaDTO[]) => this.reportePorDia = data,
      error: (err: HttpErrorResponse) => {
        console.error('Error al generar reporte por día:', err);
        this.mensajeEstado = 'Error al generar reporte por día: ' + (err.error?.message || err.message);
        this.isError = true;
      }
    });

    this.ventaService.obtenerReportePorProducto(this.reporteFechaDesde, this.reporteFechaHasta).subscribe({
      next: (data: ReportePorProductoDTO[]) => this.reportePorProducto = data,
      error: (err: HttpErrorResponse) => {
        console.error('Error al generar reporte por producto:', err);
        this.mensajeEstado = 'Error al generar reporte por producto: ' + (err.error?.message || err.message);
        this.isError = true;
      }
    });

    this.ventaService.obtenerReportePorVendedor(this.reporteFechaDesde, this.reporteFechaHasta).subscribe({
      next: (data: ReportePorVendedorDTO[]) => this.reportePorVendedor = data,
      error: (err: HttpErrorResponse) => {
        console.error('Error al generar reporte por vendedor:', err);
        this.mensajeEstado = 'Error al generar reporte por vendedor: ' + (err.error?.message || err.message);
        this.isError = true;
      }
    });
  }

  getProductName(productId: number): string {
    const product = this.productos.find(p => p.id === productId);
    return product ? product.nombre : 'Producto desconocido';
  }
}
