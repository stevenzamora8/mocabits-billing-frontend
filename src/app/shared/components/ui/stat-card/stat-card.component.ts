import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ui-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css']
})
export class UiStatCardComponent {
  /** Small HTML for the icon slot (SVG markup) */
  @Input() iconHtml: string | null = null;
  /** Title shown above the value */
  @Input() title: string = '';
  /** Main numeric/string value */
  @Input() value: string | number = '';
  /** variant: 'primary' | 'success' | 'warning' | 'danger' */
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' = 'primary';
}
