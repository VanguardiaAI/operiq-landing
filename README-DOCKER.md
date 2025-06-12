# 🐳 Guía de Despliegue Docker - Privyde Platform

Esta guía te ayudará a desplegar tu aplicación Privyde Platform usando Docker en tu servidor con 1Panel, configurado para usar MongoDB Atlas y el dominio privyde.com.

## 📋 Requisitos Previos

- Docker y Docker Compose instalados en tu servidor
- 1Panel configurado y funcionando
- Acceso SSH a tu servidor
- MongoDB Atlas configurado y funcionando
- Dominio privyde.com configurado
- Puertos 8080 y 5001 disponibles (evitamos conflicto con WordPress en puerto 80)

## 🚀 Despliegue Rápido

### 1. Preparar el Servidor

```bash
# Conectar por SSH a tu servidor
ssh usuario@tu-servidor.com

# Crear directorio para el proyecto
mkdir -p /opt/privyde
cd /opt/privyde
```

### 2. Subir Archivos

Sube todos los archivos de tu proyecto al servidor. Puedes usar:

```bash
# Opción 1: SCP
scp -r /ruta/local/Privyde/* usuario@servidor:/opt/privyde/

# Opción 2: rsync
rsync -avz --progress /ruta/local/Privyde/ usuario@servidor:/opt/privyde/

# Opción 3: Git (recomendado)
git clone https://github.com/tu-usuario/privyde-platform.git .
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar configuraciones
nano .env
```

**Configuraciones importantes en `.env`:**

```env
# MongoDB Atlas (tu conexión existente)
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/privyde?retryWrites=true&w=majority

# JWT (genera uno seguro)
JWT_SECRET_KEY=tu_jwt_secret_super_seguro_aqui

# Stripe
STRIPE_SECRET_KEY=sk_live_tu_clave_stripe
STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_stripe

# APIs
GOOGLE_MAPS_API_KEY=tu_google_maps_key
OPENAI_API_KEY=tu_openai_key

# URLs para privyde.com
VITE_API_URL=https://privyde.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_stripe
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_key
```

### 4. Ejecutar Despliegue

```bash
# Hacer ejecutable el script
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh production
```

## 🔧 Configuración en 1Panel

### Configurar Proxy Reverso para privyde.com

Como ya tienes WordPress en el puerto 80, necesitas configurar un proxy reverso:

1. **1Panel** → **Websites** → **Create Website**
2. **Configurar dominio:** `privyde.com`
3. **Tipo:** Reverse Proxy
4. **Target:** `http://localhost:8080` (nuestro frontend)
5. **Habilitar SSL** (Let's Encrypt)

### Configurar API Proxy

Para que las llamadas a `/api` funcionen:

1. **Crear otra entrada de proxy** o **editar la configuración Nginx**
2. **Ruta:** `/api`
3. **Target:** `http://localhost:5001` (nuestro backend)

### Configuración Nginx Manual (Alternativa)

Si prefieres configurar Nginx manualmente en 1Panel:

```nginx
server {
    listen 80;
    server_name privyde.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name privyde.com;
    
    # Certificados SSL (1Panel los maneja automáticamente)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoreo y Logs

### Ver Estado de Contenedores
```bash
docker-compose ps
```

### Ver Logs en Tiempo Real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Estadísticas de Recursos
```bash
docker stats
```

## 🛠️ Comandos Útiles

### Gestión de Servicios
```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart backend

# Reconstruir imágenes
docker-compose up --build -d
```

### Mantenimiento
```bash
# Limpiar imágenes no utilizadas
docker system prune -f

# Ver uso de espacio
docker system df

# Backup de uploads
docker cp privyde-backend:/app/uploads ./backup/uploads_$(date +%Y%m%d_%H%M%S)
```

### Acceso a Contenedores
```bash
# Acceder al backend
docker exec -it privyde-backend bash

# Acceder al frontend (nginx)
docker exec -it privyde-frontend sh
```

## 🔒 Seguridad

### Configuraciones Recomendadas

1. **Puertos utilizados (sin conflicto con WordPress):**
```yaml
# En docker-compose.yml
ports:
  - "8080:80"    # Frontend (Nginx interno)
  - "5001:5000"  # Backend API
```

2. **Firewall configurado:**
```bash
# Solo permitir puertos necesarios
ufw allow 80      # WordPress/Nginx principal
ufw allow 443     # HTTPS
ufw allow 8080    # Privyde Frontend
ufw allow 5001    # Privyde Backend
ufw allow 22      # SSH
ufw enable
```

3. **Variables de entorno seguras:**
```bash
# Generar JWT secret seguro
openssl rand -base64 64
```

## 🚨 Solución de Problemas

### Problema: Puerto ocupado
```bash
# Verificar qué usa los puertos
netstat -tulpn | grep :8080
netstat -tulpn | grep :5001

# Si hay conflicto, cambiar puertos en docker-compose.yml
```

### Problema: No se conecta a MongoDB Atlas
```bash
# Verificar conexión desde el contenedor
docker exec privyde-backend python -c "
import pymongo
from os import environ
client = pymongo.MongoClient(environ['MONGO_URI'])
print(client.admin.command('ping'))
"
```

### Problema: API no responde
```bash
# Verificar logs del backend
docker-compose logs backend

# Probar conexión directa
curl http://localhost:5001/health
```

### Problema: Frontend no carga
```bash
# Verificar build del frontend
docker-compose logs frontend

# Probar acceso directo
curl http://localhost:8080
```

## 📈 Arquitectura Final

```
Internet → 1Panel/Nginx (puerto 443/80)
    ├── privyde.com/ → Docker Frontend (puerto 8080)
    └── privyde.com/api/ → Docker Backend (puerto 5001)
                              └── MongoDB Atlas (cloud)
```

## 🔄 Actualizaciones

### Actualizar Aplicación
```bash
# Obtener últimos cambios
git pull origin main

# Reconstruir y desplegar
./deploy.sh production
```

### Backup Antes de Actualizar
```bash
# Backup de uploads
docker cp privyde-backend:/app/uploads ./backup/uploads_$(date +%Y%m%d_%H%M%S)

# MongoDB Atlas ya tiene backup automático
```

## 📞 Configuración Específica para tu Setup

### Puertos Utilizados:
- **8080**: Frontend Privyde (interno, proxy desde 1Panel)
- **5001**: Backend Privyde API (interno, proxy desde 1Panel)
- **80/443**: 1Panel/Nginx principal (WordPress + Proxy a Privyde)

### URLs Finales:
- **https://privyde.com**: Tu aplicación Privyde
- **https://privyde.com/api**: API de Privyde
- **Tu WordPress**: Sigue funcionando en su configuración actual

---

**¡Tu aplicación Privyde Platform está lista para producción en privyde.com! 🎉** 