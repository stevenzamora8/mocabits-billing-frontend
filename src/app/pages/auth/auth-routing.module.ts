import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login-form/login-form.component').then(m => m.LoginFormComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password-form/forgot-password-form.component').then(m => m.ForgotPasswordFormComponent)
      },
      {
        path: 'create-user',
        loadComponent: () => import('./create-user-form/create-user-form.component').then(m => m.CreateUserFormComponent)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }