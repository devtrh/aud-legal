# 📁 AUD Legal - Sistema de Gestión Documental

Sistema web para el área legal de **Archivo Único Digital (AUD)** que permite gestionar clientes externos, expedientes, colaboradores y documentos legales.

## 🚀 Estado Actual

### ✅ Implementado (con Mock Data)
- **Sistema de Clientes Externos**
  - Lista de clientes con búsqueda y filtros
  - Creación de nuevos clientes
  - Vista de cards responsive
  - Estadísticas en tiempo real

### 🔧 En Desarrollo
- Página de detalle de cliente
- Módulo de expedientes
- Módulo de colaboradores
- Webhooks de n8n (backend)

---

## 📦 Estructura del Proyecto

```
aud-legal/
├── index.html                  # Landing page
├── login.html                  # Página de login
│
├── pages/                      # Páginas del sistema
│   ├── panel1.html            # Dashboard
│   ├── clientes.html          # ✅ Lista de clientes
│   ├── cliente-detalle.html   # 🔧 Detalle de cliente
│   ├── expedientes.html       # 🔧 Expedientes
│   └── archivo.html           # Explorador de archivos
│
├── assets/
│   ├── js/
│   │   ├── config.js          # ✅ Configuración global
│   │   ├── api.js             # ✅ Wrapper de API con mock data
│   │   ├── clientes.js        # ✅ Lógica de clientes
│   │   ├── navigation.js      # Sistema de navegación
│   │   ├── mobile-menu.js     # Menú móvil
│   │   └── archivo.js         # Explorador de archivos
│   │
│   └── css/
│       └── main.css
│
└── README.md                   # Este archivo
```

---

## 🛠️ Tecnologías

- **Frontend:** Vanilla JavaScript (ES6+)
- **Estilos:** Tailwind CSS (CDN)
- **Backend:** n8n (webhooks)
- **Base de Datos:** PostgreSQL
- **Servidor:** Ubuntu 24.10
- **Archivos:** Linux File System (`/mnt/automatizacion/AUD/`)

---

## 🎯 Configuración

### 1. Modo de Desarrollo (Mock Data)

El proyecto está configurado para usar **datos de prueba** mientras se desarrollan los webhooks de n8n.

```javascript
// assets/js/config.js
const CONFIG = {
  MODE: 'development',
  USE_MOCK_DATA: true, // ← Usar datos falsos
  API_BASE_URL: 'https://n8n.datazentrika.com/webhook'
};
```

### 2. Modo de Producción (Webhooks Reales)

Una vez que los webhooks estén listos:

```javascript
const CONFIG = {
  MODE: 'production',
  USE_MOCK_DATA: false, // ← Usar webhooks reales
  API_BASE_URL: 'https://n8n.datazentrika.com/webhook'
};
```

---

## 🏃 Ejecutar Localmente

### Opción 1: Python

```bash
cd aud-legal
python3 -m http.server 8000
# Abre: http://localhost:8000/pages/clientes.html
```

### Opción 2: Node.js

```bash
npx http-server -p 8000
# Abre: http://localhost:8000/pages/clientes.html
```

### Opción 3: VS Code Live Server

1. Instala la extensión **Live Server**
2. Click derecho en `pages/clientes.html`
3. Selecciona **"Open with Live Server"**

---

## 📊 Base de Datos

### Tablas Implementadas

```sql
-- Clientes externos
CREATE TABLE clientes_externos (
    id SERIAL PRIMARY KEY,
    rfc VARCHAR(13) UNIQUE NOT NULL,
    razon_social TEXT NOT NULL,
    nombre_comercial TEXT,
    giro TEXT,
    status VARCHAR(50) DEFAULT 'Activo',
    fecha_alta DATE DEFAULT CURRENT_DATE,
    responsable_legal_id INT REFERENCES usuarios(id),
    notas TEXT,
    ruta_archivos TEXT,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE
);

-- Expedientes
CREATE TABLE expedientes (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes_externos(id) ON DELETE CASCADE,
    numero_expediente VARCHAR(50) UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    tipo VARCHAR(100),
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_cierre DATE,
    status VARCHAR(50) DEFAULT 'En Proceso',
    prioridad VARCHAR(20) DEFAULT 'Media',
    asignado_a INT REFERENCES usuarios(id),
    ruta_archivos TEXT,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE
);

-- Colaboradores de clientes
CREATE TABLE colaboradores_clientes (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes_externos(id) ON DELETE CASCADE,
    curp VARCHAR(18) UNIQUE,
    nombre_completo TEXT NOT NULL,
    puesto TEXT,
    email TEXT,
    telefono VARCHAR(20),
    fecha_ingreso DATE,
    fecha_baja DATE,
    status VARCHAR(50) DEFAULT 'Activo',
    ruta_archivos TEXT,
    notas TEXT,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE
);
```

---

## 🔌 Webhooks n8n (Pendientes)

### Clientes Externos
```
POST /webhook/aud-clientes-list          # Listar clientes
POST /webhook/aud-cliente-detail         # Detalle de cliente
POST /webhook/aud-cliente-create         # Crear cliente
POST /webhook/aud-cliente-update         # Actualizar cliente
POST /webhook/aud-cliente-delete         # Eliminar cliente
```

### Expedientes
```
POST /webhook/aud-expedientes-list       # Listar expedientes
POST /webhook/aud-expediente-detail      # Detalle de expediente
POST /webhook/aud-expediente-create      # Crear expediente
POST /webhook/aud-expediente-update      # Actualizar expediente
POST /webhook/aud-expediente-actividad   # Agregar actividad
```

### Colaboradores
```
POST /webhook/aud-colaboradores-list     # Listar colaboradores
POST /webhook/aud-colaborador-create     # Crear colaborador
POST /webhook/aud-colaborador-update     # Actualizar colaborador
POST /webhook/aud-colaborador-docs       # Gestionar documentos
```

---

## 🧪 Datos de Prueba (Mock Data)

El archivo `assets/js/api.js` contiene **3 clientes de ejemplo**:

1. **Constructora ABC S.A. de C.V.**
   - RFC: ABC123456789
   - Giro: Construcción
   - 5 expedientes, 3 activos

2. **Transportes del Norte S.A. de C.V.**
   - RFC: DEF987654321
   - Giro: Transporte
   - 2 expedientes activos

3. **Servicios Integrales MX S.A. de C.V.**
   - RFC: GHI456789012
   - Giro: Servicios
   - Status: Inactivo

---

## 📝 Próximos Pasos

### 1. Página de Detalle de Cliente ✅ (Siguiente)
- Vista completa de información del cliente
- Lista de expedientes asociados
- Lista de colaboradores
- Acceso rápido a documentos

### 2. Módulo de Expedientes
- CRUD de expedientes
- Asignación a usuarios
- Seguimiento de actividades
- Gestión de documentos

### 3. Módulo de Colaboradores
- CRUD de colaboradores
- Gestión de documentos (INE, CSF, etc.)
- Historial de cambios

### 4. Webhooks de n8n
- Conectar con PostgreSQL
- Implementar lógica de negocio
- Manejo de archivos en servidor Linux

---

## 👥 Roles y Permisos (Futuro)

```javascript
roles = {
  'Jefe Legal': {
    permisos: ['crear', 'editar', 'eliminar', 'ver_todo']
  },
  'Abogado': {
    permisos: ['crear', 'editar', 'ver_asignados']
  },
  'Asistente Legal': {
    permisos: ['ver_asignados', 'subir_documentos']
  }
}
```

---

## 🐛 Problemas Conocidos

- [ ] Los filtros de status necesitan persistir al recargar
- [ ] Falta paginación en lista de clientes (cuando sean +50)
- [ ] El panel de detalle en desktop está deshabilitado (pendiente implementar)

---

## 📞 Contacto

- **Proyecto:** AUD Legal
- **Repositorio:** https://github.com/devtrh/aud-legal
- **Stack:** n8n + PostgreSQL + Vanilla JS

---

## 📄 Licencia

Proyecto privado - Uso interno exclusivo.

---

**Última actualización:** 5 de Febrero, 2026