import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ClientService, Client } from '../../../../services/client.service';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { SelectComponent } from '../../../../shared/components/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-create-client',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputComponent, SelectComponent, ButtonComponent],
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.css']
})
export class CreateClientComponent implements OnInit {
  clientForm: FormGroup;
  isSaving = false;
  isEdit = false;
  pageTitle = 'Crear Cliente';
  private editingId: number | null = null;
  // Options for selects
  idTypeOptions = [
    { value: 'RUC', label: 'RUC' },
    { value: 'CEDULA', label: 'Cédula' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ];

  statusOptions = [
    { value: 'A', label: 'Activo' },
    { value: 'I', label: 'Inactivo' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService
  ) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      idType: ['RUC', [Validators.required]],
      identification: ['', [Validators.required], [this.identificationExistsValidator()]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      status: ['A', [Validators.required]]
    });
  }

  private identificationExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const val = control.value;
      if (!val || val.toString().trim() === '') {
        return of(null);
      }

      // Call existing getClients endpoint with identification filter; if any result exists, validation fails
      return this.clientService.getClients(0, 1, { identification: val.toString().trim() }).pipe(
        map(page => {
          if (page && page.totalElements > 0) {
            const found = page.content && page.content.length ? page.content[0] : null;
            // If we're editing and the found client is the same as the one being edited, it's valid
            if (this.isEdit && this.editingId && found && found.id === this.editingId) {
              return null;
            }
            return { identificationExists: true };
          }
          return null;
        }),
        catchError(err => {
          console.error('Error validating identification uniqueness', err);
          // On error, don't block form submission by this validator
          return of(null);
        })
      );
    };
  }

  ngOnInit(): void {
    // Detect route param 'id' to switch between create and edit
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = Number(idParam);
        if (!isNaN(id)) {
          this.enterEditMode(id);
        }
      } else {
        // Ensure create mode: enable controls and reset form
        this.isEdit = false;
        this.editingId = null;
        this.pageTitle = 'Crear Cliente';
        // Enable identification and idType in case they were disabled previously
        this.clientForm.get('identification')?.enable({ emitEvent: false });
        this.clientForm.get('idType')?.enable({ emitEvent: false });
        this.clientForm.reset({
          name: '',
          idType: 'RUC',
          identification: '',
          email: '',
          phone: '',
          status: 'A'
        });
      }
    });
  }

  private enterEditMode(id: number) {
    this.isEdit = true;
    this.editingId = id;
    this.pageTitle = 'Editar Cliente';
    this.isSaving = true; // show loading while fetching

    this.clientService.getClient(id).subscribe({
      next: (client: Client) => {
        // Map API fields into form fields
        this.clientForm.patchValue({
          name: client.name || '',
          idType: (client.typeIdentification || '').toUpperCase() || 'RUC',
          identification: client.identification || '',
          email: client.email || '',
          phone: client.phone || '',
          status: client.status || 'A'
        });
        // When editing, identification and id type should not be editable
        this.clientForm.get('identification')?.disable({ emitEvent: false });
        this.clientForm.get('idType')?.disable({ emitEvent: false });
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error cargando cliente:', err);
        this.isSaving = false;
        // If loading fails, navigate back to list
        this.router.navigate(['/dashboard','clients']);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.isSaving = true;
      // Read values directly from controls so disabled controls still provide values
      const nameVal = this.clientForm.get('name')?.value;
      const identificationVal = this.clientForm.get('identification')?.value;
      const idTypeVal = this.clientForm.get('idType')?.value;
      const emailVal = this.clientForm.get('email')?.value;
      const phoneVal = this.clientForm.get('phone')?.value;
      const statusVal = this.clientForm.get('status')?.value;

      // Map form to API shape
      const payload: Client = {
        name: nameVal,
        identification: identificationVal,
        typeIdentification: (idTypeVal || '').toString().toUpperCase(),
        email: emailVal,
        phone: phoneVal,
        status: statusVal // already 'A' or 'I'
      };

      if (this.isEdit && this.editingId) {
        this.clientService.updateClient(this.editingId, payload).subscribe({
          next: (updated) => {
            this.isSaving = false;
            // Navigate back to list after update
            this.router.navigate(['/dashboard','clients']);
          },
          error: (err) => {
            console.error('Error actualizando cliente:', err);
            this.isSaving = false;
            alert('Error al actualizar cliente');
          }
        });
      } else {
        this.clientService.createClient(payload).subscribe({
          next: (created) => {
            this.isSaving = false;
            this.router.navigate(['/dashboard','clients']);
          },
          error: (err) => {
            console.error('Error creando cliente:', err);
            this.isSaving = false;
            alert('Error al crear cliente');
          }
        });
      }
    } else {
      this.markTouched();
    }
  }

  private markTouched() {
    Object.keys(this.clientForm.controls).forEach(k => this.clientForm.controls[k].markAsTouched());
  }
}
