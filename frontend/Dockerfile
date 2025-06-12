# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Declarar ARGs para las variables de entorno en tiempo de build
ARG VITE_API_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_GOOGLE_MAPS_API_KEY

# Asignar ARGs a ENVs para que el build de Vite las use
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

# Copiar package files
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Build de la aplicación (ahora usará las ENVs de producción)
RUN npm run build

# Etapa 2: Producción con Nginx
FROM nginx:alpine

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos build desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"] 