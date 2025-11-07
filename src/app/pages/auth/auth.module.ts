import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthRoutingModule } from './auth-routing.module';

// Importar componentes standalone
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ForgotPasswordFormComponent } from './forgot-password-form/forgot-password-form.component';
import { CreateUserFormComponent } from './create-user-form/create-user-form.component';

// Importar componentes compartidos
import { UiAlertComponent } from '../../shared/components/ui/alert/alert.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AuthRoutingModule,
    UiAlertComponent,
    AuthLayoutComponent,
    LoginFormComponent,
    ForgotPasswordFormComponent,
    CreateUserFormComponent
  ]
})
export class AuthModule { }