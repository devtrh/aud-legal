// ============================================
// CLIENTES.JS - Lógica de Clientes Externos
// ============================================

const ClientesModule = {
  currentClientes: [],
  clienteSeleccionado: null,
  filtros: {
    busqueda: '',
    status: 'Todos'
  },

  // Inicializar módulo
  async init() {
    console.log('[Clientes] Módulo inicializado');
    this.setupEventListeners();
    await this.cargarClientes();
  },

  // Configurar event listeners
  setupEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById('search-clientes');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.filtros.busqueda = e.target.value;
        this.filtrarYRenderizar();
      }, 300));
    }

    // Filtros de status (botones)
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Actualizar estado visual
        filterButtons.forEach(b => {
          b.classList.remove('bg-slate-800', 'text-white', 'shadow-md');
          b.classList.add('bg-white', 'border-slate-200', 'text-slate-600');
        });
        btn.classList.add('bg-slate-800', 'text-white', 'shadow-md');
        btn.classList.remove('bg-white', 'border-slate-200', 'text-slate-600');

        // Actualizar filtro
        this.filtros.status = btn.dataset.filter;
        this.filtrarYRenderizar();
      });
    });

    // Botón nuevo cliente
    const btnNuevo = document.getElementById('btn-nuevo-cliente');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', () => this.mostrarModalNuevo());
    }

    // Form nuevo cliente
    const formNuevo = document.getElementById('form-nuevo-cliente');
    if (formNuevo) {
      formNuevo.addEventListener('submit', (e) => {
        e.preventDefault();
        this.crearCliente();
      });
    }
  },

  // Debounce helper
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Cargar clientes desde API
  async cargarClientes() {
    try {
      const response = await window.api.listarClientes();
      
      if (response.ok) {
        this.currentClientes = response.data || [];
        this.renderizarLista(this.currentClientes);
        this.actualizarEstadisticas();
      } else {
        this.mostrarError('No se pudieron cargar los clientes');
      }
    } catch (error) {
      console.error('[Clientes] Error al cargar:', error);
      this.mostrarError('Error de conexión al cargar clientes');
    }
  },

  // Filtrar y renderizar
  filtrarYRenderizar() {
    let clientesFiltrados = [...this.currentClientes];

    // Filtro por búsqueda
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      clientesFiltrados = clientesFiltrados.filter(c => 
        c.rfc.toLowerCase().includes(busqueda) ||
        c.razon_social.toLowerCase().includes(busqueda) ||
        (c.nombre_comercial || '').toLowerCase().includes(busqueda)
      );
    }

    // Filtro por status
    if (this.filtros.status !== 'Todos') {
      clientesFiltrados = clientesFiltrados.filter(c => c.status === this.filtros.status);
    }

    this.renderizarLista(clientesFiltrados);
  },

  // Renderizar lista de clientes
  renderizarLista(clientes) {
    const container = document.getElementById('clientes-lista');
    if (!container) return;

    if (clientes.length === 0) {
      container.innerHTML = this.getEmptyState();
      return;
    }

    container.innerHTML = clientes.map((cliente, index) => this.getClienteCard(cliente, index === 0)).join('');
    
    // Agregar event listeners a las cards
    clientes.forEach(cliente => {
      const card = document.getElementById(`cliente-${cliente.id}`);
      if (card) {
        card.addEventListener('click', () => this.seleccionarCliente(cliente));
      }
    });
  },

  // Template de card de cliente
  getClienteCard(cliente, isFirst = false) {
    const statusClass = {
      'Activo': 'bg-green-500',
      'Inactivo': 'bg-gray-400',
      'Suspendido': 'bg-red-500'
    }[cliente.status] || 'bg-gray-400';

    const statusBadgeClass = {
      'Activo': 'text-primary bg-primary/10',
      'Inactivo': 'text-slate-500 bg-slate-100',
      'Suspendido': 'text-red-600 bg-red-50'
    }[cliente.status] || 'text-slate-500 bg-slate-100';

    const borderClass = isFirst ? 'border-primary/30 ring-1 ring-primary/20 shadow-md shadow-primary/5' : 'border-slate-100 hover:border-primary/30 hover:shadow-md';
    const leftBorder = isFirst ? '<div class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-primary"></div>' : '';

    // Iniciales para avatar
    const iniciales = (cliente.nombre_comercial || cliente.razon_social)
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();

    return `
      <div id="cliente-${cliente.id}" class="group relative flex cursor-pointer gap-4 rounded-2xl border ${borderClass} bg-white p-4 transition-all">
        ${leftBorder}
        <div class="relative h-12 w-12 flex-shrink-0">
          <div class="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm ring-2 ring-white">
            ${iniciales}
          </div>
          ${cliente.status === 'Activo' ? '<div class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></div>' : ''}
        </div>
        <div class="flex flex-1 flex-col justify-center overflow-hidden">
          <div class="flex items-center justify-between">
            <h4 class="truncate text-sm font-bold ${isFirst ? 'text-slate-900' : 'text-slate-700 group-hover:text-primary transition-colors'}">${cliente.nombre_comercial || cliente.razon_social}</h4>
            ${cliente.status === 'Activo' ? `<span class="text-[10px] font-semibold ${statusBadgeClass} px-2 py-0.5 rounded-full">Activo</span>` : ''}
          </div>
          <p class="truncate text-xs text-slate-500">RFC: ${cliente.rfc}</p>
          <p class="truncate text-xs text-slate-400 mt-0.5">Última actividad: ${this.formatearFechaRelativa(cliente.fecha_alta)}</p>
        </div>
      </div>
    `;
  },

  // Estado vacío
  getEmptyState() {
    return `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <span class="material-symbols-outlined text-5xl text-slate-300 mb-3">search_off</span>
        <p class="text-sm font-medium text-slate-500">No se encontraron clientes</p>
        <p class="text-xs text-slate-400 mt-1">Intenta ajustar los filtros</p>
      </div>
    `;
  },

  // Seleccionar cliente
  seleccionarCliente(cliente) {
    this.clienteSeleccionado = cliente;
    
    // Redirigir a página de detalle (cuando la creemos)
    window.location.href = `cliente-detalle.html?id=${cliente.id}`;
    
    // O mostrar en panel derecho (implementar después)
    // this.mostrarDetalleEnPanel(cliente);
  },

  // Mostrar modal nuevo cliente
  mostrarModalNuevo() {
    const modal = document.getElementById('modal-nuevo-cliente');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  // Ocultar modal
  ocultarModal() {
    const modal = document.getElementById('modal-nuevo-cliente');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      
      const form = document.getElementById('form-nuevo-cliente');
      if (form) form.reset();
    }
  },

  // Crear nuevo cliente
  async crearCliente() {
    const form = document.getElementById('form-nuevo-cliente');
    const formData = new FormData(form);
    
    const data = {
      rfc: formData.get('rfc'),
      razon_social: formData.get('razon_social'),
      nombre_comercial: formData.get('nombre_comercial'),
      giro: formData.get('giro'),
      status: 'Activo',
      responsable_legal_id: window.getUser()?.id,
      notas: formData.get('notas')
    };

    try {
      const response = await window.api.crearCliente(data);
      
      if (response.ok) {
        this.mostrarExito('Cliente creado correctamente');
        this.ocultarModal();
        await this.cargarClientes();
      } else {
        this.mostrarError('No se pudo crear el cliente');
      }
    } catch (error) {
      console.error('[Clientes] Error al crear:', error);
      this.mostrarError('Error al crear el cliente');
    }
  },

  // Actualizar estadísticas
  actualizarEstadisticas() {
    const total = this.currentClientes.length;
    const activos = this.currentClientes.filter(c => c.status === 'Activo').length;
    
    const totalEl = document.getElementById('stat-total-clientes');
    const activosEl = document.getElementById('stat-clientes-activos');
    
    if (totalEl) totalEl.textContent = total;
    if (activosEl) activosEl.textContent = activos;
  },

  // Helpers de UI
  mostrarError(mensaje) {
    alert(`❌ ${mensaje}`);
  },

  mostrarExito(mensaje) {
    alert(`✅ ${mensaje}`);
  },

  formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  },

  formatearFechaRelativa(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return this.formatearFecha(fecha);
  }
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('clientes-lista')) {
    ClientesModule.init();
  }
});

// Export global
if (typeof window !== 'undefined') {
  window.ClientesModule = ClientesModule;
}

export default ClientesModule;