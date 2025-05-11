# Módulo de Reservas - Documentación

## Descripción
Este módulo permite a los usuarios realizar reservas de servicios de transporte, integrando predicciones de Google Maps para buscar direcciones y un proceso de wizard con múltiples pasos para completar la reserva.

## Estructura del Proyecto

### Backend (Flask)
- Endpoints para predicciones de Google Maps
- Sistema de sesiones de reserva temporal
- API para gestionar el proceso de reserva paso a paso

### Frontend (React)
- Formulario de reserva con autocompletado de direcciones
- Proceso de wizard con múltiples pasos
- Selección de vehículos
- (Pendiente) Detalles del pasajero
- (Pendiente) Pago
- (Pendiente) Confirmación

## Requisitos previos
- Node.js y npm
- Python 3.8+
- MongoDB
- Cuenta de Google Cloud Platform con API Maps habilitada

## Configuración

### Variables de entorno

#### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/operiq
JWT_SECRET_KEY=tu_clave_secreta_muy_segura_para_jwt
JWT_ACCESS_TOKEN_EXPIRES=3600
GOOGLE_CLIENT_ID=tu_id_de_cliente_de_google
GOOGLE_MAPS_API_KEY=tu_clave_de_api_de_google_maps
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=tu_id_de_cliente_de_google
```

## Instalación y ejecución

### Backend
```bash
# Instalar dependencias
cd backend
pip install -r requirements.txt

# Ejecutar el servidor
python app.py
```

### Frontend
```bash
# Instalar dependencias
cd frontend
npm install

# Ejecutar en desarrollo
npm run dev
```

## Flujo de la aplicación

1. El usuario rellena el formulario inicial con origen, destino, fecha y hora (o duración en caso de reserva por horas)
2. Al hacer clic en "Seleccionar" se crea una sesión de reserva en el backend
3. El usuario es redirigido al wizard de reserva con el siguiente paso: selección de vehículo
4. Después de elegir un vehículo, se avanza al siguiente paso: detalles del pasajero
5. Luego se procede al pago
6. Finalmente, se muestra la confirmación de la reserva

## Próximos pasos
- Implementar el resto de pasos del wizard (detalles del pasajero, pago, confirmación)
- Añadir validaciones adicionales
- Implementar autenticación para usuarios registrados
- Integrar pasarela de pago 