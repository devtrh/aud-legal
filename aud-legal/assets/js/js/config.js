// ============================================
// CONFIG.JS - Configuración Global del Sistema
// ============================================

const CONFIG = {
  // Modo de desarrollo
  MODE: 'development', // 'development' | 'production'
  USE_MOCK_DATA: true, // Usar datos falsos mientras no hay webhooks
  
  // URLs Base
  API_BASE_URL: 'https://n8n.datazentrika.com/webhook',
  
  // Rutas de Archivos (Linux Server)
  FILE_PATHS: {
    EMPRESAS: '/mnt/automatizacion/AUD/empresas',
    CLIENTES_EXTERNOS: '/mnt/automatizacion/AUD/clientes_externos'
  },

  // Endpoints de Webhooks n8n
  ENDPOINTS: {
    // Autenticación
    LOGIN: '/login-aud',
    LOGOUT: '/logout-aud',
    
    // Clientes Externos
    CLIENTES_LIST: '/aud-clientes-list',
    CLIENTE_DETAIL: '/aud-cliente-detail',
    CLIENTE_CREATE: '/aud-cliente-create',
    CLIENTE_UPDATE: '/aud-cliente-update',
    CLIENTE_DELETE: '/aud-cliente-delete',
    
    // Expedientes
    EXPEDIENTES_LIST: '/aud-expedientes-list',
    EXPEDIENTE_DETAIL: '/aud-expediente-detail',
    EXPEDIENTE_CREATE: '/aud-expediente-create',
    EXPEDIENTE_UPDATE: '/aud-expediente-update',
    EXPEDIENTE_ACTIVIDAD: '/aud-expediente-actividad',
    
    // Colaboradores
    COLABORADORES_LIST: '/aud-colaboradores-list',
    COLABORADOR_CREATE: '/aud-colaborador-create',
    COLABORADOR_UPDATE: '/aud-colaborador-update',
    COLABORADOR_DOCS: '/aud-colaborador-docs',
    
    // Archivos (ya existentes)
    LISTAR_DIRECTORIO: '/aud-listar-directorio',
    PUBLICAR_ARCHIVO: '/aud-publicar-archivo',
    PDF_BASE64: '/aud-pdf-base64',
    
    // Empresas Internas (ya existentes)
    EMPRESAS_JSON: '/aud-empresas-json',
    EMPRESA_DETAIL: '/aud-detalle-empresa'
  },

  // LocalStorage Keys
  STORAGE_KEYS: {
    JWT: 'jwt_aud',
    USER: 'user_aud',
    IS_AUTH: 'isAuthenticated_aud'
  },

  // Status y Catálogos
  STATUS: {
    CLIENTE: ['Activo', 'Inactivo', 'Suspendido'],
    EXPEDIENTE: ['En Proceso', 'Cerrado', 'Pausado', 'Cancelado'],
    COLABORADOR: ['Activo', 'Inactivo', 'Baja'],
    PRIORIDAD: ['Alta', 'Media', 'Baja']
  },

  TIPOS_EXPEDIENTE: [
    'Demanda',
    'Trámite',
    'Contrato',
    'Auditoría',
    'Consultoría',
    'Otro'
  ],

  TIPOS_DOCUMENTO_COLABORADOR: [
    'INE',
    'CSF',
    'Comprobante Domicilio',
    'CURP',
    'Acta Nacimiento',
    'RFC',
    'Contrato Laboral',
    'Otro'
  ],

  // Configuración de UI
  UI: {
    ITEMS_PER_PAGE: 20,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300
  }
};

// Helpers para obtener URLs completas
const getApiUrl = (endpoint) => {
  if (CONFIG.USE_MOCK_DATA) return null;
  return `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS[endpoint]}`;
};

const getToken = () => localStorage.getItem(CONFIG.STORAGE_KEYS.JWT);

const getUser = () => {
  const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
};

const isAuthenticated = () => {
  return localStorage.getItem(CONFIG.STORAGE_KEYS.IS_AUTH) === 'true';
};

// Export para uso global
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.getApiUrl = getApiUrl;
  window.getToken = getToken;
  window.getUser = getUser;
  window.isAuthenticated = isAuthenticated;
}

export { CONFIG, getApiUrl, getToken, getUser, isAuthenticated };