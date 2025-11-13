import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money',
  standalone: true
})
export class MoneyPipe implements PipeTransform {
  /**
   * Formats a number as currency using Intl.NumberFormat.
   * Defaults: USD / en-US
   * Usage in template: {{ amount | money:'USD':'en-US' }}
   */
  transform(value: number | string | null | undefined, currency: string = 'USD', locale: string = 'en-US'): string {
    const n = typeof value === 'string' ? Number(value) : (value ?? 0);
    if (isNaN(Number(n))) return String(value ?? '');
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(n));
    } catch (e) {
      // Fallback to simple formatting
      return `$${Number(n).toFixed(2)}`;
    }
  }
}
