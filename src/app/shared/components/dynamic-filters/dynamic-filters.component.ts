import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { FilterConfig, FilterValues, FilterOption } from '../../interfaces/filter-config.interface';
import { CatalogService } from '../../../services/catalog.service';
import { InputComponent } from '../ui/input/input.component';
import { SelectComponent } from '../ui/select/select.component';
import { ButtonComponent } from '../ui/button/button.component';
import { UiFiltersPanelComponent } from '../ui/filters-panel/filters-panel.component';

@Component({
  selector: 'app-dynamic-filters',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    InputComponent, 
    SelectComponent, 
    ButtonComponent, 
    UiFiltersPanelComponent
  ],
  templateUrl: './dynamic-filters.component.html',
  styleUrls: ['./dynamic-filters.component.css']
})
export class DynamicFiltersComponent implements OnInit, OnDestroy {
  @Input() configs: FilterConfig[] = [];
  @Input() defaultValues: FilterValues = {};
  @Output() filtersChange = new EventEmitter<FilterValues>();

  filters: FilterValues = {};
  private filterChange$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  // Store resolved options for dynamic catalogs
  resolvedOptions: Map<string, FilterOption[]> = new Map();

  constructor(
    private catalogService: CatalogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Load dynamic options first
    this.loadDynamicOptions().then(() => {
      // Initialize filters after options are loaded
      this.initializeFilters();
      
      // Setup debounced filter change
      this.filterChange$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.filtersChange.emit({ ...this.filters });
      });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadDynamicOptions(): Promise<void> {
    const loadPromises: Promise<void>[] = [];

    this.configs.forEach(config => {
      if (config.type === 'combined' && config.combinedFields) {
        config.combinedFields.forEach(field => {
          if (field.catalogType) {
            loadPromises.push(this.loadCatalogOptions(field.key, field.catalogType));
          }
        });
      } else if (config.catalogType) {
        loadPromises.push(this.loadCatalogOptions(config.key, config.catalogType));
      }
    });

    await Promise.all(loadPromises);
    this.cdr.detectChanges();
  }

  private async loadCatalogOptions(key: string, catalogType: string): Promise<void> {
    try {
      let options: FilterOption[] = [];
      
      switch (catalogType) {
        case 'identifications':
          options = await this.catalogService.loadIdentificationsCatalog().toPromise() || [];
          break;
        case 'status':
          options = await this.catalogService.loadStatusCatalog().toPromise() || [];
          break;
        default:
          console.warn(`Unknown catalog type: ${catalogType}`);
      }
      
      this.resolvedOptions.set(key, options);
    } catch (error) {
      console.error(`Error loading catalog for ${key}:`, error);
      this.resolvedOptions.set(key, []);
    }
  }

  private initializeFilters() {
    this.configs.forEach(config => {
      if (config.type === 'combined' && config.combinedFields) {
        // Para campos combinados, inicializar cada subcampo
        config.combinedFields.forEach(field => {
          this.filters[field.key] = this.defaultValues[field.key] || '';
        });
      } else {
        this.filters[config.key] = this.defaultValues[config.key] || '';
      }
    });
    
    // Emitir valores iniciales si hay defaults
    if (Object.keys(this.defaultValues).length > 0) {
      setTimeout(() => this.onFilterChange(), 0);
    }
  }

  onFilterChange() {
    this.filterChange$.next();
  }

  clearFilters() {
    this.configs.forEach(config => {
      if (config.type === 'combined' && config.combinedFields) {
        config.combinedFields.forEach(field => {
          this.filters[field.key] = '';
        });
      } else {
        this.filters[config.key] = '';
      }
    });
    this.onFilterChange();
  }

  getFilterWidth(config: FilterConfig): string {
    return config.width || 'auto';
  }

  /**
   * Get options for a specific filter field
   */
  getOptionsForField(config: FilterConfig): FilterOption[] {
    // Check if we have resolved dynamic options
    if (config.catalogType && this.resolvedOptions.has(config.key)) {
      return this.resolvedOptions.get(config.key) || [];
    }
    
    // Fallback to static options
    return config.options || [];
  }

  /**
   * Get options for a combined field
   */
  getOptionsForCombinedField(field: any): FilterOption[] {
    // Check if we have resolved dynamic options
    if (field.catalogType && this.resolvedOptions.has(field.key)) {
      return this.resolvedOptions.get(field.key) || [];
    }
    
    // Fallback to static options
    return field.options || [];
  }
}