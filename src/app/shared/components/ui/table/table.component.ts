import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UiTableColumn {
  field: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** Keep content on a single line and show ellipsis if too long */
  nowrap?: boolean;
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class UiTableComponent {
  @Input() columns: UiTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() emptyText?: string;
  @Input() trackBy?: (index: number, item: any) => any;
  @Input() actionsTemplate?: TemplateRef<any> | null = null;

  @Output() rowAction = new EventEmitter<{ action: string; row: any }>();

  trackByFn = (index: number, item: any) => {
    if (this.trackBy) return this.trackBy(index, item);
    return item && item.id != null ? item.id : index;
  };

  // Number of skeleton rows to show while loading
  skeletonRows = Array(6).fill(0);

  get gridTemplate(): string {
    // Use minmax(0, 1fr) for flexible columns so grid doesn't force horizontal scroll
    const cols = (this.columns || []).map(c => c.width ? c.width : 'minmax(0, 1fr)');
  // Reserve a fixed width for the actions column so buttons and header don't collapse
  // Match page-level styles that expect ~260px for action buttons/labels
  if (this.actionsTemplate) cols.push('260px');
    return cols.join(' ');
  }

  formatStatus(status: any): string {
    if (status == null) return '';
    switch (String(status)) {
      case 'A': return 'Activo';
      case 'I': return 'Inactivo';
      case 'P': return 'Pendiente';
      default: return String(status);
    }
  }

  getCellDisplay(row: any, col: UiTableColumn): string {
    const val = row && col && col.field in row ? row[col.field] : '';
    // Fallback formatting: convert objects/arrays to JSON, otherwise toString
    if (val == null) return '';
    if (col.field === 'status') return this.formatStatus(val);
    // Format totals as USD currency when the column is named 'total' or field is 'total'
    // table should not impose domain-specific formatting here; pages (components) should provide pre-formatted values when needed
    if (typeof val === 'object') {
      try { return JSON.stringify(val); } catch { return String(val); }
    }
    return String(val);
  }

  getCellTitle(row: any, col: UiTableColumn): string | null {
    // Provide a tooltip with the full content; for empty values return null to avoid empty title
    const text = this.getCellDisplay(row, col);
    return text ? text : null;
  }

  getStatusClass(status: any): string {
    if (status == null) return 'inactivo';
    switch (String(status)) {
      case 'A': return 'activo';
      case 'P': return 'pendiente';
      case 'I':
      default: return 'inactivo';
    }
  }
}
