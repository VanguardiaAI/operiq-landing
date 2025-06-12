# Usar imagen base de Python optimizada para producción
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para aprovechar cache de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Crear directorio para uploads si no existe
RUN mkdir -p uploads

# Crear usuario no-root para seguridad
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Exponer puerto
EXPOSE 5000

# Variables de entorno para producción
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

# Comando para ejecutar la aplicación
CMD ["python", "app.py"] 