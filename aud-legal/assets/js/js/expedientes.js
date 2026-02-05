const ExpedientesModule = {
  currentExpedientes: [],
  filtros: {busqueda: '', status: 'Todos'},

  async init() {
    this.setupEventListeners();
    await this.cargarExpedientes();
  },

  setupEventListeners() {
    document.getElementById('search-expedientes')?.addEventListener('input', this.debounce((e) => {
      this.filtros.busqueda = e.target.value;
      this.filtrarYRenderizar();
    }, 300));

    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-filter]').forEach(b => {
          b.className = 'px-4 py-2 rounded-full bg-white border text-slate-600 text-xs font-medium hover:border-primary';
        });
        btn.className = 'px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-medium';
        this.filtros.status = btn.dataset.filter;
        this.filtrarYRenderizar();
      });
    });
  },

  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  async cargarExpedientes() {
    try {
      const response = await window.api.listarExpedientes();
      if (response.ok) {
        this.currentExpedientes = response.data || [];
        this.renderizarExpedientes(this.currentExpedientes);
        this.actualizarEstadisticas();
      }
    } catch (error) {
      console.error('[Expedientes] Error:', error);
    }
  },

  filtrarYRenderizar() {
    let filtrados = [...this.currentExpedientes];
    
    if (this.filtros.busqueda) {
      const b = this.filtros.busqueda.toLowerCase();
      filtrados = filtrados.filter(e => 
        e.nombre.toLowerCase().includes(b) ||
        e.numero_expediente.toLowerCase().includes(b) ||
        e.cliente_nombre.toLowerCase().includes(b)
      );
    }

    if (this.filtros.status !== 'Todos') {
      filtrados = filtrados.filter(e => e.status === this.filtros.status);
    }

    this.renderizarExpedientes(filtrados);
  },

  renderizarExpedientes(expedientes) {
    const container = document.getElementById('expedientes-grid');
    
    if (expedientes.length === 0) {
      container.innerHTML = '<div class="col-span-full text-center py-12"><span class="material-symbols-outlined text-6xl text-slate-300 mb-3">search_off</span><p class="text-slate-500">No se encontraron expedientes</p></div>';
      return;
    }

    container.innerHTML = expedientes.map(e => `
      <div class="bg-white rounded-xl border p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer" onclick="window.location.href='expediente-detalle.html?id=${e.id}'">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="font-bold text-slate-800 mb-1">${e.nombre}</h3>
            <p class="text-xs text-slate-500">${e.numero_expediente}</p>
          </div>
          <span class="px-2 py-1 rounded-full text-xs font-medium ${
            e.status === 'En Proceso' ? 'bg-blue-100 text-blue-700' :
            e.status === 'Cerrado' ? 'bg-green-100 text-green-700' :
            e.status === 'Pausado' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }">${e.status}</span>
        </div>
        <div class="space-y-2 text-sm text-slate-600 mb-4">
          <div class="flex items-center gap-2"><span class="material-symbols-outlined text-lg">business</span><span class="truncate">${e.cliente_nombre}</span></div>
          <div class="flex items-center gap-2"><span class="material-symbols-outlined text-lg">category</span><span>${e.tipo}</span></div>
          <div class="flex items-center gap-2"><span class="material-symbols-outlined text-lg">person</span><span>${e.asignado_nombre || 'Sin asignar'}</span></div>
        </div>
        <div class="flex items-center justify-between pt-4 border-t">
          <div class="flex items-center gap-1 text-xs text-slate-400"><span class="material-symbols-outlined text-sm">calendar_today</span>${new Date(e.fecha_inicio).toLocaleDateString('es-MX')}</div>
          <div class="flex items-center gap-2">
            ${e.prioridad === 'Alta' ? '<span class="w-2 h-2 rounded-full bg-red-500"></span>' : ''}
            <span class="text-xs text-slate-400">${e.total_documentos || 0} docs</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  actualizarEstadisticas() {
    const total = this.currentExpedientes.length;
    const enProceso = this.currentExpedientes.filter(e => e.status === 'En Proceso').length;
    const cerrado = this.currentExpedientes.filter(e => e.status === 'Cerrado').length;
    const alta = this.currentExpedientes.filter(e => e.prioridad === 'Alta').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-en-proceso').textContent = enProceso;
    document.getElementById('stat-cerrado').textContent = cerrado;
    document.getElementById('stat-alta').textContent = alta;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('expedientes-grid')) {
    ExpedientesModule.init();
  }
});

window.ExpedientesModule = ExpedientesModule;