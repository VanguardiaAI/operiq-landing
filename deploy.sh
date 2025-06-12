#!/bin/bash

# Script de despliegue para Privyde Platform
# Uso: ./deploy.sh [production|development]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Verificar archivo .env
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Copiando desde env.example..."
    if [ -f env.example ]; then
        cp env.example .env
        print_warning "Por favor edita el archivo .env con tus configuraciones antes de continuar."
        print_warning "Presiona Enter cuando hayas terminado de configurar .env..."
        read
    else
        print_error "Archivo env.example no encontrado. Crea un archivo .env manualmente."
        exit 1
    fi
fi

# Determinar modo de despliegue
MODE=${1:-production}

print_message "Iniciando despliegue en modo: $MODE"

# Detener contenedores existentes
print_message "Deteniendo contenedores existentes..."
docker-compose down --remove-orphans

# Limpiar imágenes antiguas (opcional)
print_message "Limpiando imágenes Docker antiguas..."
docker system prune -f

# Construir y levantar servicios
print_message "Construyendo y levantando servicios..."
if [ "$MODE" = "development" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
else
    docker-compose up --build -d
fi

# Esperar a que los servicios estén listos
print_message "Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los contenedores
print_message "Verificando estado de los contenedores..."
docker-compose ps

# Mostrar logs si hay errores
if [ $? -ne 0 ]; then
    print_error "Algunos contenedores no están funcionando correctamente."
    print_message "Mostrando logs..."
    docker-compose logs --tail=50
    exit 1
fi

print_message "¡Despliegue completado exitosamente!"
print_message "Frontend disponible en: http://localhost:8081"
print_message "Backend API disponible en: http://localhost:5002"
print_message "Configura el proxy en 1Panel para privyde.com"

print_message "Para ver los logs en tiempo real:"
print_message "docker-compose logs -f"

print_message "Para detener los servicios:"
print_message "docker-compose down" 