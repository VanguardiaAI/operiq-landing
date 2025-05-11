from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required, decode_token
import os
from datetime import timedelta
from bson import ObjectId
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import googlemaps
import json
import uuid
import datetime
import math
import stripe

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
# Configurar CORS para permitir solicitudes desde el frontend
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})
bcrypt = Bcrypt(app)

# Configuración de JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
    seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
)
jwt = JWTManager(app)

# Configuración de Google Maps
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY) if GOOGLE_MAPS_API_KEY else None

# Imprimir el ID de cliente para verificación
print("GOOGLE_CLIENT_ID loaded:", os.getenv('GOOGLE_CLIENT_ID'))

# Configuración de MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['operiq']
users_collection = db['users']
bookings_collection = db['bookings']
booking_sessions_collection = db['booking_sessions']
vehicles_collection = db['vehicles']
drivers_collection = db['drivers']
driver_vehicle_assignments_collection = db['driver_vehicle_assignments']

# Configuración de Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
stripe_webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Backend funcionando correctamente!"})

@app.route('/api/auth/register', methods=['POST'])
def register():
    # Obtener datos del request
    data = request.get_json()
    
    # Validar que se proporcionaron los campos requeridos
    if not data or not all(k in data for k in ('email', 'password')):
        return jsonify({"error": "Se requieren email y password"}), 400
    
    # Verificar si el usuario ya existe
    existing_user = users_collection.find_one({'email': data['email']})
    if existing_user:
        return jsonify({"error": "El usuario ya existe"}), 409
    
    # Hashear la contraseña
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Crear nuevo usuario
    new_user = {
        'email': data['email'],
        'password': hashed_password,
        'name': data.get('name', ''),
        'created_at': ObjectId().generation_time,
        'profile_completed': False,
        'profile': {
            'title': '',
            'first_name': '',
            'last_name': '',
            'phone': '',
            'country_code': '',
        }
    }
    
    # Guardar usuario en la base de datos
    result = users_collection.insert_one(new_user)
    
    # Generar token de acceso
    access_token = create_access_token(identity=str(result.inserted_id))
    
    return jsonify({
        "message": "Usuario registrado exitosamente",
        "access_token": access_token,
        "user": {
            "id": str(result.inserted_id),
            "email": data['email'],
            "name": data.get('name', ''),
            "profile_completed": False
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    # Obtener datos del request
    data = request.get_json()
    
    # Validar que se proporcionaron los campos requeridos
    if not data or not all(k in data for k in ('email', 'password')):
        return jsonify({"error": "Se requieren email y password"}), 400
    
    # Verificar si el usuario existe
    user = users_collection.find_one({'email': data['email']})
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    # Verificar contraseña
    if not bcrypt.check_password_hash(user['password'], data['password']):
        return jsonify({"error": "Contraseña incorrecta"}), 401
    
    # Generar token de acceso
    access_token = create_access_token(identity=str(user['_id']))
    
    return jsonify({
        "message": "Inicio de sesión exitoso",
        "access_token": access_token,
        "user": {
            "id": str(user['_id']),
            "email": user['email'],
            "name": user.get('name', ''),
            "profile_completed": user.get('profile_completed', False)
        }
    }), 200

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_user_profile():
    # Obtener identidad del token
    current_user_id = get_jwt_identity()
    
    # Buscar usuario en la base de datos
    user = users_collection.find_one({'_id': ObjectId(current_user_id)})
    
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    # Retornar datos del usuario (sin contraseña)
    user_data = {
        "id": str(user['_id']),
        "email": user['email'],
        "name": user.get('name', ''),
        "profile_completed": user.get('profile_completed', False),
        "profile": user.get('profile', {})
    }
    
    return jsonify({"user": user_data}), 200

@app.route('/api/auth/google', methods=['POST'])
def google_login():
    data = request.get_json()
    credential = data.get('credential')
    if not credential:
        return jsonify({'error': 'Falta el token de Google'}), 400

    try:
        print("Recibido token de Google, intentando validar...")
        
        # Validar el token de Google
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            os.getenv('GOOGLE_CLIENT_ID')
        )
        
        print("Token validado. Info:", idinfo)
        
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        # Buscar usuario por email
        user = users_collection.find_one({'email': email})
        if not user:
            print(f"Creando nuevo usuario con email: {email}")
            # Crear usuario si no existe
            new_user = {
                'email': email,
                'name': name,
                'password': '',  # No hay contraseña para Google
                'created_at': ObjectId().generation_time,
                'profile_completed': False,
                'profile': {
                    'title': '',
                    'first_name': '',
                    'last_name': '',
                    'phone': '',
                    'country_code': '',
                }
            }
            result = users_collection.insert_one(new_user)
            user_id = result.inserted_id
            user = new_user
            user['_id'] = user_id
        else:
            print(f"Usuario encontrado con email: {email}")
            user_id = user['_id']

        # Generar token de acceso
        access_token = create_access_token(identity=str(user_id))

        return jsonify({
            'message': 'Inicio de sesión con Google exitoso',
            'access_token': access_token,
            'user': {
                'id': str(user_id),
                'email': user['email'],
                'name': user.get('name', ''),
                'profile_completed': user.get('profile_completed', False)
            }
        }), 200
    except ValueError as e:
        print(f"Error al validar token: {str(e)}")
        return jsonify({'error': 'Token de Google inválido', 'details': str(e)}), 401
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return jsonify({'error': 'Error al procesar la solicitud', 'details': str(e)}), 500

@app.route('/api/profile/complete', methods=['POST'])
@jwt_required()
def complete_profile():
    # Obtener identidad del token
    current_user_id = get_jwt_identity()
    
    # Obtener datos del request
    data = request.get_json()
    
    # Validar que se proporcionaron los campos requeridos
    if not data or not all(k in data for k in ('title', 'first_name', 'last_name', 'phone', 'country_code')):
        return jsonify({"error": "Se requieren todos los campos del perfil"}), 400
    
    # Actualizar perfil del usuario
    profile_data = {
        'title': data['title'],
        'first_name': data['first_name'],
        'last_name': data['last_name'],
        'phone': data['phone'],
        'country_code': data['country_code'],
    }
    
    # Actualizar en la base de datos
    result = users_collection.update_one(
        {'_id': ObjectId(current_user_id)},
        {'$set': {
            'profile': profile_data,
            'profile_completed': True,
            'name': f"{data['first_name']} {data['last_name']}"
        }}
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "No se pudo actualizar el perfil"}), 400
    
    # Obtener usuario actualizado
    user = users_collection.find_one({'_id': ObjectId(current_user_id)})
    
    return jsonify({
        "message": "Perfil completado exitosamente",
        "user": {
            "id": str(user['_id']),
            "email": user['email'],
            "name": user['name'],
            "profile_completed": True,
            "profile": user['profile']
        }
    }), 200

@app.route('/api/profile/check', methods=['GET'])
@jwt_required()
def check_profile_status():
    # Obtener identidad del token
    current_user_id = get_jwt_identity()
    
    # Buscar usuario en la base de datos
    user = users_collection.find_one({'_id': ObjectId(current_user_id)})
    
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    # Retornar estado del perfil
    return jsonify({
        "profile_completed": user.get('profile_completed', False)
    }), 200

@app.route('/api/profile/update', methods=['POST'])
@jwt_required()
def update_profile():
    # Obtener identidad del token
    current_user_id = get_jwt_identity()
    
    # Obtener datos del request
    data = request.get_json()
    
    # Validar que se proporcionaron datos para actualizar
    if not data:
        return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400
    
    # Buscar usuario en la base de datos
    user = users_collection.find_one({'_id': ObjectId(current_user_id)})
    
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    # Campos actualizables
    allowed_fields = [
        'title', 'first_name', 'last_name', 'phone', 'country_code', 
        'company', 'address'
    ]
    
    # Crear objeto de actualización con solo los campos permitidos
    profile_update = {}
    for field in allowed_fields:
        if field in data:
            profile_update[f'profile.{field}'] = data[field]
    
    # Si hay campos de nombre y apellido, actualizar también el nombre
    if 'first_name' in data or 'last_name' in data:
        first_name = data.get('first_name', user.get('profile', {}).get('first_name', ''))
        last_name = data.get('last_name', user.get('profile', {}).get('last_name', ''))
        profile_update['name'] = f"{first_name} {last_name}".strip()
    
    # Actualizar en la base de datos
    if profile_update:
        result = users_collection.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': profile_update}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "No se pudo actualizar el perfil"}), 400
    
    # Obtener usuario actualizado
    updated_user = users_collection.find_one({'_id': ObjectId(current_user_id)})
    
    # Retornar datos del usuario actualizados
    user_data = {
        "id": str(updated_user['_id']),
        "email": updated_user['email'],
        "name": updated_user.get('name', ''),
        "profile_completed": updated_user.get('profile_completed', False),
        "profile": updated_user.get('profile', {})
    }
    
    return jsonify({
        "message": "Perfil actualizado exitosamente",
        "user": user_data
    }), 200

# === ENDPOINTS PARA RESERVAS ===

@app.route('/api/places/autocomplete', methods=['GET'])
def places_autocomplete():
    """Endpoint para obtener predicciones de direcciones de Google Maps"""
    if not gmaps:
        return jsonify({"error": "Google Maps API no está configurada"}), 500
    
    query = request.args.get('query', '')
    if not query:
        return jsonify({"error": "Se requiere un término de búsqueda"}), 400
    
    try:
        # Obtener predicciones de lugares con la API de Google Maps
        predictions = gmaps.places_autocomplete(
            input_text=query,
            language='es'  # Configurado para español
        )
        
        # Formatear las predicciones para el frontend
        formatted_predictions = []
        for prediction in predictions:
            formatted_predictions.append({
                'place_id': prediction['place_id'],
                'description': prediction['description'],
                'structured_formatting': prediction.get('structured_formatting', {})
            })
        
        return jsonify(formatted_predictions), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/places/details', methods=['GET'])
def place_details():
    """Endpoint para obtener detalles de un lugar de Google Maps por place_id"""
    if not gmaps:
        return jsonify({"error": "Google Maps API no está configurada"}), 500
    
    place_id = request.args.get('place_id', '')
    if not place_id:
        return jsonify({"error": "Se requiere un place_id"}), 400
    
    try:
        # Obtener detalles del lugar
        place = gmaps.place(
            place_id=place_id,
            language='es',
            fields=['name', 'formatted_address', 'geometry']
        )
        
        return jsonify(place), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/booking/create-session', methods=['POST'])
def create_booking_session():
    """Crea una sesión de reserva temporal para el proceso de wizard"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    
    # Validar los datos mínimos requeridos según el tipo de viaje
    trip_type = data.get('tripType', 'ida')
    
    if trip_type == 'ida':
        if not all(k in data for k in ('from', 'to', 'date', 'time')):
            return jsonify({"error": "Se requieren origen, destino, fecha y hora"}), 400
    elif trip_type == 'horas':
        if not all(k in data for k in ('from', 'duration', 'date', 'time')):
            return jsonify({"error": "Se requieren origen, duración, fecha y hora"}), 400
    
    # Crear un ID único para la sesión
    session_id = str(uuid.uuid4())
    
    # Agregar datos adicionales a la sesión
    session_data = {
        'session_id': session_id,
        'created_at': datetime.datetime.utcnow(),
        'expires_at': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        'user_id': None,  # Puede ser anónimo o asociarse a un usuario más tarde
        'booking_data': data,
        'current_step': 'vehicle_selection',
        'completed': False
    }
    
    # Guardar la sesión en la base de datos
    booking_sessions_collection.insert_one(session_data)
    
    return jsonify({
        "message": "Sesión de reserva creada",
        "session_id": session_id,
        "next_step": "vehicle_selection"
    }), 201

@app.route('/api/booking/update-session/<session_id>', methods=['PUT'])
def update_booking_session(session_id):
    """Actualiza una sesión de reserva existente durante el proceso de wizard"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    
    # Verificar si la sesión existe
    session = booking_sessions_collection.find_one({'session_id': session_id})
    if not session:
        return jsonify({"error": "Sesión no encontrada"}), 404
    
    # Actualizar los datos de la sesión
    current_step = data.get('current_step', session.get('current_step'))
    
    # Crear el diccionario base para la actualización
    update_fields = {
        'current_step': current_step,
        'updated_at': datetime.datetime.utcnow()
    }

    # Fusionar booking_data
    existing_booking_data = session.get('booking_data', {})
    if not isinstance(existing_booking_data, dict):
        existing_booking_data = {} 
        
    new_booking_data = data.get('booking_data', {})
    if isinstance(new_booking_data, dict):
        update_fields['booking_data'] = {**existing_booking_data, **new_booking_data}
    else:
        # Si new_booking_data no es un dict, se mantienen los datos existentes sin cambios.
        # Podrías añadir un log aquí si es un caso inesperado.
        update_fields['booking_data'] = existing_booking_data

    # Si es el último paso, marcar como completado
    if current_step == 'payment_confirmation':
        update_fields['completed'] = True
    
    # Actualizar la sesión en la base de datos
    result = booking_sessions_collection.update_one(
        {'session_id': session_id},
        {'$set': update_fields}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Sesión no encontrada durante la actualización final"}), 404

    # Después de actualizar, obtener la sesión completa para devolverla
    updated_session = booking_sessions_collection.find_one({'session_id': session_id})
    if not updated_session:
        return jsonify({"error": "Error al recuperar la sesión después de actualizar"}), 500

    # Formatear la sesión para la respuesta JSON
    # Asegurarse de que _id es un string
    if '_id' in updated_session:
        updated_session['_id'] = str(updated_session['_id'])
    
    # Formatear campos de fecha a ISO string si son objetos datetime
    for date_field in ['created_at', 'expires_at', 'updated_at']:
        if date_field in updated_session and isinstance(updated_session[date_field], datetime.datetime):
            updated_session[date_field] = updated_session[date_field].isoformat()
    
    # Determinar el siguiente paso (opcional, pero útil para el frontend)
    next_step = None
    steps = ['vehicle_selection', 'passenger_details', 'payment', 'payment_confirmation']
    current_step_value = updated_session.get('current_step')
    if current_step_value in steps:
        current_index = steps.index(current_step_value)
        if current_index < len(steps) - 1:
            next_step = steps[current_index + 1]
    updated_session['next_step'] = next_step
    
    return jsonify(updated_session), 200

@app.route('/api/booking/get-session/<session_id>', methods=['GET'])
def get_booking_session(session_id):
    """Obtiene los datos de una sesión de reserva"""
    # Verificar si la sesión existe
    session = booking_sessions_collection.find_one({'session_id': session_id})
    if not session:
        return jsonify({"error": "Sesión no encontrada"}), 404
    
    # Convertir ObjectId a string para serialización JSON
    session['_id'] = str(session['_id'])
    
    # Formatear fechas para serialización JSON
    session['created_at'] = session['created_at'].isoformat()
    session['expires_at'] = session['expires_at'].isoformat()
    if 'updated_at' in session:
        session['updated_at'] = session['updated_at'].isoformat()
    
    return jsonify(session), 200

@app.route('/api/booking/vehicle-options', methods=['GET'])
def get_vehicle_options():
    """Devuelve las opciones de vehículos disponibles para la reserva basado en ubicación"""
    # Obtener parámetros de búsqueda
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    session_id = request.args.get('session_id')
    
    # Si no se proporciona ubicación pero sí un session_id, intentar obtener la ubicación de la sesión
    if (not lat or not lng) and session_id:
        session = booking_sessions_collection.find_one({'session_id': session_id})
        if session and 'booking_data' in session:
            # Obtener detalles del lugar de origen si existe
            origin_place_id = session['booking_data'].get('from', {}).get('place_id')
            if origin_place_id and gmaps:
                try:
                    # Obtener coordenadas del lugar de origen mediante Google Maps API
                    place_details = gmaps.place(
                        place_id=origin_place_id,
                        fields=['geometry']
                    )
                    
                    location = place_details['result']['geometry']['location']
                    lat = location['lat']
                    lng = location['lng']
                except Exception as e:
                    print(f"Error al obtener detalles del lugar: {e}")
    
    # Si no se pudo obtener ubicación, usar valores predeterminados para la capital
    if not lat or not lng:
        print("Usando ubicación predeterminada para vehículos (sin coordenadas proporcionadas)")
        # Coordenadas predeterminadas de Madrid (o la ciudad principal de tu servicio)
        lat = 40.4168
        lng = -3.7038
    
    try:
        # Convertir a números flotantes
        lat = float(lat)
        lng = float(lng)
        
        # Buscar vehículos disponibles cerca de la ubicación
        try:
            pipeline = [
                {
                    "$geoNear": {
                        "near": {"type": "Point", "coordinates": [lng, lat]},
                        "distanceField": "distance",
                        "spherical": True,
                        "distanceMultiplier": 0.001  # Convertir a kilómetros
                    }
                },
                {
                    "$match": {
                        "available": True
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "id": {"$toString": "$_id"},
                        "type": 1,
                        "category": 1,
                        "name": 1,
                        "description": 1,
                        "details": 1,
                        "capacity": 1,
                        "pricing": 1,
                        "image": 1,
                        "distance": 1,
                        "available": 1
                    }
                },
                {
                    "$match": {
                        "distance": {"$lte": "$availability_radius"}  # Usar el radio de disponibilidad definido para cada vehículo
                    }
                },
                {
                    "$sort": {"distance": 1}  # Ordenar por distancia
                }
            ]
            
            available_vehicles = list(vehicles_collection.aggregate(pipeline))
            
        except Exception as e:
            print(f"Error en consulta geoNear: {e}")
            # Método alternativo (menos eficiente)
            available_vehicles = []
            all_vehicles = list(vehicles_collection.find({"available": True}))
            
            for vehicle in all_vehicles:
                vehicle_location = vehicle.get("location", {}).get("coordinates", [0, 0])
                vehicle_radius = vehicle.get("availability_radius", 0)
                
                # Calcular distancia aproximada (simplificado para pruebas)
                distance_lat = abs(lat - vehicle_location[1]) * 111  # 1 grado ≈ 111 km
                distance_lng = abs(lng - vehicle_location[0]) * 111 * abs(math.cos(math.radians(lat)))
                distance = math.sqrt(distance_lat**2 + distance_lng**2)
                
                if distance <= vehicle_radius:
                    vehicle["distance"] = distance
                    vehicle["id"] = str(vehicle["_id"])
                    del vehicle["_id"]
                    available_vehicles.append(vehicle)
            
            # Ordenar por distancia
            available_vehicles.sort(key=lambda x: x.get("distance", float('inf')))
        
        # Si no hay vehículos disponibles, devolver los vehículos básicos como respaldo
        if not available_vehicles:
            print("Sin vehículos disponibles según la ubicación, devolviendo vehículos predeterminados")
            all_vehicles = list(vehicles_collection.find({"available": True}, {
                "_id": 1,
                "type": 1,
                "category": 1,
                "name": 1,
                "description": 1,
                "details": 1,
                "capacity": 1,
                "pricing": 1,
                "image": 1,
                "available": 1
            }).limit(5))
            
            available_vehicles = []
            for vehicle in all_vehicles:
                vehicle["id"] = str(vehicle["_id"])
                del vehicle["_id"]
                vehicle["distance"] = 0  # No hay distancia real calculada
                available_vehicles.append(vehicle)
        
        # Adaptar el formato de los vehículos para el frontend
        formatted_vehicles = []
        for vehicle in available_vehicles:
            # Extraer precio base del objeto pricing anidado
            # price = vehicle.get("pricing", {}).get("base_fare", 0) # Línea original
            
            # Lógica para el precio simulado
            simulated_price = 75  # Precio simulado predeterminado
            vehicle_type = vehicle.get("type", "").lower()
            
            if vehicle_type == "sedan":
                simulated_price = 100
            elif vehicle_type == "suv":
                simulated_price = 150
            elif vehicle_type == "limousine":
                simulated_price = 250
            elif vehicle_type == "helicopter":
                simulated_price = 1000
            elif vehicle_type == "jet":
                simulated_price = 5000
            
            # Extraer capacidad de pasajeros y equipaje del objeto capacity anidado
            passengers = vehicle.get("capacity", {}).get("passengers", 0)
            luggage = vehicle.get("capacity", {}).get("luggage", 0)
            
            # Crear objeto con formato esperado por el frontend
            formatted_vehicle = {
                "id": vehicle.get("id"),
                "name": vehicle.get("name"),
                "description": vehicle.get("description"),
                "price": simulated_price,  # Usar el precio simulado
                "capacity": passengers,  # Campo directo de capacidad de pasajeros
                "luggage": luggage,  # Campo directo de capacidad de equipaje
                "image": vehicle.get("image"),
                "type": vehicle.get("type"),
                "category": vehicle.get("category"),
                "distance": vehicle.get("distance", 0)
            }
            
            formatted_vehicles.append(formatted_vehicle)
        
        return jsonify(formatted_vehicles), 200
    
    except ValueError as e:
        return jsonify({"error": f"Error de formato en lat/lng: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

@app.route('/api/vehicles/details/<vehicle_id>', methods=['GET'])
def get_vehicle_details(vehicle_id):
    """Obtiene los detalles completos de un vehículo por su ID"""
    try:
        # Convertir string ID a ObjectId
        vehicle = vehicles_collection.find_one({"_id": ObjectId(vehicle_id)})
        
        if not vehicle:
            return jsonify({"error": "Vehículo no encontrado"}), 404
        
        # Formatear el vehículo para la respuesta JSON
        vehicle["id"] = str(vehicle["_id"])
        del vehicle["_id"]
        
        return jsonify(vehicle), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al obtener detalles del vehículo: {str(e)}"}), 500

@app.route('/api/vehicles/check-availability', methods=['POST'])
def check_vehicle_availability():
    """Verifica la disponibilidad de un vehículo en fecha y hora específicas"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    
    # Verificar campos requeridos
    required_fields = ['vehicle_id', 'date', 'time']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Faltan campos requeridos (vehicle_id, date, time)"}), 400
    
    try:
        # Convertir string ID a ObjectId
        vehicle_id = data['vehicle_id']
        date = data['date']
        time = data['time']
        
        # Aquí se verificaría la disponibilidad real consultando reservas existentes
        # Por ahora, simulamos una verificación de disponibilidad
        
        # Verificar si el vehículo existe
        vehicle = vehicles_collection.find_one({"_id": ObjectId(vehicle_id)})
        if not vehicle:
            return jsonify({"available": False, "reason": "Vehículo no encontrado"}), 404
        
        # Verificar si el vehículo está disponible en general
        if not vehicle.get("available", False):
            return jsonify({"available": False, "reason": "Vehículo no disponible"}), 200
        
        # Verificar si hay alguna reserva para ese vehículo en esa fecha y hora
        # En un sistema real, esto consultaría la colección de reservas
        # Para este ejemplo, asumimos que está disponible si el vehículo existe
        
        # Verificar días festivos o fechas especiales (simulado)
        special_dates = ["31/12/2024", "01/01/2025", "25/12/2024"]
        if date in special_dates:
            return jsonify({
                "available": True,
                "warning": "Fecha de alta demanda. Se aplicará una tarifa especial.",
                "surge_multiplier": 1.5  # Factor de multiplicación por alta demanda
            }), 200
        
        # Si llegamos aquí, el vehículo está disponible
        return jsonify({"available": True}), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al verificar disponibilidad: {str(e)}"}), 500

@app.route('/api/drivers/available', methods=['GET'])
def get_available_drivers():
    """Obtiene los choferes disponibles según el tipo de vehículo y ubicación"""
    # Obtener parámetros de búsqueda
    vehicle_type = request.args.get('vehicle_type')
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    
    # Verificar parámetros
    if not vehicle_type:
        return jsonify({"error": "Se requiere el tipo de vehículo"}), 400
    
    try:
        # Consulta base para choferes disponibles y activos
        query = {
            "available": True,
            "active": True
        }
        
        # Filtrar por tipo de vehículo que pueden conducir
        query["vehicle_types"] = vehicle_type
        
        # Si se proporciona ubicación, buscar por proximidad
        if lat and lng:
            try:
                lat = float(lat)
                lng = float(lng)
                
                # Limitar a 50km de radio
                max_distance = 50000  # 50km en metros
                
                # Usar una consulta geoespacial
                drivers = list(drivers_collection.find(
                    {
                        **query,
                        "location": {
                            "$near": {
                                "$geometry": {
                                    "type": "Point",
                                    "coordinates": [lng, lat]
                                },
                                "$maxDistance": max_distance
                            }
                        }
                    },
                    {
                        "_id": 1,
                        "first_name": 1,
                        "last_name": 1,
                        "profile_image": 1,
                        "languages": 1,
                        "ratings": 1,
                        "specialties": 1,
                        "years_experience": 1
                    }
                ).limit(10))  # Limitar resultados
            except Exception as e:
                print(f"Error en consulta geoespacial: {e}")
                # Fallback a consulta normal si la geoespacial falla
                drivers = list(drivers_collection.find(
                    query,
                    {
                        "_id": 1,
                        "first_name": 1,
                        "last_name": 1,
                        "profile_image": 1,
                        "languages": 1,
                        "ratings": 1,
                        "specialties": 1,
                        "years_experience": 1
                    }
                ).limit(10))
        else:
            # Sin ubicación, simplemente buscar por tipo de vehículo
            drivers = list(drivers_collection.find(
                query,
                {
                    "_id": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "profile_image": 1,
                    "languages": 1,
                    "ratings": 1,
                    "specialties": 1,
                    "years_experience": 1
                }
            ).limit(10))
        
        # Formatear resultados para JSON
        formatted_drivers = []
        for driver in drivers:
            driver['id'] = str(driver['_id'])
            del driver['_id']
            formatted_drivers.append(driver)
        
        return jsonify(formatted_drivers), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al buscar choferes disponibles: {str(e)}"}), 500

@app.route('/api/vehicles/<vehicle_id>/drivers', methods=['GET'])
def get_vehicle_drivers(vehicle_id):
    """Obtiene los conductores asignados a un vehículo específico"""
    try:
        # Verificar si el vehículo existe
        vehicle = vehicles_collection.find_one({"_id": ObjectId(vehicle_id)})
        if not vehicle:
            return jsonify({"error": "Vehículo no encontrado"}), 404
        
        # Buscar todas las asignaciones para este vehículo
        assignments = list(driver_vehicle_assignments_collection.find(
            {"vehicle_id": vehicle_id, "status": "active"}
        ))
        
        if not assignments:
            return jsonify([]), 200
        
        # Obtener IDs de los conductores asignados
        driver_ids = [assignment["driver_id"] for assignment in assignments]
        
        # Convertir a ObjectIds para la consulta
        object_ids = [ObjectId(driver_id) for driver_id in driver_ids]
        
        # Buscar los conductores por sus IDs
        drivers = list(drivers_collection.find(
            {"_id": {"$in": object_ids}},
            {
                "_id": 1,
                "first_name": 1,
                "last_name": 1,
                "profile_image": 1,
                "languages": 1,
                "ratings": 1,
                "specialties": 1,
                "years_experience": 1
            }
        ))
        
        # Formatear resultados para JSON
        formatted_drivers = []
        for driver in drivers:
            # Buscar si es conductor primario
            assignment = next((a for a in assignments if a["driver_id"] == str(driver["_id"])), None)
            is_primary = assignment.get("primary_driver", False) if assignment else False
            
            driver_info = {
                "id": str(driver["_id"]),
                "first_name": driver["first_name"],
                "last_name": driver["last_name"],
                "profile_image": driver.get("profile_image", ""),
                "languages": driver.get("languages", []),
                "ratings": driver.get("ratings", {}),
                "specialties": driver.get("specialties", []),
                "years_experience": driver.get("years_experience", 0),
                "is_primary_driver": is_primary,
                "schedule": assignment.get("schedule", {}) if assignment else {}
            }
            
            formatted_drivers.append(driver_info)
        
        # Ordenar: primero los conductores primarios
        formatted_drivers.sort(key=lambda x: (not x["is_primary_driver"], -x.get("years_experience", 0)))
        
        return jsonify(formatted_drivers), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al obtener conductores del vehículo: {str(e)}"}), 500

@app.route('/api/drivers/<driver_id>/vehicles', methods=['GET'])
def get_driver_vehicles(driver_id):
    """Obtiene los vehículos asignados a un conductor específico"""
    try:
        # Verificar si el conductor existe
        driver = drivers_collection.find_one({"_id": ObjectId(driver_id)})
        if not driver:
            return jsonify({"error": "Conductor no encontrado"}), 404
        
        # Buscar todas las asignaciones para este conductor
        assignments = list(driver_vehicle_assignments_collection.find(
            {"driver_id": driver_id, "status": "active"}
        ))
        
        if not assignments:
            return jsonify([]), 200
        
        # Obtener IDs de los vehículos asignados
        vehicle_ids = [assignment["vehicle_id"] for assignment in assignments]
        
        # Convertir a ObjectIds para la consulta
        object_ids = [ObjectId(vehicle_id) for vehicle_id in vehicle_ids]
        
        # Buscar los vehículos por sus IDs
        vehicles = list(vehicles_collection.find(
            {"_id": {"$in": object_ids}}
        ))
        
        # Formatear resultados para JSON
        formatted_vehicles = []
        for vehicle in vehicles:
            # Buscar detalles de la asignación
            assignment = next((a for a in assignments if a["vehicle_id"] == str(vehicle["_id"])), None)
            is_primary = assignment.get("primary_driver", False) if assignment else False
            
            # Formatear vehículo
            vehicle_info = {
                "id": str(vehicle["_id"]),
                "name": vehicle["name"],
                "type": vehicle["type"],
                "category": vehicle["category"],
                "description": vehicle["description"],
                "image": vehicle.get("image", ""),
                "details": vehicle.get("details", {}),
                "capacity": vehicle.get("capacity", {}),
                "pricing": vehicle.get("pricing", {}),
                "is_primary_assignment": is_primary,
                "schedule": assignment.get("schedule", {}) if assignment else {}
            }
            
            formatted_vehicles.append(vehicle_info)
        
        # Ordenar: primero las asignaciones primarias
        formatted_vehicles.sort(key=lambda x: (not x["is_primary_assignment"]))
        
        return jsonify(formatted_vehicles), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al obtener vehículos del conductor: {str(e)}"}), 500

@app.route('/api/assignments', methods=['POST'])
def create_assignment():
    """Crea una nueva asignación entre conductor y vehículo"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    
    # Verificar campos requeridos
    required_fields = ['driver_id', 'vehicle_id']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Se requieren driver_id y vehicle_id"}), 400
    
    try:
        driver_id = data['driver_id']
        vehicle_id = data['vehicle_id']
        
        # Verificar si el conductor existe
        driver = drivers_collection.find_one({"_id": ObjectId(driver_id)})
        if not driver:
            return jsonify({"error": "Conductor no encontrado"}), 404
        
        # Verificar si el vehículo existe
        vehicle = vehicles_collection.find_one({"_id": ObjectId(vehicle_id)})
        if not vehicle:
            return jsonify({"error": "Vehículo no encontrado"}), 404
        
        # Verificar si el tipo de vehículo coincide con las habilidades del conductor
        if vehicle["type"] not in driver.get("vehicle_types", []):
            return jsonify({"error": f"El conductor no está calificado para manejar vehículos tipo '{vehicle['type']}'"}, 400)
        
        # Verificar si ya existe la asignación
        existing = driver_vehicle_assignments_collection.find_one({
            "driver_id": driver_id,
            "vehicle_id": vehicle_id
        })
        
        if existing:
            # Si existe pero está inactiva, actualizarla
            if existing.get("status") != "active":
                driver_vehicle_assignments_collection.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {
                        "status": "active",
                        "updated_at": datetime.datetime.utcnow(),
                        "schedule": data.get("schedule", {
                            "days": ["lunes", "martes", "miércoles", "jueves", "viernes"],
                            "hours": "08:00-20:00"
                        }),
                        "primary_driver": data.get("primary_driver", False)
                    }}
                )
                return jsonify({"message": "Asignación reactivada correctamente"}), 200
            else:
                return jsonify({"error": "Esta asignación ya existe"}), 409
        
        # Crear nueva asignación
        new_assignment = {
            "driver_id": driver_id,
            "vehicle_id": vehicle_id,
            "status": "active",
            "assigned_at": datetime.datetime.utcnow(),
            "schedule": data.get("schedule", {
                "days": ["lunes", "martes", "miércoles", "jueves", "viernes"],
                "hours": "08:00-20:00"
            }),
            "primary_driver": data.get("primary_driver", False)
        }
        
        # Si se marca como conductor primario, asegurarse de que no haya otro primario
        if new_assignment["primary_driver"]:
            driver_vehicle_assignments_collection.update_many(
                {"vehicle_id": vehicle_id, "primary_driver": True},
                {"$set": {"primary_driver": False}}
            )
        
        result = driver_vehicle_assignments_collection.insert_one(new_assignment)
        
        return jsonify({
            "message": "Asignación creada correctamente",
            "assignment_id": str(result.inserted_id)
        }), 201
    
    except Exception as e:
        return jsonify({"error": f"Error al crear asignación: {str(e)}"}), 500

@app.route('/api/assignments/deactivate', methods=['POST'])
def deactivate_assignment():
    """Desactiva una asignación entre conductor y vehículo"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    
    # Verificar campos requeridos
    required_fields = ['driver_id', 'vehicle_id']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Se requieren driver_id y vehicle_id"}), 400
    
    try:
        driver_id = data['driver_id']
        vehicle_id = data['vehicle_id']
        
        # Verificar si existe la asignación
        existing = driver_vehicle_assignments_collection.find_one({
            "driver_id": driver_id,
            "vehicle_id": vehicle_id
        })
        
        if not existing:
            return jsonify({"error": "No se encontró la asignación especificada"}), 404
        
        # Desactivar la asignación
        driver_vehicle_assignments_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "status": "inactive",
                "updated_at": datetime.datetime.utcnow(),
                "deactivation_reason": data.get("reason", "No especificado")
            }}
        )
        
        # Si era conductor primario, buscar otro conductor activo para hacerlo primario
        if existing.get("primary_driver", False):
            # Buscar otra asignación activa para este vehículo
            another_assignment = driver_vehicle_assignments_collection.find_one({
                "vehicle_id": vehicle_id,
                "status": "active",
                "_id": {"$ne": existing["_id"]}
            })
            
            if another_assignment:
                driver_vehicle_assignments_collection.update_one(
                    {"_id": another_assignment["_id"]},
                    {"$set": {"primary_driver": True}}
                )
        
        return jsonify({"message": "Asignación desactivada correctamente"}), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al desactivar asignación: {str(e)}"}), 500

@app.route('/api/booking/confirm', methods=['POST'])
def confirm_booking():
    """Confirma una reserva a partir de una sesión completada en el wizard"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    
    # Verificar que se proporcionó el ID de sesión
    if 'session_id' not in data:
        return jsonify({"error": "Se requiere el ID de sesión"}), 400
    
    session_id = data['session_id']
    
    try:
        # Buscar la sesión en la base de datos
        session = booking_sessions_collection.find_one({'session_id': session_id})
        if not session:
            return jsonify({"error": "Sesión no encontrada"}), 404
        
        # Verificar que la sesión esté en el paso final (payment_confirmation)
        if session.get('current_step') != 'payment_confirmation':
            return jsonify({
                "error": "La sesión no está lista para confirmar",
                "current_step": session.get('current_step')
            }), 400
        
        # Verificar que la sesión no esté ya completada y convertida en reserva
        if session.get('completed') and session.get('booking_id'):
            return jsonify({
                "error": "Esta sesión ya ha sido convertida en reserva",
                "booking_id": session.get('booking_id')
            }), 409
        
        # Extraer la información necesaria de la sesión
        booking_data = session.get('booking_data', {})
        
        # Verificar datos mínimos necesarios
        if not booking_data.get('from') or not booking_data.get('date') or not booking_data.get('time'):
            return jsonify({"error": "Faltan datos requeridos en la sesión"}), 400
        
        # Si es viaje de ida, verificar destino
        if booking_data.get('tripType') == 'ida' and not booking_data.get('to'):
            return jsonify({"error": "Falta destino para viaje de ida"}), 400
        
        # Si es por horas, verificar duración
        if booking_data.get('tripType') == 'horas' and not booking_data.get('duration'):
            return jsonify({"error": "Falta duración para reserva por horas"}), 400
        
        # Verificar que se haya seleccionado un vehículo
        if not booking_data.get('vehicle'):
            return jsonify({"error": "No se ha seleccionado un vehículo"}), 400
        
        # Verificar datos de pago
        if not booking_data.get('payment'):
            return jsonify({"error": "No se han proporcionado datos de pago"}), 400
        
        # Verificar que haya información de pago de Stripe
        stripe_payment_intent_id = data.get('stripe_payment_intent_id') or booking_data.get('payment', {}).get('stripe_payment_intent_id')
        if not stripe_payment_intent_id:
            return jsonify({"error": "No se ha proporcionado la información de pago de Stripe"}), 400
        
        # Obtener usuario si está autenticado
        user_id = None
        jwt_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if jwt_token:
            try:
                # Decodificar el token JWT
                decoded_token = jwt.decode(
                    jwt_token, 
                    app.config['JWT_SECRET_KEY'], 
                    algorithms=['HS256']
                )
                user_id = decoded_token.get('sub')  # 'sub' es el claim que contiene el ID de usuario
            except:
                # Si hay error al decodificar, continuamos sin asociar a un usuario
                pass
        
        # Asociar el usuario a la reserva si está disponible, o usar el de la sesión
        user_id = user_id or session.get('user_id')
        
        # Calcular fecha/hora de recogida
        pickup_date_str = f"{booking_data.get('date')} {booking_data.get('time')}"
        try:
            pickup_datetime = datetime.datetime.strptime(pickup_date_str, "%a, %d %b %Y %H : %M")
        except:
            # Si no se puede parsear, usar la fecha actual + 1 día
            pickup_datetime = datetime.datetime.utcnow() + datetime.timedelta(days=1)
        
        # Buscar vehículo para obtener detalles
        vehicle = None
        if booking_data.get('vehicle', {}).get('id'):
            try:
                vehicle_id = booking_data['vehicle']['id']
                vehicle = vehicles_collection.find_one({"_id": ObjectId(vehicle_id)})
            except:
                # Si no se encuentra, continuamos sin detalles adicionales
                pass
        
        # Encontrar conductor disponible para el vehículo
        assigned_driver = None
        if vehicle:
            try:
                # Buscar asignaciones activas para este vehículo
                assignments = list(driver_vehicle_assignments_collection.find({
                    "vehicle_id": booking_data['vehicle']['id'],
                    "status": "active"
                }))
                
                if assignments:
                    # Priorizar conductor primario
                    primary_assignment = next((a for a in assignments if a.get("primary_driver", False)), None)
                    
                    if primary_assignment:
                        driver_id = primary_assignment["driver_id"]
                        driver = drivers_collection.find_one({"_id": ObjectId(driver_id)})
                        
                        if driver:
                            assigned_driver = {
                                "id": str(driver["_id"]),
                                "first_name": driver["first_name"],
                                "last_name": driver["last_name"],
                                "phone": driver.get("phone", ""),
                                "languages": driver.get("languages", []),
                                "rating": driver.get("ratings", {}).get("average", 0)
                            }
                    elif assignments:
                        # Si no hay primario, tomar el primero disponible
                        driver_id = assignments[0]["driver_id"]
                        driver = drivers_collection.find_one({"_id": ObjectId(driver_id)})
                        
                        if driver:
                            assigned_driver = {
                                "id": str(driver["_id"]),
                                "first_name": driver["first_name"],
                                "last_name": driver["last_name"],
                                "phone": driver.get("phone", ""),
                                "languages": driver.get("languages", []),
                                "rating": driver.get("ratings", {}).get("average", 0)
                            }
            except Exception as e:
                print(f"Error al buscar conductor: {e}")
        
        # Verificar el estado del pago de Stripe
        try:
            payment_intent = stripe.PaymentIntent.retrieve(stripe_payment_intent_id)
            payment_status = payment_intent.status
            
            # Solo confirmar la reserva si el pago está completo o procesando
            payment_confirmed = payment_status in ['succeeded', 'processing']
            
            # Si el pago no está en un estado válido, devolver error
            if not payment_confirmed:
                return jsonify({
                    "error": f"El pago no se ha completado correctamente. Estado actual: {payment_status}",
                    "payment_status": payment_status
                }), 400
            
        except stripe.error.StripeError as e:
            return jsonify({"error": f"Error al verificar el pago con Stripe: {str(e)}"}), 400
        
        # Crear estructura para la reserva confirmada
        new_booking = {
            "booking_id": str(uuid.uuid4()),  # ID único para la reserva
            "user_id": user_id,
            "session_id": session_id,
            "status": "pending",
            "trip_type": booking_data.get('tripType', 'ida'),
            "pickup": {
                "location": booking_data.get('from', {}),
                "datetime": pickup_datetime,
                "instructions": booking_data.get('passenger_details', {}).get('pickup_sign', '')
            },
            "dropoff": booking_data.get('to', {}),
            "duration": booking_data.get('duration'),
            "vehicle": {
                "id": booking_data.get('vehicle', {}).get('id'),
                "name": booking_data.get('vehicle', {}).get('name'),
                "category": vehicle.get('category') if vehicle else None,
                "type": vehicle.get('type') if vehicle else None,
                "image": vehicle.get('image') if vehicle else None
            },
            "driver": assigned_driver,
            "passenger": {
                "booking_for": booking_data.get('passenger_details', {}).get('booking_for', 'self'),
                "flight_number": booking_data.get('passenger_details', {}).get('flight_number'),
                "notes": booking_data.get('passenger_details', {}).get('notes'),
                "reference": booking_data.get('passenger_details', {}).get('reference')
            },
            "payment": {
                "method": booking_data.get('payment', {}).get('method', 'card'),
                "amount": booking_data.get('payment', {}).get('amount', 0),
                "currency": booking_data.get('payment', {}).get('currency', 'EUR'),
                "status": payment_status,
                "stripe_payment_id": stripe_payment_intent_id,
                "card_last_four": booking_data.get('payment', {}).get('card_last_four')
            },
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }
        
        # Insertar la reserva en la base de datos
        result = bookings_collection.insert_one(new_booking)
        
        # Actualizar la sesión para marcarla como completada y asociarla a la reserva
        booking_sessions_collection.update_one(
            {'session_id': session_id},
            {'$set': {
                'completed': True,
                'booking_id': new_booking['booking_id'],
                'payment_status': payment_status,
                'stripe_payment_id': stripe_payment_intent_id,
                'updated_at': datetime.datetime.utcnow()
            }}
        )
        
        # Devolver los detalles de la reserva
        return jsonify({
            "message": "Reserva confirmada correctamente",
            "booking_id": new_booking['booking_id'],
            "status": new_booking['status'],
            "pickup_datetime": pickup_datetime.isoformat(),
            "vehicle": new_booking['vehicle']['name'],
            "payment_status": payment_status,
            "driver": assigned_driver['first_name'] + ' ' + assigned_driver['last_name'] if assigned_driver else None
        }), 201
    
    except Exception as e:
        return jsonify({"error": f"Error al confirmar la reserva: {str(e)}"}), 500

@app.route('/api/booking/<booking_id>', methods=['GET'])
def get_booking_details(booking_id):
    """Obtiene los detalles de una reserva específica"""
    try:
        # Buscar la reserva en la base de datos
        booking = bookings_collection.find_one({'booking_id': booking_id})
        if not booking:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # Formatear fechas para JSON
        if 'pickup' in booking and 'datetime' in booking['pickup']:
            booking['pickup']['datetime'] = booking['pickup']['datetime'].isoformat()
        if 'created_at' in booking:
            booking['created_at'] = booking['created_at'].isoformat()
        if 'updated_at' in booking:
            booking['updated_at'] = booking['updated_at'].isoformat()
        
        # Eliminar el campo _id para la serialización JSON
        booking['_id'] = str(booking['_id'])
        
        return jsonify(booking), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al obtener detalles de la reserva: {str(e)}"}), 500

@app.route('/api/bookings', methods=['GET'])
@jwt_required()
def get_user_bookings():
    """Obtiene las reservas del usuario autenticado"""
    try:
        # Obtener el ID del usuario del token JWT
        user_id = get_jwt_identity()
        
        # Parámetros de paginación y filtrado
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        status = request.args.get('status')
        
        # Calcular el offset para la paginación
        skip = (page - 1) * per_page
        
        # Filtro base: reservas del usuario
        query = {"user_id": user_id}
        
        # Filtrar por estado si se proporciona
        if status:
            query["status"] = status
        
        # Obtener el total de reservas para este filtro
        total_bookings = bookings_collection.count_documents(query)
        
        # Obtener las reservas paginadas y ordenadas por fecha de creación
        bookings = list(bookings_collection.find(query)
                        .sort("created_at", -1)  # -1 para orden descendente (más recientes primero)
                        .skip(skip)
                        .limit(per_page))
        
        # Formatear los resultados para JSON
        formatted_bookings = []
        for booking in bookings:
            # Formatear fechas
            if 'pickup' in booking and 'datetime' in booking['pickup']:
                booking['pickup']['datetime'] = booking['pickup']['datetime'].isoformat()
            if 'created_at' in booking:
                booking['created_at'] = booking['created_at'].isoformat()
            if 'updated_at' in booking:
                booking['updated_at'] = booking['updated_at'].isoformat()
            
            # Convertir ObjectId a string
            booking['_id'] = str(booking['_id'])
            
            formatted_bookings.append(booking)
        
        # Crear estructura de respuesta con metadatos de paginación
        response = {
            "bookings": formatted_bookings,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total_bookings,
                "pages": (total_bookings + per_page - 1) // per_page  # Redondear hacia arriba
            }
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al obtener reservas: {str(e)}"}), 500

@app.route('/api/bookings/public/<booking_id>', methods=['GET'])
def get_public_booking_details(booking_id):
    """Obtiene detalles públicos de una reserva sin requerir autenticación (para compartir)"""
    try:
        # Buscar la reserva en la base de datos
        booking = bookings_collection.find_one({'booking_id': booking_id})
        if not booking:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # Crear una versión reducida con solo información pública
        public_booking = {
            "booking_id": booking['booking_id'],
            "status": booking['status'],
            "trip_type": booking.get('trip_type'),
            "pickup": {
                "datetime": booking.get('pickup', {}).get('datetime').isoformat(),
                "location": {
                    "description": booking.get('pickup', {}).get('location', {}).get('description')
                }
            },
            "vehicle": {
                "name": booking.get('vehicle', {}).get('name'),
                "category": booking.get('vehicle', {}).get('category'),
                "image": booking.get('vehicle', {}).get('image')
            }
        }
        
        # Si el viaje es de ida, incluir destino
        if booking.get('trip_type') == 'ida' and booking.get('dropoff'):
            public_booking["dropoff"] = {
                "description": booking.get('dropoff', {}).get('description')
            }
        
        # Si tiene duración (por horas), incluirla
        if booking.get('trip_type') == 'horas' and booking.get('duration'):
            public_booking["duration"] = booking.get('duration')
        
        return jsonify(public_booking), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al obtener detalles de la reserva: {str(e)}"}), 500

@app.route('/api/booking/<booking_id>/cancel', methods=['POST'])
def cancel_booking(booking_id):
    """Cancela una reserva existente"""
    data = request.get_json() or {}
    
    try:
        # Verificar si la reserva existe
        booking = bookings_collection.find_one({'booking_id': booking_id})
        if not booking:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # Verificar si la reserva ya está cancelada
        if booking.get('status') == 'cancelled':
            return jsonify({"error": "Esta reserva ya ha sido cancelada"}), 400
        
        # Verificar si la reserva ya está en progreso o completada
        if booking.get('status') in ['in_progress', 'completed']:
            return jsonify({"error": "No se puede cancelar una reserva en progreso o completada"}), 400
        
        # Actualizar el estado de la reserva a 'cancelled'
        cancellation_reason = data.get('reason', 'No especificado')
        cancellation_notes = data.get('notes', '')
        
        # Definir política de cancelación según el tiempo restante hasta la recogida
        fee_percentage = 0
        try:
            pickup_time = booking.get('pickup', {}).get('datetime')
            now = datetime.datetime.utcnow()
            time_diff = pickup_time - now
            
            # Calcular tarifa de cancelación según el tiempo restante
            if time_diff.total_seconds() < 24 * 3600:  # Menos de 24 horas
                fee_percentage = 50
            elif time_diff.total_seconds() < 48 * 3600:  # Menos de 48 horas
                fee_percentage = 25
            # Si faltan más de 48 horas, no hay tarifa (0%)
        except:
            # Si hay error al calcular, no aplicar tarifa
            pass
        
        # Calcular la tarifa de cancelación
        original_amount = booking.get('payment', {}).get('amount', 0)
        cancellation_fee = original_amount * (fee_percentage / 100)
        
        # Actualizar la reserva
        update_result = bookings_collection.update_one(
            {'booking_id': booking_id},
            {'$set': {
                'status': 'cancelled',
                'updated_at': datetime.datetime.utcnow(),
                'cancellation': {
                    'timestamp': datetime.datetime.utcnow(),
                    'reason': cancellation_reason,
                    'notes': cancellation_notes,
                    'fee': {
                        'percentage': fee_percentage,
                        'amount': cancellation_fee,
                        'currency': booking.get('payment', {}).get('currency', 'EUR')
                    }
                }
            }}
        )
        
        if update_result.modified_count == 0:
            return jsonify({"error": "No se pudo cancelar la reserva"}), 500
        
        # Devolver confirmación de cancelación
        return jsonify({
            "message": "Reserva cancelada correctamente",
            "booking_id": booking_id,
            "cancellation_fee": {
                "percentage": fee_percentage,
                "amount": cancellation_fee,
                "currency": booking.get('payment', {}).get('currency', 'EUR')
            }
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al cancelar la reserva: {str(e)}"}), 500

@app.route('/api/booking/<booking_id>/status', methods=['PUT'])
@jwt_required()
def update_booking_status(booking_id):
    """Actualiza el estado de una reserva (solo para administradores y conductores)"""
    data = request.get_json()
    
    if not data or 'status' not in data:
        return jsonify({"error": "Se requiere el nuevo estado"}), 400
    
    # Verificar que el estado sea válido
    new_status = data['status']
    valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
    
    if new_status not in valid_statuses:
        return jsonify({"error": f"Estado no válido. Debe ser uno de: {', '.join(valid_statuses)}"}), 400
    
    try:
        # Verificar si la reserva existe
        booking = bookings_collection.find_one({'booking_id': booking_id})
        if not booking:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # Verificar reglas de cambio de estado
        current_status = booking.get('status')
        
        # No permitir cambiar una reserva cancelada
        if current_status == 'cancelled':
            return jsonify({"error": "No se puede cambiar el estado de una reserva cancelada"}), 400
        
        # No permitir retroceder de completado a en progreso
        if current_status == 'completed' and new_status == 'in_progress':
            return jsonify({"error": "No se puede cambiar de completado a en progreso"}), 400
        
        # Actualizar el estado y añadir datos adicionales según el estado
        update_data = {
            'status': new_status,
            'updated_at': datetime.datetime.utcnow()
        }
        
        # Agregar datos específicos del estado
        if new_status == 'confirmed':
            update_data['confirmation'] = {
                'timestamp': datetime.datetime.utcnow(),
                'by': get_jwt_identity(),
                'notes': data.get('notes', '')
            }
        elif new_status == 'in_progress':
            update_data['trip_start'] = {
                'timestamp': datetime.datetime.utcnow(),
                'location': data.get('location', {}),
                'notes': data.get('notes', '')
            }
        elif new_status == 'completed':
            update_data['trip_end'] = {
                'timestamp': datetime.datetime.utcnow(),
                'location': data.get('location', {}),
                'total_distance': data.get('total_distance', 0),
                'total_time': data.get('total_time', 0),
                'notes': data.get('notes', '')
            }
        
        # Actualizar la reserva
        update_result = bookings_collection.update_one(
            {'booking_id': booking_id},
            {'$set': update_data}
        )
        
        if update_result.modified_count == 0:
            return jsonify({"error": "No se pudo actualizar el estado de la reserva"}), 500
        
        # Devolver confirmación
        return jsonify({
            "message": f"Estado de reserva actualizado a '{new_status}'",
            "booking_id": booking_id,
            "previous_status": current_status,
            "new_status": new_status
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al actualizar el estado de la reserva: {str(e)}"}), 500

@app.route('/api/booking/calculate-price', methods=['POST'])
def calculate_booking_price():
    """Calcula el precio estimado de un viaje basado en los detalles proporcionados"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    
    try:
        # Verificar campos mínimos requeridos
        required_fields = ['vehicle_id']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Se requiere vehicle_id"}), 400
        
        # Obtener tipo de viaje (ida o por horas)
        trip_type = data.get('trip_type', 'ida')
        
        # Buscar detalles del vehículo
        try:
            vehicle = vehicles_collection.find_one({"_id": ObjectId(data['vehicle_id'])})
            if not vehicle:
                return jsonify({"error": "Vehículo no encontrado"}), 404
        except:
            return jsonify({"error": "ID de vehículo no válido"}), 400
        
        # Obtener tarifas del vehículo
        pricing = vehicle.get('pricing', {})
        base_fare = pricing.get('base_fare', 0)
        per_km_rate = pricing.get('per_km', 0)
        per_hour_rate = pricing.get('per_hour', 0)
        currency = pricing.get('currency', 'EUR')
        
        # Variables para el cálculo
        total_price = base_fare
        price_breakdown = {
            "base_fare": base_fare,
            "distance_charge": 0,
            "time_charge": 0,
            "extras": 0,
            "surcharges": 0,
            "tax": 0,
            "total": base_fare,
            "currency": currency
        }
        
        # Calcular según tipo de viaje
        if trip_type == 'ida':
            # Para viajes de ida, calcular distancia si hay origen y destino
            from_place_id = data.get('from_place_id')
            to_place_id = data.get('to_place_id')
            
            estimated_distance = 0
            estimated_duration = 0
            
            # Si tenemos place_ids y acceso a Google Maps, calcular distancia
            if from_place_id and to_place_id and gmaps:
                try:
                    # Obtener matriz de distancia entre origen y destino
                    distance_matrix = gmaps.distance_matrix(
                        origins=[f"place_id:{from_place_id}"],
                        destinations=[f"place_id:{to_place_id}"],
                        mode="driving",
                        language="es"
                    )
                    
                    # Extraer distancia y duración
                    if distance_matrix['status'] == 'OK':
                        row = distance_matrix['rows'][0]
                        element = row['elements'][0]
                        
                        if element['status'] == 'OK':
                            # Distancia en km
                            estimated_distance = element['distance']['value'] / 1000
                            # Duración en horas
                            estimated_duration = element['duration']['value'] / 3600
                except Exception as e:
                    print(f"Error al calcular distancia: {e}")
            else:
                # Si no tenemos place_ids o no hay acceso a Maps, usar distancia proporcionada
                estimated_distance = data.get('estimated_distance', 0)
                estimated_duration = data.get('estimated_duration', 0)
            
            # Calcular cargo por distancia
            distance_charge = estimated_distance * per_km_rate
            price_breakdown["distance_charge"] = round(distance_charge, 2)
            total_price += distance_charge
            
            # Guardar estimaciones para la respuesta
            price_breakdown["estimated_distance_km"] = round(estimated_distance, 2)
            price_breakdown["estimated_duration_hours"] = round(estimated_duration, 2)
            
        elif trip_type == 'horas':
            # Para viajes por horas, usar la duración solicitada
            duration_hours = 0
            duration_str = data.get('duration', '')
            
            # Intentar extraer horas de la cadena (p. ej. "2 horas")
            try:
                duration_hours = float(duration_str.split()[0])
            except:
                # Si no se puede extraer, usar 2 horas como predeterminado
                duration_hours = 2
            
            # Calcular cargo por tiempo
            time_charge = duration_hours * per_hour_rate
            price_breakdown["time_charge"] = round(time_charge, 2)
            total_price += time_charge
            
            # Guardar duración para la respuesta
            price_breakdown["duration_hours"] = duration_hours
        
        # Calcular extras si se proporcionan
        extras = data.get('extras', [])
        extras_total = 0
        extras_details = []
        
        # Precios fijos para extras
        extras_pricing = {
            "wifi_premium": 15.00,
            "champagne": 65.00,
            "child_seat": 25.00,
            "executive_food": 40.00,
            "additional_stop": 20.00,
            "vip_access": 30.00,
            "interpreter": 75.00
        }
        
        for extra in extras:
            if extra in extras_pricing:
                extra_price = extras_pricing[extra]
                extras_total += extra_price
                extras_details.append({
                    "name": extra,
                    "price": extra_price
                })
        
        price_breakdown["extras_details"] = extras_details
        price_breakdown["extras"] = round(extras_total, 2)
        total_price += extras_total
        
        # Calcular recargos (hora pico, días festivos, etc.)
        surcharge_percentage = 0
        surcharge_reason = None
        
        # Verificar si es hora pico
        pickup_time = data.get('pickup_time', '')
        if pickup_time:
            try:
                hour = int(pickup_time.split(':')[0])
                if 7 <= hour < 10 or 17 <= hour < 20:  # Horas pico: 7-10 AM y 5-8 PM
                    surcharge_percentage += 10
                    surcharge_reason = "Hora pico"
            except:
                pass
        
        # Verificar si es día festivo o fin de semana
        pickup_date = data.get('pickup_date', '')
        if pickup_date:
            try:
                date_obj = datetime.datetime.strptime(pickup_date, "%a, %d %b %Y")
                # Si es fin de semana (5=sábado, 6=domingo)
                if date_obj.weekday() >= 5:
                    surcharge_percentage += 15
                    surcharge_reason = "Fin de semana"
                
                # Días festivos (simplificado para el ejemplo)
                holidays = ["01/01", "25/12", "24/12", "31/12"]
                date_key = date_obj.strftime("%d/%m")
                if date_key in holidays:
                    surcharge_percentage += 25
                    surcharge_reason = "Día festivo"
            except:
                pass
        
        # Aplicar recargos
        if surcharge_percentage > 0:
            surcharges = total_price * (surcharge_percentage / 100)
            price_breakdown["surcharges"] = round(surcharges, 2)
            price_breakdown["surcharge_percentage"] = surcharge_percentage
            price_breakdown["surcharge_reason"] = surcharge_reason
            total_price += surcharges
        
        # Calcular impuestos
        tax_rate = 21  # 21% IVA en España
        tax = total_price * (tax_rate / 100)
        price_breakdown["tax"] = round(tax, 2)
        price_breakdown["tax_rate"] = tax_rate
        total_price += tax
        
        # Redondear precio total
        price_breakdown["total"] = round(total_price, 2)
        
        # Devolver resultado
        return jsonify({
            "price_breakdown": price_breakdown,
            "vehicle": {
                "id": str(vehicle['_id']),
                "name": vehicle.get('name'),
                "category": vehicle.get('category'),
                "type": vehicle.get('type')
            },
            "trip_type": trip_type
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al calcular precio: {str(e)}"}), 500

@app.route('/api/booking/<booking_id>/location', methods=['POST'])
@jwt_required()
def update_trip_location(booking_id):
    """Actualiza la ubicación de un vehículo durante un viaje en curso"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    
    # Verificar campos requeridos
    required_fields = ['latitude', 'longitude']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Se requieren latitud y longitud"}), 400
    
    try:
        # Verificar si la reserva existe
        booking = bookings_collection.find_one({'booking_id': booking_id})
        if not booking:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # Verificar que la reserva esté en un estado que permita actualizar ubicación
        if booking.get('status') not in ['confirmed', 'in_progress']:
            return jsonify({
                "error": "Solo se puede actualizar la ubicación de viajes confirmados o en progreso"
            }), 400
        
        # Crear datos de ubicación
        location_data = {
            "timestamp": datetime.datetime.utcnow(),
            "coordinates": {
                "type": "Point",
                "coordinates": [data['longitude'], data['latitude']]
            },
            "accuracy": data.get('accuracy', 0),
            "speed": data.get('speed', 0),
            "heading": data.get('heading', 0)
        }
        
        # Actualizar la reserva con la nueva ubicación
        update_result = bookings_collection.update_one(
            {'booking_id': booking_id},
            {
                '$push': {'locations': location_data},
                '$set': {
                    'current_location': location_data,
                    'updated_at': datetime.datetime.utcnow()
                }
            }
        )
        
        if update_result.modified_count == 0:
            return jsonify({"error": "No se pudo actualizar la ubicación"}), 500
        
        # Si hay conductor asignado, actualizar también su ubicación
        driver_id = booking.get('driver', {}).get('id')
        if driver_id:
            try:
                drivers_collection.update_one(
                    {'_id': ObjectId(driver_id)},
                    {'$set': {
                        'location': {
                            'type': 'Point',
                            'coordinates': [data['longitude'], data['latitude']]
                        },
                        'last_location_update': datetime.datetime.utcnow()
                    }}
                )
            except Exception as e:
                print(f"Error al actualizar ubicación del conductor: {e}")
        
        # Si hay vehículo asignado, actualizar también su ubicación
        vehicle_id = booking.get('vehicle', {}).get('id')
        if vehicle_id:
            try:
                vehicles_collection.update_one(
                    {'_id': ObjectId(vehicle_id)},
                    {'$set': {
                        'location': {
                            'type': 'Point',
                            'coordinates': [data['longitude'], data['latitude']]
                        },
                        'last_location_update': datetime.datetime.utcnow()
                    }}
                )
            except Exception as e:
                print(f"Error al actualizar ubicación del vehículo: {e}")
        
        # Calcular detalles del progreso si la reserva está en progreso
        if booking.get('status') == 'in_progress' and 'trip_start' in booking:
            # Si hay ubicación de origen y destino, calcular progreso
            if booking.get('pickup', {}).get('location', {}).get('place_id') and booking.get('dropoff', {}).get('place_id'):
                try:
                    # Intentar estimar el tiempo restante usando Google Maps
                    if gmaps:
                        # Obtener la matriz de distancia entre ubicación actual y destino
                        distance_matrix = gmaps.distance_matrix(
                            origins=[f"{data['latitude']},{data['longitude']}"],
                            destinations=[f"place_id:{booking['dropoff']['place_id']}"],
                            mode="driving",
                            language="es"
                        )
                        
                        # Extraer tiempo restante
                        if distance_matrix['status'] == 'OK':
                            element = distance_matrix['rows'][0]['elements'][0]
                            if element['status'] == 'OK':
                                # Actualizar el tiempo restante estimado
                                bookings_collection.update_one(
                                    {'booking_id': booking_id},
                                    {'$set': {
                                        'trip_progress': {
                                            'distance_remaining_meters': element['distance']['value'],
                                            'time_remaining_seconds': element['duration']['value'],
                                            'time_remaining_text': element['duration']['text'],
                                            'updated_at': datetime.datetime.utcnow()
                                        }
                                    }}
                                )
                except Exception as e:
                    print(f"Error al calcular progreso del viaje: {e}")
        
        return jsonify({
            "message": "Ubicación actualizada correctamente",
            "timestamp": location_data["timestamp"].isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al actualizar ubicación: {str(e)}"}), 500

@app.route('/api/booking/<booking_id>/location', methods=['GET'])
def get_trip_location(booking_id):
    """Obtiene la ubicación actual de un vehículo durante un viaje"""
    try:
        # Verificar si la reserva existe
        booking = bookings_collection.find_one(
            {'booking_id': booking_id},
            {'current_location': 1, 'status': 1, 'trip_progress': 1}
        )
        
        if not booking:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # Verificar si hay información de ubicación
        if 'current_location' not in booking:
            return jsonify({"error": "No hay información de ubicación disponible"}), 404
        
        # Extraer datos de ubicación
        location_data = booking.get('current_location', {})
        
        # Formatear timestamp si existe
        if 'timestamp' in location_data:
            location_data['timestamp'] = location_data['timestamp'].isoformat()
        
        # Incluir información de progreso si está disponible
        response = {
            "location": location_data,
            "status": booking.get('status'),
            "trip_progress": booking.get('trip_progress', {})
        }
        
        # Formatear timestamp del progreso si existe
        if 'trip_progress' in response and 'updated_at' in response['trip_progress']:
            response['trip_progress']['updated_at'] = response['trip_progress']['updated_at'].isoformat()
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({"error": f"Error al obtener ubicación: {str(e)}"}), 500

# === ENDPOINTS DE STRIPE ===

@app.route('/api/payment/create-intent', methods=['POST'])
def create_payment_intent():
    """Crea una intención de pago en Stripe y devuelve el client_secret"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    
    try:
        # Verificar campos requeridos
        required_fields = ['amount', 'currency']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Se requieren los campos amount y currency"}), 400
        
        amount = int(float(data['amount']) * 100)  # Convertir a centavos
        currency = data['currency'].lower()
        
        # Obtener customer_id si existe
        user_id = None
        jwt_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if jwt_token:
            try:
                decoded_token = jwt.decode(
                    jwt_token, 
                    app.config['JWT_SECRET_KEY'], 
                    algorithms=['HS256']
                )
                user_id = decoded_token.get('sub')
            except:
                print("Error al decodificar el token JWT")
        
        payment_intent_data = {
            'amount': amount,
            'currency': currency,
            'automatic_payment_methods': {
                'enabled': True,
            },
            'metadata': {
                'session_id': data.get('session_id', ''),
                'user_id': user_id or '',
            }
        }
        
        # Crear la intención de pago
        intent = stripe.PaymentIntent.create(**payment_intent_data)
        
        # Devolver el client_secret
        return jsonify({
            'clientSecret': intent.client_secret,
            'id': intent.id
        }), 200
    
    except stripe.error.StripeError as e:
        return jsonify({"error": f"Error de Stripe: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Error al crear la intención de pago: {str(e)}"}), 500

@app.route('/api/payment/webhook', methods=['POST'])
def stripe_webhook():
    """Maneja los webhooks de Stripe"""
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        # Verificar la firma
        event = None
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, stripe_webhook_secret
            )
        except ValueError as e:
            # Payload inválido
            return jsonify({"error": "Payload inválido"}), 400
        except stripe.error.SignatureVerificationError as e:
            # Firma inválida
            return jsonify({"error": "Firma inválida"}), 400
        except Exception as e:
            # Otro error
            return jsonify({"error": str(e)}), 400
        
        # Manejar los eventos
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            session_id = payment_intent['metadata'].get('session_id')
            
            # Actualizar el estado de la reserva si el pago es exitoso
            if session_id:
                # Buscar la sesión en la base de datos
                session = booking_sessions_collection.find_one({'session_id': session_id})
                if session:
                    # Actualizar la sesión con el ID de pago de Stripe
                    booking_sessions_collection.update_one(
                        {'session_id': session_id},
                        {'$set': {
                            'payment_status': 'succeeded',
                            'stripe_payment_id': payment_intent['id'],
                            'updated_at': datetime.datetime.utcnow()
                        }}
                    )
                    
                    # Si hay una reserva asociada, actualizarla también
                    if 'booking_id' in session:
                        bookings_collection.update_one(
                            {'booking_id': session['booking_id']},
                            {'$set': {
                                'payment.status': 'succeeded',
                                'payment.stripe_payment_id': payment_intent['id'],
                                'payment.payment_method_details': payment_intent['payment_method_details'],
                                'updated_at': datetime.datetime.utcnow()
                            }}
                        )
        
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            session_id = payment_intent['metadata'].get('session_id')
            
            # Actualizar el estado de la reserva si el pago falla
            if session_id:
                # Buscar la sesión en la base de datos
                session = booking_sessions_collection.find_one({'session_id': session_id})
                if session:
                    # Actualizar la sesión con el error de pago
                    booking_sessions_collection.update_one(
                        {'session_id': session_id},
                        {'$set': {
                            'payment_status': 'failed',
                            'payment_error': payment_intent['last_payment_error'],
                            'updated_at': datetime.datetime.utcnow()
                        }}
                    )
                    
                    # Si hay una reserva asociada, actualizarla también
                    if 'booking_id' in session:
                        bookings_collection.update_one(
                            {'booking_id': session['booking_id']},
                            {'$set': {
                                'payment.status': 'failed',
                                'payment.error': payment_intent['last_payment_error'],
                                'updated_at': datetime.datetime.utcnow()
                            }}
                        )
        
        return jsonify({'status': 'success'}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/payment/update-payment-method', methods=['POST'])
def update_payment_method():
    """Actualiza el método de pago de una intención de pago existente"""
    data = request.get_json()
    
    if not data or 'payment_intent_id' not in data or 'payment_method_id' not in data:
        return jsonify({"error": "Se requieren payment_intent_id y payment_method_id"}), 400
    
    try:
        payment_intent_id = data['payment_intent_id']
        payment_method_id = data['payment_method_id']
        
        # Actualizar la intención de pago con el nuevo método de pago
        payment_intent = stripe.PaymentIntent.modify(
            payment_intent_id,
            payment_method=payment_method_id
        )
        
        return jsonify({
            'status': 'success',
            'client_secret': payment_intent.client_secret
        }), 200
    
    except stripe.error.StripeError as e:
        return jsonify({"error": f"Error de Stripe: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Error al actualizar el método de pago: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 