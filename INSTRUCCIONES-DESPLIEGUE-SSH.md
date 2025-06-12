# 🚀 Instrucciones de Despliegue SSH - Privyde Platform

## 📋 Puertos Utilizados (Sin Conflictos)

- **Frontend**: Puerto `8081` (evita conflicto con OpenResty en 8080)
- **Backend**: Puerto `5002` (evita conflictos con otros servicios)
- **WordPress**: Sigue en puerto 80/443 (sin cambios)

## 🔧 Paso a Paso - Despliegue por SSH

### 1. Conectar al Servidor

```bash
ssh root@217.65.146.106
```

### 2. Crear Directorio del Proyecto

```bash
# Crear directorio
mkdir -p /opt/privyde
cd /opt/privyde
```

### 3. Clonar el Repositorio desde GitHub

```bash
# Clonar el repositorio
git clone https://github.com/VanguardiaAI/operiq-landing.git .

# Verificar que se clonó correctamente
ls -la
```

### 4. Verificar Docker

```bash
# Verificar que Docker esté instalado
docker --version
docker-compose --version

# Si no están instalados:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker root
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión SSH después de instalar Docker (si fue necesario)
exit
ssh root@217.65.146.106
cd /opt/privyde
```

### 5. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar configuraciones
nano .env
```

**Configurar tu archivo `.env`:**
```env
# MongoDB Atlas (tu conexión real)
MONGO_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/privyde?retryWrites=true&w=majority

# JWT Secret (genera uno seguro)
JWT_SECRET_KEY=tu_jwt_secret_super_seguro_aqui

# Stripe (tus claves reales)
STRIPE_SECRET_KEY=sk_live_tu_clave_stripe_real
STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_stripe_real

# Google Maps API
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key_real

# OpenAI API (si usas)
OPENAI_API_KEY=tu_openai_api_key_real

# URLs para privyde.com
VITE_API_URL=https://privyde.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_stripe_real
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key_real
```

### 6. Ejecutar Despliegue

```bash
# Hacer ejecutable el script
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh production
```

### 7. Verificar que Todo Funcione

```bash
# Verificar contenedores
docker-compose ps

# Debería mostrar algo como:
# privyde-backend    running   0.0.0.0:5002->5000/tcp
# privyde-frontend   running   0.0.0.0:8081->80/tcp

# Probar conexiones
curl http://localhost:8081  # Frontend
curl http://localhost:5002  # Backend API

# Ver logs si hay problemas
docker-compose logs -f
```

## 🔧 Configurar Proxy en 1Panel

### 8. Configurar Sitio Web en 1Panel

1. **Acceder a 1Panel** → **Websites** → **Create Website**

2. **Configuración del Sitio:**
   - **Domain**: `privyde.com`
   - **Type**: `Reverse Proxy`
   - **Target**: `http://127.0.0.1:8081`
   - **Enable SSL**: ✅ (Let's Encrypt)

3. **Configurar Proxy para API:**
   
   Después de crear el sitio, edita la configuración Nginx:
   
   **1Panel** → **Websites** → **privyde.com** → **Config** → **Edit**
   
   Agrega esta configuración dentro del bloque `server`:
   
   ```nginx
   # Proxy para API del backend
   location /api/ {
       proxy_pass http://127.0.0.1:5002/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_set_header X-Forwarded-Host $server_name;
       
       # Para WebSockets si es necesario
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

### 9. Configurar Firewall (Opcional pero Recomendado)

```bash
# Permitir solo puertos necesarios
ufw allow 22      # SSH
ufw allow 80      # HTTP
ufw allow 443     # HTTPS
ufw allow 8081    # Privyde Frontend (interno)
ufw allow 5002    # Privyde Backend (interno)
ufw --force enable
```

## ✅ Verificación Final

### 10. Probar la Aplicación

1. **Acceder a tu sitio**: https://privyde.com
2. **Verificar API**: https://privyde.com/api (debería responder)
3. **Verificar logs**: `docker-compose logs -f`

### 11. Comandos Útiles para Mantenimiento

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Actualizar aplicación desde GitHub
git pull origin master  # o main según tu rama
docker-compose up --build -d

# Backup de uploads
docker cp privyde-backend:/app/uploads ./backup/uploads_$(date +%Y%m%d_%H%M%S)

# Limpiar Docker
docker system prune -f
```

## 🚨 Solución de Problemas

### Si el Frontend no carga:
```bash
docker-compose logs frontend
curl http://localhost:8081
```

### Si la API no responde:
```bash
docker-compose logs backend
curl http://localhost:5002
```

### Si hay problemas de conexión a MongoDB:
```bash
docker exec privyde-backend python -c "
import pymongo
import os
client = pymongo.MongoClient(os.environ['MONGO_URI'])
print('MongoDB conectado:', client.admin.command('ping'))
"
```

### Si los puertos siguen ocupados:
```bash
# Verificar qué usa los puertos
netstat -tulpn | grep :8081
netstat -tulpn | grep :5002

# Si hay conflicto, cambiar puertos en docker-compose.yml
```

### Si hay problemas con Git:
```bash
# Verificar estado del repositorio
git status

# Actualizar desde GitHub
git fetch origin
git reset --hard origin/master  # Cuidado: esto sobrescribe cambios locales

# Ver commits recientes
git log --oneline -5
```

## 📊 Arquitectura Final

```
Internet → 1Panel/Nginx (puerto 443/80)
    ├── WordPress (configuración existente)
    ├── privyde.com/ → Docker Frontend (puerto 8081)
    └── privyde.com/api/ → Docker Backend (puerto 5002)
                              └── MongoDB Atlas (cloud)
```

## 🔄 Actualizaciones Futuras

### Para actualizar la aplicación:
```bash
cd /opt/privyde

# Obtener últimos cambios del repositorio
git pull origin master

# Reconstruir y desplegar
docker-compose up --build -d

# Verificar que todo funcione
docker-compose ps
```

### Para hacer cambios y subirlos al repositorio:
```bash
# Hacer cambios en archivos
nano archivo.txt

# Agregar cambios
git add .

# Commit
git commit -m "Descripción de los cambios"

# Subir al repositorio
git push origin master
```

## 🎉 ¡Listo!

Tu aplicación Privyde Platform estará disponible en:
- **https://privyde.com** - Tu aplicación principal
- **https://privyde.com/api** - API del backend
- **Tu WordPress** - Sigue funcionando normalmente

### Repositorio GitHub:
- **URL**: https://github.com/VanguardiaAI/operiq-landing.git
- **Rama principal**: master
- **Actualizaciones**: `git pull origin master`

---

**¡Tu aplicación está lista para producción! 🚀** 