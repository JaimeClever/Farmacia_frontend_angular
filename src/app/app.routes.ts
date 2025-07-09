import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'registrar-admin',
    loadComponent: () =>
      import('./features/auth/registrar-admin/registrar-admin').then(m => m.RegistrarAdminComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/productos').then(m => m.ProductosComponent)
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categoria').then(m => m.CategoriasComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuario/configuracion').then(m => m.ConfiguracionComponent)
      },
      {
            path: 'clientes',
            loadComponent: () =>
              import('./features/cliente/cliente').then(m => m.ClientesComponent)
          },
          {
            path: 'ventas',
               loadComponent: () =>
               import('./features/ventas/ventas').then(m => m.VentasComponent)
          },


        {
                    path: 'devoluciones',
                       loadComponent: () =>
                       import('./features/devoluciones/devoluciones').then(m => m.DevolucionesComponent)
                  },


      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
