import { ModuleFilterConfig } from '../interfaces/filter-config.interface';

// Configuración de filtros para Clientes
export const CLIENTS_FILTER_CONFIG: ModuleFilterConfig = {
  moduleName: 'clients',
  filters: [
    {
      key: 'searchTerm',
      type: 'text',
      label: 'Nombre',
      placeholder: 'Buscar por nombre...',
      icon: 'fas fa-user'
    },
    {
      key: 'combined_type_identification',
      type: 'combined',
      label: 'Tipo ID y Identificación',
      combinedFields: [
        {
          key: 'selectedType',
          type: 'select',
          label: 'Tipo ID',
          placeholder: 'Todos los tipos',
          icon: 'fas fa-id-badge',
          width: '35%',
          catalogType: 'identifications' // Cargar desde catálogo dinámico
        },
        {
          key: 'selectedIdentification',
          type: 'text',
          label: 'Identificación',
          placeholder: 'Buscar identificación...',
          icon: 'fas fa-id-card',
          width: '65%'
        }
      ]
    },
    {
      key: 'selectedStatus',
      type: 'select',
      label: 'Estado',
      placeholder: 'Todos los estados',
      icon: 'fas fa-toggle-on',
      width: '0 0 180px',
      catalogType: 'status' // Cargar desde catálogo dinámico
    }
  ],
  defaultValues: {
    searchTerm: '',
    selectedType: '',
    selectedIdentification: '',
    selectedStatus: ''
  }
};

// Configuración de filtros para Productos
export const PRODUCTS_FILTER_CONFIG: ModuleFilterConfig = {
  moduleName: 'products',
  filters: [
    {
      key: 'filterName',
      type: 'text',
      label: 'Nombre',
      placeholder: 'Buscar por nombre...',
      icon: 'fas fa-box'
    },
    {
      key: 'combined_codes',
      type: 'combined',
      label: 'Códigos',
      combinedFields: [
        {
          key: 'filterMainCode',
          type: 'text',
          label: 'Código Principal',
          placeholder: 'Ej: PROD-001',
          width: '50%'
        },
        {
          key: 'filterAuxiliaryCode',
          type: 'text',
          label: 'Código Auxiliar',
          placeholder: 'Ej: 12345',
          width: '50%'
        }
      ]
    }
  ],
  defaultValues: {
    filterName: '',
    filterMainCode: '',
    filterAuxiliaryCode: ''
  }
};

// Configuración de filtros para Comprobantes/Receipts
export const RECEIPTS_FILTER_CONFIG: ModuleFilterConfig = {
  moduleName: 'receipts',
  filters: [
    {
      key: 'nameSearch',
      type: 'text',
      label: 'Cliente',
      placeholder: 'Cliente (nombre)',
      icon: 'fas fa-user'
    },
    {
      key: 'idSearch',
      type: 'text',
      label: 'Identificación',
      placeholder: 'Identificación cliente',
      icon: 'fas fa-id-card'
    },
    {
      key: 'numberSearch',
      type: 'text',
      label: 'Número comprobante',
      placeholder: 'Número comprobante',
      icon: 'fas fa-file-invoice'
    },
    {
      key: 'startDate',
      type: 'date',
      label: 'Desde',
      icon: 'fas fa-calendar-alt'
    },
    {
      key: 'endDate',
      type: 'date',
      label: 'Hasta',
      icon: 'fas fa-calendar-alt'
    },
    {
      key: 'selectedStatus',
      type: 'select',
      label: 'Estado',
      placeholder: 'Todos los estados',
      icon: 'fas fa-flag',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 'AUTORIZADO', label: 'Autorizado' },
        { value: 'PENDIENTE', label: 'Pendiente' },
        { value: 'RECHAZADO', label: 'Rechazado' },
        { value: 'ANULADO', label: 'Anulado' }
      ]
    }
  ],
  defaultValues: {
    nameSearch: '',
    idSearch: '',
    numberSearch: '',
    startDate: '',
    endDate: '',
    selectedStatus: ''
  }
};