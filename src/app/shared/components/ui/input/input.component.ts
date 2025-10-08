import { Component, Input, Output, EventEmitter, forwardRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea';
export type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() hint: string = '';
  @Input() error: string = '';
  @Input() errorMessage?: string | null | undefined;
  @Input() state?: 'default' | 'success' | 'error' | 'warning';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() maxLength: number | null = null;
  @Input() minLength: number | null = null;
  @Input() pattern: string | null = null;
  @Input() rows: number = 3;
  @Input() autocomplete: string = '';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() class: string = '';
  @Input() leftIcon: string = '';
  @Input() rightIcon: string = '';
  @Input() showPasswordToggle: boolean = false;
  @Input() loading: boolean = false;
  @Input() success: boolean = false;

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<FocusEvent>();
  @Output() inputBlur = new EventEmitter<FocusEvent>();
  @Output() rightIconClick = new EventEmitter<Event>();

  value: string = '';
  showPassword: boolean = false;
  focused: boolean = false;

  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onFocus(event: FocusEvent): void {
    this.focused = true;
    this.inputFocus.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.focused = false;
    this.onTouched();
    this.inputBlur.emit(event);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRightIconClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.rightIconClick.emit(event);
  }

  get inputType(): string {
    if (this.type === 'password' && this.showPasswordToggle) {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  get containerClasses(): string {
    const hasRightIcon = this.rightIcon || 
                         this.showPasswordToggle || 
                         this.success || 
                         this.state === 'success' || 
                         this.error || 
                         this.errorMessage || 
                         this.state === 'error' ||
                         this.loading;
    
    const classes = [
      'app-input-container',
      `app-input-container--${this.size}`,
      this.focused ? 'app-input-container--focused' : '',
      this.disabled ? 'app-input-container--disabled' : '',
      this.readonly ? 'app-input-container--readonly' : '',
      this.error || this.errorMessage ? 'app-input-container--error' : '',
      this.success || this.state === 'success' ? 'app-input-container--success' : '',
      this.state === 'error' ? 'app-input-container--error' : '',
      this.loading ? 'app-input-container--loading' : '',
      this.leftIcon ? 'app-input-container--with-left-icon' : '',
      hasRightIcon ? 'app-input-container--with-right-icon' : '',
      this.class
    ];

    return classes.filter(Boolean).join(' ');
  }

  get inputClasses(): string {
    return [
      'app-input',
      `app-input--${this.size}`
    ].join(' ');
  }
}