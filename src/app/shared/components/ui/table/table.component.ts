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
  template: `
  <div class="ui-table">
    <div class="ui-table__header" *ngIf="columns?.length">
      <div class="ui-table__row" [style.gridTemplateColumns]="gridTemplate">
        <div *ngFor="let col of columns" class="ui-table__cell ui-table__cell--head" [style.width]="col.width" [class.text-right]="col.align === 'right'" [class.text-center]="col.align === 'center'">
          {{ col.label }}
        </div>
        <div *ngIf="actionsTemplate" class="ui-table__cell ui-table__cell--head actions">Acciones</div>
      </div>
    </div>

    <div class="ui-table__body">
      <ng-container *ngIf="!loading && data && data.length; else emptyOrLoading">
        <div *ngFor="let row of data; let i = index; trackBy: trackByFn" class="ui-table__row" [style.gridTemplateColumns]="gridTemplate">
          <div *ngFor="let col of columns" class="ui-table__cell" [ngClass]="{'nowrap': col.nowrap}" [style.width]="col.width" [class.text-right]="col.align === 'right'" [class.text-center]="col.align === 'center'" [attr.data-label]="col.label" [attr.title]="getCellTitle(row, col)">
            <ng-container [ngSwitch]="col.field">
              <ng-container *ngSwitchCase="'status'">
                <span class="status-badge" [ngClass]="getStatusClass(row[col.field])">
                  {{ formatStatus(row[col.field]) }}
                </span>
              </ng-container>
              <ng-container *ngSwitchDefault>
                {{ getCellDisplay(row, col) }}
              </ng-container>
            </ng-container>
          </div>

          <div *ngIf="actionsTemplate" class="ui-table__cell actions" data-label="Acciones">
            <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: row }"></ng-container>
          </div>
        </div>
      </ng-container>
    </div>

    <ng-template #emptyOrLoading>
      <div *ngIf="loading" class="ui-table__skeleton">
        <div class="ui-table__row-skel" *ngFor="let _ of skeletonRows; let i = index">
          <div class="ui-skel-cell" *ngFor="let col of columns"></div>
          <div *ngIf="actionsTemplate" class="ui-skel-cell actions"></div>
        </div>
      </div>
  <!-- Only render empty text when explicitly provided by the page to avoid duplicate messages -->
  <div *ngIf="!loading && emptyText" class="ui-table__empty">{{ emptyText }}</div>
    </ng-template>
  </div>
  `,
  styles: [
    `:host{display:block;font-family:var(--font-family-primary,system-ui)}
   /* Make the table fully responsive and avoid horizontal scrollbars.
     Columns without explicit width use minmax(0, 1fr) so they shrink flexibly. */
   .ui-table{width:100%;overflow:visible;background:#fff;border-radius:8px;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1)}
    
    .ui-table__header{background:#f8fafc;border-bottom:2px solid #e2e8f0;margin:0}
  .ui-table__header .ui-table__row{background:transparent;border:none;padding:12px 0;display:grid;align-items:center}
  .ui-table__cell--head{font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.025em;color:#64748b;padding:0 16px;min-width:0;display:flex;align-items:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;justify-self:start}
  /* Ensure actions header reserves enough space and never wraps */
  .ui-table__cell--head.actions{justify-self:start;min-width:220px;white-space:nowrap}
    
    .ui-table__body{}
  .ui-table__row{display:grid;align-items:center;padding:12px 0;border-bottom:1px solid #f1f5f9;background:#fff;transition:background-color 0.15s ease}
  .ui-table__row:hover{background:#f8fafc}
  .ui-table__row:last-child{border-bottom:none}

  /* Skeleton loading placeholders */
  .ui-table__skeleton{padding:16px}
  .ui-table__row-skel{display:grid;grid-auto-flow:column;grid-gap:16px;align-items:center;padding:12px 0;border-bottom:1px solid #f1f5f9}
  .ui-skel-cell{height:16px;border-radius:8px;background:linear-gradient(90deg,#f1f5f9 0%, #e9eef7 50%, #f1f5f9 100%);background-size:200% 100%;animation: shimmer 1.2s linear infinite}
  .ui-skel-cell.actions{width:220px;height:28px;border-radius:14px}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    
  /* Allow wrapping by default so long texts are visible; keep min-width to allow grid to shrink correctly */
  .ui-table__cell{min-width:0;padding:0 16px;display:flex;align-items:center;overflow-wrap:anywhere;word-break:break-word;overflow:visible;text-overflow:clip;white-space:normal;color:#1e293b;font-size:14px;line-height:1.5}
  /* If a column explicitly requests nowrap, revert to single-line ellipsis */
  .ui-table__cell.nowrap{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  /* Actions cell: keep buttons inside the column; allow wrap so they don't overflow */
  .ui-table__cell.actions{justify-self:start;gap:8px;display:flex;align-items:center;flex-wrap:wrap;max-width:220px}
    
    .ui-table__empty{text-align:center;color:#64748b;padding:48px 24px;font-size:15px;background:#fff}
    .text-right{justify-content:flex-end;text-align:right}
    .text-center{justify-content:center;text-align:center}

  /* Status badge styles (improved colors and sizing) */
  .ui-table .status-badge{display:inline-flex;align-items:center;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:600;margin-right:8px;gap:8px}
  .ui-table .status-badge.activo{background:#ecfdf5;color:#065f46;border:1px solid #bbf7d0}
  .ui-table .status-badge.inactivo{background:#fff1f2;color:#7f1d1d;border:1px solid #fecaca}
  .ui-table .status-badge.pendiente{background:#fffbeb;color:#92400e;border:1px solid #fed7aa}

    /* Action buttons styling */
  .ui-table :global(.action-buttons){display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  /* Make action buttons more compact inside the table */
  /* Make action buttons even more compact so icons fit in one line */
  .ui-table :global(.action-buttons) app-button{padding:2px 4px;min-width:28px;height:28px;font-size:11px}
  .ui-table :global(.action-buttons) app-button .app-button__icon-html{font-size:12px;line-height:1}
  .ui-table :global(.action-buttons) app-button .app-button__icon-html i{font-size:12px}

    /* Responsive: stack rows on narrow viewports */
    @media (max-width: 768px) {
      .ui-table__header{display:none}
      .ui-table__row{display:block;border-bottom:1px solid #eef2f7;padding:16px;margin-bottom:8px;border-radius:8px;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}
      .ui-table__cell{display:flex;padding:8px 0;justify-content:space-between;border-bottom:1px solid #f1f5f9}
      .ui-table__cell:last-child{border-bottom:none}
      .ui-table__cell::before{content: attr(data-label);font-weight:600;color:#64748b;margin-right:12px;flex:0 0 40%;font-size:12px;text-transform:uppercase;letter-spacing:0.025em}
      .ui-table__cell.actions{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
      .ui-table__cell.actions::before{content:'ACCIONES'}
    }
    `
  ]
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
    if (this.actionsTemplate) cols.push('220px');
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
