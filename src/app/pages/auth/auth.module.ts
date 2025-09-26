import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';

// Importar componentes standalone
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ForgotPasswordFormComponent } from './forgot-password-form/forgot-password-form.component';
import { CreateUserFormComponent } from './create-user-form/create-user-form.component';

// Importar componentes compartidos
import { AlertComponent } from '../../components/alert/alert.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    AuthRoutingModule,
    AlertComponent,
    AuthLayoutComponent,
    LoginFormComponent,
    ForgotPasswordFormComponent,
    CreateUserFormComponent
  ]
})
export class AuthModule { }