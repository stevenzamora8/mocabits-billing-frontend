import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <div class="page-header">
        <h1>Configuración</h1>
        <p>Personaliza tu experiencia y preferencias del sistema</p>
      </div>
      
      <div class="content-placeholder">
        <div class="placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h2>Próximamente</h2>
        <p>El módulo de configuración estará disponible pronto</p>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 3rem;
      text-align: center;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-header p {
      margin: 0;
      color: #64748b;
      font-size: 1.1rem;
    }

    .content-placeholder {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .placeholder-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 2rem auto;
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
    }

    .content-placeholder h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }

    .content-placeholder p {
      margin: 0;
      color: #64748b;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .settings-container {
        padding: 1rem;
      }
      
      .page-header h1 {
        font-size: 2rem;
      }
      
      .content-placeholder {
        padding: 2rem 1rem;
      }
    }
  `]
})
export class SettingsComponent {
  constructor() { }
}
