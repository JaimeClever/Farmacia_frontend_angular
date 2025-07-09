import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioDTO } from '../../../models/usuario-dto.model';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,

  ],
  templateUrl: './registrar-admin.html',
  styleUrls: ['./registrar-admin.scss']
})
export class RegistrarAdminComponent {
  dto: UsuarioDTO = {
    username: '',
    password: '',
    nombres: ''
  };

  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

 registrar() {
   this.authService.registrarAdmin(this.dto).subscribe({
     next: () => {
       Swal.fire({
         icon: 'success',
         title: '¡Registro exitoso!',
         text: 'Administrador registrado correctamente',
         confirmButtonColor: '#3085d6'
       }).then(() => {
         this.router.navigate(['/login']);
       });
     },
     error: (err) => {
       console.error('Error al registrar:', err);

       if (typeof err.error === 'string') {
         this.error = err.error;
       } else if (err.error?.message) {
         this.error = err.error.message;
       } else if (err.message) {
         this.error = err.message;
       } else {
         this.error = 'Error desconocido al registrar administrador';
       }

       Swal.fire({
         icon: 'error',
         title: 'Error',
         text: this.error,
         confirmButtonColor: '#d33'
       });
     }
   });
 }

}
