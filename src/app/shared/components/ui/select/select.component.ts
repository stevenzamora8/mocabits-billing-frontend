import { Component, forwardRef, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
  // optional numeric payload (e.g. tax rate percent)
  rate?: number;
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
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements ControlValueAccessor {
    @Input() id: string = `app-select-${Math.random().toString(36).substring(2, 9)}`;
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
  @Input() leftIcon: string = '';
  @Input() rightIcon: string = '';
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
  protected onChange = (value: any) => {};
  public onTouched = () => {};

  constructor(private elementRef: ElementRef) {
    this.updateFilteredOptions();
  }

  ngOnInit() {
    this.updateFilteredOptions();
    this.updateSelectedOption();
    if (this.value) {
      const found = this.options.find(opt => opt.value === this.value);
      this.selectedOption = found || null;
    }
  }

  ngOnChanges() {
    this.updateFilteredOptions();
    this.updateSelectedOption();
    if (this.value) {
      const found = this.options.find(opt => opt.value === this.value);
      this.selectedOption = found || null;
    }
    console.log('Select options:', this.options);
    console.log('Current value:', this.value);
    console.log('Selected option:', this.selectedOption);
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
    if (value) {
      const found = this.options.find(opt => opt.value === value);
      this.selectedOption = found || null;
      console.log('Write value:', value, 'Selected option:', this.selectedOption);
    } else {
      this.selectedOption = null;
    }
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
    
    console.log('Filtered options updated:', this.filteredOptions);
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
    if (!this.selectContainer || !this.dropdown) return;

    const selectRect = this.selectContainer.nativeElement.getBoundingClientRect();
    const dropdownEl = this.dropdown.nativeElement;
    
    // Posicionar el dropdown
    dropdownEl.style.width = selectRect.width + 'px';
    dropdownEl.style.left = selectRect.left + 'px';

    const spaceBelow = window.innerHeight - selectRect.bottom;
    const spaceAbove = selectRect.top;
    
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      // Posicionar arriba
      dropdownEl.style.top = (selectRect.top - dropdownEl.offsetHeight - 4) + 'px';
      this.dropdownDirection = 'up';
    } else {
      // Posicionar abajo
      dropdownEl.style.top = (selectRect.bottom + 4) + 'px';
      this.dropdownDirection = 'down';
    }
  }

  private getSelectedOptions(): SelectOption[] {
    if (!Array.isArray(this.value)) return [];
    return this.options.filter(option => this.value.includes(option.value));
  }

  // Template helper methods
  get containerClasses(): string {
    return [
      'app-select-container',
      this.size ? `app-select-container--${this.size}` : '',
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