# Plantilla React 18 + TypeScript + Flask + MongoDB

Esta es una plantilla para proyectos que utilizan React 18 con TypeScript en el frontend y Flask con MongoDB en el backend.

## Estructura del Proyecto

```
.
├── frontend/          # Aplicación React + TypeScript
└── backend/          # API Flask + MongoDB
```

## Archivos de Configuración

### Frontend
```
frontend/
├── vite.config.ts             # Configuración de Vite
├── tsconfig.json              # Configuración principal de TypeScript
├── tsconfig.node.json         # Configuración de TypeScript para Vite
├── postcss.config.cjs         # Configuración de PostCSS
└── tailwind.config.cjs        # Configuración de TailwindCSS
```

### Raíz del Proyecto
```
./
├── package.json         # Scripts para ejecutar frontend y backend
└── README.md            # Documentación del proyecto
```

## Requisitos Previos

- Node.js (v18 o superior)
- Python (v3.8 o superior)
- MongoDB

## Instalación rápida

Para instalar todas las dependencias del proyecto:

```bash
npm run install:all
```

## Iniciar el proyecto

Para iniciar el frontend:

```bash
npm run frontend:dev
```

Para iniciar el backend:

```bash
npm run backend:dev
```

## Configuración Manual

### Frontend

1. Navegar al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear archivo .env:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Backend

1. Navegar al directorio del backend:
   ```bash
   cd backend
   ```

2. Crear y activar entorno virtual:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate # Linux/Mac
   ```

3. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Crear archivo .env:
   ```
   MONGO_URI=://localhost:27017
   FLASK_ENV=development
   ```

5. Iniciar el servidor:
   ```bash
   python app.py
   ```

## Tecnologías Incluidas

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui (Componentes)
- TanStack Query (React Query)
- Axios
- React Router DOM

### Backend
- Flask
- Flask-CORS
- PyMongo
- python-dotenv

## Características

- ✅ Configuración completa de TypeScript
- ✅ Integración con MongoDB
- ✅ Sistema de estilos con Tailwind CSS
- ✅ Componentes UI con shadcn/ui
- ✅ Gestión de estado con TanStack Query
- ✅ Cliente HTTP configurado con Axios
- ✅ CORS habilitado
- ✅ Variables de entorno configuradas 