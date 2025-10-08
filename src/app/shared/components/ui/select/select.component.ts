import { Component, forwardRef, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

export type SelectSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="app-select-wrapper">
      <!-- Label -->
      <label 
        *ngIf="label" 
        [for]="id"
        class="app-select-label"
        [class.app-select-label--required]="required">
        {{ label }}
        <span *ngIf="required" class="app-select-required">*</span>
      </label>

      <!-- Select container -->
      <div 
        class="app-select-container"
        [class]="containerClasses"
        (click)="toggle()"
        #selectContainer>
        
        <!-- Selected value display -->
        <div class="app-select-value">
          <span *ngIf="selectedOption; else placeholder" class="app-select-selected">
            {{ selectedOption.label }}
          </span>
          <ng-template #placeholder>
            <span class="app-select-placeholder">{{ placeholder }}</span>
          </ng-template>
        </div>

        <!-- Arrow icon -->
        <div class="app-select-arrow" [class.app-select-arrow--open]="isOpen">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>

        <!-- Loading spinner -->
        <div *ngIf="loading" class="app-select-loading">
          <svg class="app-select-spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
            <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>

      <!-- Dropdown options -->
      <div 
        *ngIf="isOpen" 
        class="app-select-dropdown"
        [class.app-select-dropdown--up]="dropdownDirection === 'up'"
        #dropdown>
        
        <!-- Search input -->
        <div *ngIf="searchable" class="app-select-search">
          <input
            type="text"
            class="app-select-search-input"
            [placeholder]="searchPlaceholder"
            [(ngModel)]="searchTerm"
            (input)="onSearch($event)"
            (click)="$event.stopPropagation()"
            #searchInput>
        </div>

        <!-- Options list -->
        <div class="app-select-options" [class.app-select-options--with-search]="searchable">
          <!-- Empty state -->
          <div *ngIf="filteredOptions.length === 0" class="app-select-empty">
            {{ emptyMessage }}
          </div>

          <!-- Options -->
          <ng-container *ngFor="let option of filteredOptions; trackBy: trackByValue">
            <!-- Group header -->
            <div 
              *ngIf="option.group && !isGroupHeaderShown(option.group)" 
              class="app-select-group-header">
              {{ option.group }}
            </div>

            <!-- Option item -->
            <div
              class="app-select-option"
              [class.app-select-option--selected]="isSelected(option)"
              [class.app-select-option--disabled]="option.disabled"
              [class.app-select-option--highlighted]="highlightedIndex === getOptionIndex(option)"
              (click)="selectOption(option)"
              (mouseenter)="highlightedIndex = getOptionIndex(option)">
              
              <!-- Option label -->
              {{ option.label }}
              
              <!-- Check icon for selected option -->
              <svg 
                *ngIf="isSelected(option)" 
                class="app-select-check"
                viewBox="0 0 20 20" 
                fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- Helper text -->
      <p *ngIf="hint && !errorMessage" class="app-select-hint">{{ hint }}</p>
      
      <!-- Error message -->
      <p *ngIf="errorMessage" class="app-select-error">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {{ errorMessage }}
      </p>
    </div>
  `
})
export class SelectComponent implements ControlValueAccessor {
  @Input() id: string = `app-select-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label?: string;
  @Input() placeholder: string = 'Seleccionar opción';
  @Input() options: SelectOption[] = [];
  @Input() size: SelectSize = 'md';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() loading: boolean = false;
  @Input() searchable: boolean = false;
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() emptyMessage: string = 'No hay opciones disponibles';
  @Input() hint?: string;
  @Input() errorMessage?: string | null | undefined;
  @Input() clearable: boolean = false;
  @Input() multiple: boolean = false;
  @Input() maxHeight: string = '200px';

  @Output() selectionChange = new EventEmitter<SelectOption | SelectOption[] | null>();
  @Output() search = new EventEmitter<string>();
  @Output() open = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('dropdown') dropdown?: ElementRef;
  @ViewChild('searchInput') searchInput?: ElementRef;
  @ViewChild('selectContainer') selectContainer?: ElementRef;

  // Component state
  isOpen: boolean = false;
  searchTerm: string = '';
  highlightedIndex: number = -1;
  dropdownDirection: 'up' | 'down' = 'down';
  value: any = null;
  selectedOption: SelectOption | null = null;
  filteredOptions: SelectOption[] = [];
  shownGroups: Set<string> = new Set();

  // ControlValueAccessor
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private elementRef: ElementRef) {
    this.updateFilteredOptions();
  }

  ngOnInit() {
    this.updateFilteredOptions();
  }

  ngOnChanges() {
    this.updateFilteredOptions();
    this.updateSelectedOption();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
    this.updateSelectedOption();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Component methods
  toggle(): void {
    if (this.disabled || this.loading) return;
    
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    if (this.disabled || this.loading) return;
    
    this.isOpen = true;
    this.updateDropdownDirection();
    this.open.emit();

    // Focus search input if searchable
    setTimeout(() => {
      if (this.searchable && this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    });
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.searchTerm = '';
    this.highlightedIndex = -1;
    this.updateFilteredOptions();
    this.close.emit();
    this.onTouched();
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    if (this.multiple) {
      // Handle multiple selection
      const currentValues = Array.isArray(this.value) ? this.value : [];
      const isSelected = currentValues.includes(option.value);
      
      if (isSelected) {
        this.value = currentValues.filter(v => v !== option.value);
      } else {
        this.value = [...currentValues, option.value];
      }
    } else {
      // Handle single selection
      this.value = option.value;
      this.selectedOption = option;
      this.closeDropdown();
    }

    this.onChange(this.value);
    this.selectionChange.emit(this.multiple ? this.getSelectedOptions() : option);
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.updateFilteredOptions();
    this.search.emit(this.searchTerm);
    this.highlightedIndex = 0;
  }

  private updateFilteredOptions(): void {
    if (!this.searchTerm) {
      this.filteredOptions = [...this.options];
    } else {
      this.filteredOptions = this.options.filter(option =>
        option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    this.updateShownGroups();
  }

  private updateSelectedOption(): void {
    if (!this.multiple) {
      this.selectedOption = this.options.find(option => option.value === this.value) || null;
    }
  }

  private updateShownGroups(): void {
    this.shownGroups.clear();
  }

  private updateDropdownDirection(): void {
    if (!this.selectContainer) return;

    const rect = this.selectContainer.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    this.dropdownDirection = spaceBelow < 200 && spaceAbove > spaceBelow ? 'up' : 'down';
  }

  private getSelectedOptions(): SelectOption[] {
    if (!Array.isArray(this.value)) return [];
    return this.options.filter(option => this.value.includes(option.value));
  }

  // Template helper methods
  get containerClasses(): string {
    return [
      'app-select-container',
      `app-select-container--${this.size}`,
      this.isOpen ? 'app-select-container--open' : '',
      this.disabled ? 'app-select-container--disabled' : '',
      this.loading ? 'app-select-container--loading' : '',
      this.errorMessage ? 'app-select-container--error' : '',
    ].filter(Boolean).join(' ');
  }

  isSelected(option: SelectOption): boolean {
    if (this.multiple) {
      return Array.isArray(this.value) && this.value.includes(option.value);
    }
    return this.value === option.value;
  }

  isGroupHeaderShown(group: string): boolean {
    if (this.shownGroups.has(group)) {
      return true;
    }
    this.shownGroups.add(group);
    return false;
  }

  getOptionIndex(option: SelectOption): number {
    return this.filteredOptions.indexOf(option);
  }

  trackByValue(index: number, option: SelectOption): any {
    return option.value;
  }

  // Keyboard navigation
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else if (this.highlightedIndex >= 0) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        break;

      case 'Escape':
        if (this.isOpen) {
          event.preventDefault();
          this.closeDropdown();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else {
          this.highlightedIndex = Math.min(
            this.highlightedIndex + 1,
            this.filteredOptions.length - 1
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen) {
          this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
        }
        break;

      case 'Tab':
        if (this.isOpen) {
          this.closeDropdown();
        }
        break;
    }
  }

  // Click outside to close
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}