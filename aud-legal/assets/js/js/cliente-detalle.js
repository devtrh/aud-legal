const ClienteDetalleModule = {
  clienteId: null,
  cliente: null,
  expedientes: [],
  colaboradores: [],

  async init() {
    const params = new URLSearchParams(window.location.search);
    this.clienteId = parseInt(params.get('id'));
    
    if (!this.clienteId) {
      alert('ID de cliente no válido');
      window.location.href = 'clientes.html';
      return;
    }

    this.setupEventListeners();
    await this.cargarDatos();
  },

  setupEventListeners() {
    document.getElementById('btn-nuevo-expediente')?.addEventListener('click', () => this.mostrarModalExpediente());
    document.getElementById('btn-nuevo-colaborador')?.addEventListener('click', () => this.mostrarModalColaborador());
    document.getElementById('form-nuevo-expediente')?.addEventListener('submit', (e) => {e.preventDefault(); this.crearExpediente();});
    document.getElementById('form-nuevo-colaborador')?.addEventListener('submit', (e) => {e.preventDefault(); this.crearColaborador();});
  },

  async cargarDatos() {
    try {
      const [clienteRes, expedientesRes, colaboradoresRes] = await Promise.all([
        window.api.obtenerCliente(this.clienteId),
        window.api.listarExpedientes({cliente_id: this.clienteId}),
        window.api.listarColaboradores(this.clienteId)
      ]);

      if (clienteRes.ok) {
        this.cliente = clienteRes.data;
        this.renderizarCliente();
      }
      if (expedientesRes.ok) {
        this.expedientes = expedientesRes.data;
        this.renderizarExpedientes();
      }
      if (colaboradoresRes.ok) {
        this.colaboradores = colaboradoresRes.data;
        this.renderizarColaboradores();
      }
    } catch (error) {
      console.error('[ClienteDetalle] Error:', error);
    }
  },

  renderizarCliente() {
    const c = this.cliente;
    const iniciales = (c.nombre_comercial || c.razon_social).split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
    
    document.getElementById('cliente-avatar').textContent = iniciales;
    document.getElementById('cliente-nombre').textContent = c.nombre_comercial || c.razon_social;
    document.getElementById('cliente-rfc').textContent = `RFC: ${c.rfc}`;
    document.getElementById('cliente-giro').textContent = c.giro || 'Sin giro';
    document.getElementById('cliente-responsable').textContent = c.responsable_legal || 'Sin asignar';
    document.getElementById('cliente-fecha').textContent = new Date(c.fecha_alta).toLocaleDateString('es-MX');

    const statusBadge = document.getElementById('cliente-status-badge');
    statusBadge.textContent = c.status;
    statusBadge.className = `px-3 py-1 rounded-full text-xs font-medium ${
      c.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
    }`;

    const notasDiv = document.getElementById('cliente-notas');
    if (c.notas) {
      notasDiv.innerHTML = `<span class="material-symbols-outlined text-yellow-600">info</span><div><p class="text-sm font-medium text-slate-800">Notas</p><p class="text-xs text-slate-600 mt-1">${c.notas}</p></div>`;
    } else {
      notasDiv.style.display = 'none';
    }
  },

  renderizarExpedientes() {
    const container = document.getElementById('lista-expedientes');
    document.getElementById('count-expedientes').textContent = this.expedientes.length;

    if (this.expedientes.length === 0) {
      container.innerHTML = '<p class="text-sm text-slate-400 text-center py-8">No hay expedientes</p>';
      return;
    }

    container.innerHTML = this.expedientes.map(e => `
      <div class="border rounded-xl p-4 hover:border-primary/50 transition-all cursor-pointer" onclick="window.location.href='expediente-detalle.html?id=${e.id}'">
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-semibold text-slate-800">${e.nombre}</h4>
          <span class="px-2 py-1 rounded-full text-xs font-medium ${
            e.status === 'En Proceso' ? 'bg-blue-100 text-blue-700' :
            e.status === 'Cerrado' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }">${e.status}</span>
        </div>
        <p class="text-xs text-slate-500 mb-2">${e.numero_expediente} • ${e.tipo}</p>
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="material-symbols-outlined text-sm">calendar_today</span>
          ${new Date(e.fecha_inicio).toLocaleDateString('es-MX')}
        </div>
      </div>
    `).join('');
  },

  renderizarColaboradores() {
    const container = document.getElementById('lista-colaboradores');
    
    if (this.colaboradores.length === 0) {
      container.innerHTML = '<p class="text-sm text-slate-400 text-center py-8">No hay colaboradores</p>';
      return;
    }

    container.innerHTML = this.colaboradores.map(c => `
      <div class="border rounded-xl p-4 hover:border-primary/50 transition-all">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
            ${c.nombre_completo.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-slate-800 text-sm">${c.nombre_completo}</h4>
            <p class="text-xs text-slate-500">${c.puesto || 'Sin puesto'}</p>
          </div>
          <span class="px-2 py-1 rounded-full text-xs font-medium ${
            c.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }">${c.status}</span>
        </div>
      </div>
    `).join('');
  },

  mostrarModalExpediente() {
    document.getElementById('modal-nuevo-expediente').classList.remove('hidden');
  },

  ocultarModalExpediente() {
    document.getElementById('modal-nuevo-expediente').classList.add('hidden');
    document.getElementById('form-nuevo-expediente').reset();
  },

  mostrarModalColaborador() {
    document.getElementById('modal-nuevo-colaborador').classList.remove('hidden');
  },

  ocultarModalColaborador() {
    document.getElementById('modal-nuevo-colaborador').classList.add('hidden');
    document.getElementById('form-nuevo-colaborador').reset();
  },

  async crearExpediente() {
    const form = document.getElementById('form-nuevo-expediente');
    const formData = new FormData(form);
    
    const data = {
      cliente_id: this.clienteId,
      numero_expediente: formData.get('numero_expediente'),
      nombre: formData.get('nombre'),
      tipo: formData.get('tipo'),
      descripcion: formData.get('descripcion'),
      asignado_a: window.getUser()?.id,
      status: 'En Proceso'
    };

    try {
      const response = await window.api.crearExpediente(data);
      if (response.ok) {
        alert('✅ Expediente creado');
        this.ocultarModalExpediente();
        await this.cargarDatos();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al crear expediente');
    }
  },

  async crearColaborador() {
    const form = document.getElementById('form-nuevo-colaborador');
    const formData = new FormData(form);
    
    const data = {
      cliente_id: this.clienteId,
      curp: formData.get('curp'),
      nombre_completo: formData.get('nombre_completo'),
      puesto: formData.get('puesto'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      status: 'Activo'
    };

    try {
      const response = await window.api.crearColaborador(data);
      if (response.ok) {
        alert('✅ Colaborador creado');
        this.ocultarModalColaborador();
        await this.cargarDatos();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al crear colaborador');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => ClienteDetalleModule.init());
window.ClienteDetalleModule = ClienteDetalleModule;