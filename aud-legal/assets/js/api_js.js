// ============================================
// API.JS - Wrapper para llamadas a n8n
// ============================================

// Mock Data para desarrollo
const MOCK_DATA = {
  clientes: [
    {
      id: 1,
      rfc: 'ABC123456789',
      razon_social: 'Constructora ABC S.A. de C.V.',
      nombre_comercial: 'Constructora ABC',
      giro: 'Construcción',
      status: 'Activo',
      fecha_alta: '2024-01-15',
      responsable_legal_id: 6,
      responsable_legal: 'VIRI',
      notas: 'Cliente principal con múltiples expedientes activos',
      total_expedientes: 5,
      expedientes_activos: 3
    },
    {
      id: 2,
      rfc: 'DEF987654321',
      razon_social: 'Transportes del Norte S.A. de C.V.',
      nombre_comercial: 'Transportes del Norte',
      giro: 'Transporte',
      status: 'Activo',
      fecha_alta: '2024-02-20',
      responsable_legal_id: 6,
      responsable_legal: 'VIRI',
      notas: 'Cliente con contratos de servicio',
      total_expedientes: 2,
      expedientes_activos: 2
    },
    {
      id: 3,
      rfc: 'GHI456789012',
      razon_social: 'Servicios Integrales MX S.A. de C.V.',
      nombre_comercial: 'Servicios MX',
      giro: 'Servicios',
      status: 'Inactivo',
      fecha_alta: '2023-11-10',
      responsable_legal_id: 6,
      responsable_legal: 'VIRI',
      notas: 'Expediente cerrado',
      total_expedientes: 1,
      expedientes_activos: 0
    }
  ],

  expedientes: [
    {
      id: 1,
      cliente_id: 1,
      cliente_nombre: 'Constructora ABC',
      numero_expediente: 'EXP-2024-001',
      nombre: 'Demanda Laboral - Juan Pérez',
      tipo: 'Demanda',
      descripcion: 'Demanda por despido injustificado',
      fecha_inicio: '2024-01-20',
      fecha_cierre: null,
      status: 'En Proceso',
      prioridad: 'Alta',
      asignado_a: 6,
      asignado_nombre: 'VIRI',
      total_documentos: 15,
      ultima_actividad: '2024-02-01'
    },
    {
      id: 2,
      cliente_id: 1,
      cliente_nombre: 'Constructora ABC',
      numero_expediente: 'EXP-2024-002',
      nombre: 'Contrato de Obra - Plaza Revolución',
      tipo: 'Contrato',
      descripcion: 'Revisión y firma de contrato de construcción',
      fecha_inicio: '2024-01-25',
      fecha_cierre: null,
      status: 'En Proceso',
      prioridad: 'Media',
      asignado_a: 6,
      asignado_nombre: 'VIRI',
      total_documentos: 8,
      ultima_actividad: '2024-01-30'
    },
    {
      id: 3,
      cliente_id: 2,
      cliente_nombre: 'Transportes del Norte',
      numero_expediente: 'EXP-2024-003',
      nombre: 'Auditoría Fiscal 2023',
      tipo: 'Auditoría',
      descripcion: 'Auditoría fiscal anual',
      fecha_inicio: '2024-02-01',
      fecha_cierre: null,
      status: 'En Proceso',
      prioridad: 'Alta',
      asignado_a: 6,
      asignado_nombre: 'VIRI',
      total_documentos: 25,
      ultima_actividad: '2024-02-05'
    }
  ],

  colaboradores: [
    {
      id: 1,
      cliente_id: 1,
      cliente_nombre: 'Constructora ABC',
      curp: 'PEPJ850315HDFRRN01',
      nombre_completo: 'Juan Pérez Rodríguez',
      puesto: 'Gerente de Obra',
      email: 'jperez@constructoraabc.com',
      telefono: '4421234567',
      fecha_ingreso: '2020-03-15',
      status: 'Activo',
      total_documentos: 5
    },
    {
      id: 2,
      cliente_id: 1,
      cliente_nombre: 'Constructora ABC',
      curp: 'LOPM920812MDFPRT08',
      nombre_completo: 'María López Martínez',
      puesto: 'Contadora',
      email: 'mlopez@constructoraabc.com',
      telefono: '4429876543',
      fecha_ingreso: '2021-06-01',
      status: 'Activo',
      total_documentos: 5
    }
  ]
};

// ============================================
// FUNCIONES DE API
// ============================================

class API {
  constructor() {
    this.baseUrl = window.CONFIG?.API_BASE_URL || 'https://n8n.datazentrika.com/webhook';
    this.useMock = window.CONFIG?.USE_MOCK_DATA !== false;
  }

  // Helper para hacer peticiones
  async request(endpoint, options = {}) {
    if (this.useMock) {
      return this.mockRequest(endpoint, options);
    }

    const token = window.getToken();
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      ...options
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Simulador de respuestas (Mock)
  async mockRequest(endpoint, options = {}) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const { body = {} } = options;

    // Clientes
    if (endpoint.includes('clientes-list')) {
      return { ok: true, data: MOCK_DATA.clientes };
    }
    if (endpoint.includes('cliente-detail')) {
      const cliente = MOCK_DATA.clientes.find(c => c.id === body.id);
      return { ok: true, data: cliente };
    }
    if (endpoint.includes('cliente-create')) {
      const newCliente = {
        id: Date.now(),
        ...body,
        fecha_alta: new Date().toISOString().split('T')[0],
        total_expedientes: 0,
        expedientes_activos: 0
      };
      MOCK_DATA.clientes.push(newCliente);
      return { ok: true, data: newCliente };
    }
    if (endpoint.includes('cliente-update')) {
      const index = MOCK_DATA.clientes.findIndex(c => c.id === body.id);
      if (index !== -1) {
        MOCK_DATA.clientes[index] = { ...MOCK_DATA.clientes[index], ...body };
        return { ok: true, data: MOCK_DATA.clientes[index] };
      }
      return { ok: false, error: 'Cliente no encontrado' };
    }

    // Expedientes
    if (endpoint.includes('expedientes-list')) {
      let expedientes = MOCK_DATA.expedientes;
      if (body.cliente_id) {
        expedientes = expedientes.filter(e => e.cliente_id === body.cliente_id);
      }
      return { ok: true, data: expedientes };
    }
    if (endpoint.includes('expediente-detail')) {
      const expediente = MOCK_DATA.expedientes.find(e => e.id === body.id);
      return { ok: true, data: expediente };
    }
    if (endpoint.includes('expediente-create')) {
      const newExpediente = {
        id: Date.now(),
        ...body,
        fecha_inicio: new Date().toISOString().split('T')[0],
        total_documentos: 0,
        ultima_actividad: new Date().toISOString().split('T')[0]
      };
      MOCK_DATA.expedientes.push(newExpediente);
      return { ok: true, data: newExpediente };
    }

    // Colaboradores
    if (endpoint.includes('colaboradores-list')) {
      let colaboradores = MOCK_DATA.colaboradores;
      if (body.cliente_id) {
        colaboradores = colaboradores.filter(c => c.cliente_id === body.cliente_id);
      }
      return { ok: true, data: colaboradores };
    }
    if (endpoint.includes('colaborador-create')) {
      const newColaborador = {
        id: Date.now(),
        ...body,
        total_documentos: 0
      };
      MOCK_DATA.colaboradores.push(newColaborador);
      return { ok: true, data: newColaborador };
    }

    return { ok: false, error: 'Endpoint no implementado' };
  }

  // ========== CLIENTES ==========
  async listarClientes(filtros = {}) {
    return this.request(window.CONFIG.ENDPOINTS.CLIENTES_LIST, { body: filtros });
  }

  async obtenerCliente(id) {
    return this.request(window.CONFIG.ENDPOINTS.CLIENTE_DETAIL, { body: { id } });
  }

  async crearCliente(data) {
    return this.request(window.CONFIG.ENDPOINTS.CLIENTE_CREATE, { body: data });
  }

  async actualizarCliente(id, data) {
    return this.request(window.CONFIG.ENDPOINTS.CLIENTE_UPDATE, { body: { id, ...data } });
  }

  async eliminarCliente(id) {
    return this.request(window.CONFIG.ENDPOINTS.CLIENTE_DELETE, { body: { id } });
  }

  // ========== EXPEDIENTES ==========
  async listarExpedientes(filtros = {}) {
    return this.request(window.CONFIG.ENDPOINTS.EXPEDIENTES_LIST, { body: filtros });
  }

  async obtenerExpediente(id) {
    return this.request(window.CONFIG.ENDPOINTS.EXPEDIENTE_DETAIL, { body: { id } });
  }

  async crearExpediente(data) {
    return this.request(window.CONFIG.ENDPOINTS.EXPEDIENTE_CREATE, { body: data });
  }

  async actualizarExpediente(id, data) {
    return this.request(window.CONFIG.ENDPOINTS.EXPEDIENTE_UPDATE, { body: { id, ...data } });
  }

  async agregarActividad(expediente_id, descripcion, tipo_actividad = 'Comentario') {
    return this.request(window.CONFIG.ENDPOINTS.EXPEDIENTE_ACTIVIDAD, {
      body: { expediente_id, descripcion, tipo_actividad }
    });
  }

  // ========== COLABORADORES ==========
  async listarColaboradores(cliente_id = null) {
    return this.request(window.CONFIG.ENDPOINTS.COLABORADORES_LIST, { 
      body: cliente_id ? { cliente_id } : {} 
    });
  }

  async crearColaborador(data) {
    return this.request(window.CONFIG.ENDPOINTS.COLABORADOR_CREATE, { body: data });
  }

  async actualizarColaborador(id, data) {
    return this.request(window.CONFIG.ENDPOINTS.COLABORADOR_UPDATE, { body: { id, ...data } });
  }
}

// Instancia global
const api = new API();

// Export
if (typeof window !== 'undefined') {
  window.api = api;
  window.API = API;
}

export default api;