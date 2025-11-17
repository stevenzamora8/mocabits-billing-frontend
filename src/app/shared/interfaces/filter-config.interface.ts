export interface FilterOption {
  value: any;
  label: string;
}

export interface FilterConfig {
  key: string;
  type: 'text' | 'select' | 'date' | 'combined';
  label: string;
  placeholder?: string;
  icon?: string;
  width?: string;
  options?: FilterOption[];
  
  // Para opciones dinámicas desde catálogos
  catalogEndpoint?: string; // endpoint del catálogo (ej: 'identifications')
  catalogType?: 'identifications' | 'status' | 'custom'; // tipo de catálogo predefinido
  
  // Para filtros combinados (como Tipo ID + Identificación)
  combinedFields?: {
    key: string;
    type: 'text' | 'select';
    label: string;
    placeholder?: string;
    icon?: string;
    width: string;
    options?: FilterOption[];
    catalogEndpoint?: string;
    catalogType?: 'identifications' | 'status' | 'custom';
  }[];
}

export interface ModuleFilterConfig {
  moduleName: string;
  filters: FilterConfig[];
  defaultValues?: { [key: string]: any };
}

export interface FilterValues {
  [key: string]: any;
}