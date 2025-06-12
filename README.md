# 🚗 Privyde - Plataforma de Transporte de Lujo

**Privyde** es una plataforma integral de transporte de lujo que conecta clientes con servicios de chófer premium a nivel global. Ofrecemos una experiencia de transporte excepcional con vehículos de alta gama, conductores profesionales y tecnología avanzada.

## 🌟 Características Principales

### 🎯 **Servicios de Transporte**
- **Traslados al Aeropuerto** - Seguimiento de vuelos y tiempo de espera incluido
- **Viajes Ciudad a Ciudad** - Tarifas fijas para trayectos de larga distancia
- **Alquiler por Horas** - Flexibilidad total con conductores profesionales
- **Eventos Especiales** - Bodas, celebraciones y ocasiones importantes
- **Servicios de Limusina** - Lujo y estilo para momentos únicos
- **Jets Privados** - Transporte aéreo exclusivo y personalizado
- **Traslados Corporativos VIP** - Soluciones ejecutivas para empresas
- **Servicios de Seguridad Ejecutiva** - Protección discreta y profesional

### 💼 **Panel de Administración Completo**
- **Gestión de Reservas** - Sistema avanzado de booking con verificación de disponibilidad
- **Administración de Conductores** - Perfiles, horarios y asignaciones
- **Gestión de Vehículos** - Flota completa con detalles y disponibilidad
- **Sistema de Rutas** - Rutas fijas y zonas flexibles
- **Blog Corporativo** - Gestión de contenido y noticias
- **Soporte en Tiempo Real** - Chat integrado con Socket.IO
- **Notificaciones Push** - Sistema de alertas y comunicaciones
- **Análisis y Reportes** - Estadísticas detalladas del negocio

### 🌐 **Experiencia del Cliente**
- **Reserva Online** - Proceso intuitivo paso a paso
- **Seguimiento en Tiempo Real** - Ubicación del vehículo y conductor
- **Pagos Seguros** - Integración con Stripe
- **Autenticación Google** - Login rápido y seguro
- **Perfiles Personalizados** - Gestión de preferencias y historial
- **Soporte 24/7** - Chat en vivo y asistencia inmediata

## 🏗️ Arquitectura del Sistema

```
privyde-platform/
├── 🎨 frontend/              # Aplicación React + TypeScript
│   ├── src/
│   │   ├── pages/            # Páginas principales y admin
│   │   ├── components/       # Componentes reutilizables
│   │   ├── services/         # Servicios API y lógica de negocio
│   │   └── hooks/            # Custom hooks para gestión de estado
│   └── public/               # Assets estáticos
├── 🔧 backend/               # API Flask + MongoDB
│   ├── routes/               # Endpoints organizados por funcionalidad
│   ├── models/               # Modelos de datos y esquemas
│   ├── services/             # Lógica de negocio y servicios externos
│   └── utils/                # Utilidades y helpers
└── 📁 uploads/               # Archivos subidos (imágenes, documentos)
```

## 🚀 Tecnologías Utilizadas

### **Frontend**
- **React 18** - Framework principal con hooks modernos
- **TypeScript** - Tipado estático para mayor robustez
- **Vite** - Build tool rápido y moderno
- **TailwindCSS** - Framework de estilos utility-first
- **Radix UI** - Componentes accesibles y personalizables
- **React Router DOM** - Navegación SPA
- **Socket.IO Client** - Comunicación en tiempo real
- **React Query** - Gestión de estado del servidor
- **Stripe** - Procesamiento de pagos
- **Google Maps API** - Mapas y geocodificación
- **Framer Motion** - Animaciones fluidas

### **Backend**
- **Flask** - Framework web minimalista y flexible
- **MongoDB** - Base de datos NoSQL escalable
- **PyMongo** - Driver oficial de MongoDB para Python
- **Flask-SocketIO** - WebSockets para tiempo real
- **JWT** - Autenticación basada en tokens
- **Google OAuth** - Autenticación social
- **Stripe API** - Procesamiento de pagos
- **Google Maps API** - Servicios de geolocalización
- **OpenAI API** - Inteligencia artificial integrada
- **Flask-CORS** - Manejo de CORS para API

## 📋 Requisitos del Sistema

- **Node.js** v18 o superior
- **Python** v3.8 o superior
- **MongoDB** v4.4 o superior
- **Cuentas API requeridas:**
  - Google Cloud Console (Maps + OAuth)
  - Stripe (Pagos)
  - OpenAI (IA)

## ⚡ Instalación Rápida

### 1. **Clonar el repositorio**
```bash
git clone https://github.com/VanguardiaAI/privyde-platform.git
cd privyde-platform
```

### 2. **Instalar todas las dependencias**
```bash
npm run install:all
```

### 3. **Configurar variables de entorno**

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_STRIPE_PUBLISHABLE_KEY=tu_stripe_public_key
```

**Backend** (`backend/.env`):
```env
# Base de datos
MONGO_URI=mongodb://localhost:27017/operiq

# JWT
JWT_SECRET_KEY=tu_jwt_secret_super_seguro
JWT_ACCESS_TOKEN_EXPIRES=3600

# Google Services
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# Stripe
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=tu_stripe_webhook_secret

# OpenAI
OPENAI_API_KEY=tu_openai_api_key
```

### 4. **Iniciar los servicios**

**Terminal 1 - Backend:**
```bash
npm run backend:dev
```

**Terminal 2 - Frontend:**
```bash
npm run frontend:dev
```

## 🎯 Funcionalidades Clave Implementadas

### **Sistema de Reservas Avanzado**
- ✅ Verificación de disponibilidad en tiempo real
- ✅ Cálculo automático de precios
- ✅ Asignación inteligente de conductores
- ✅ Gestión de horarios y rutas
- ✅ Notificaciones automáticas

### **Panel de Administración**
- ✅ Dashboard con métricas en tiempo real
- ✅ CRUD completo para todas las entidades
- ✅ Sistema de roles y permisos
- ✅ Gestión de contenido del blog
- ✅ Herramientas de comunicación

### **Experiencia del Usuario**
- ✅ Interfaz responsive y moderna
- ✅ Proceso de reserva optimizado
- ✅ Autenticación múltiple (email/Google)
- ✅ Perfiles personalizables
- ✅ Historial de viajes

## 🔄 Próximas Funcionalidades (Apps Complementarias)

### **📱 App Móvil para Conductores**
- Gestión de horarios y disponibilidad
- Navegación GPS integrada
- Comunicación directa con clientes
- Reportes de viajes y ganancias

### **📊 App de Analytics y Reportes**
- Dashboard ejecutivo avanzado
- Análisis de rendimiento por conductor
- Métricas de satisfacción del cliente
- Reportes financieros detallados

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run frontend:dev          # Iniciar frontend en modo desarrollo
npm run backend:dev           # Iniciar backend en modo desarrollo

# Instalación
npm run install:all           # Instalar todas las dependencias
npm run install:frontend      # Solo dependencias del frontend
npm run install:backend       # Solo dependencias del backend

# Producción
npm run frontend:build        # Build del frontend para producción
```

## 🔐 Seguridad y Privacidad

- **Encriptación de datos** sensibles en tránsito y reposo
- **Autenticación JWT** con tokens de corta duración
- **Validación de entrada** en todos los endpoints
- **CORS configurado** para dominios específicos
- **Variables de entorno** para credenciales sensibles
- **Logs de auditoría** para todas las operaciones críticas

## 🌍 Despliegue

El proyecto está preparado para despliegue en:
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, Google Cloud Run
- **Base de datos**: MongoDB Atlas, AWS DocumentDB

## 📞 Soporte y Contacto

Para soporte técnico o consultas sobre el proyecto:
- **Email**: soporte@privyde.com
- **Chat en vivo**: Disponible en la plataforma
- **Documentación**: Wiki del repositorio

## 📄 Licencia

Este proyecto es propiedad de **Privyde** y está protegido por derechos de autor. Todos los derechos reservados.

---

**Desarrollado con ❤️ por el equipo de Privyde**

*Transformando el transporte de lujo a través de la tecnología* 