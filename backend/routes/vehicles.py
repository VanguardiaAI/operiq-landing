from flask import Blueprint, request, jsonify
from bson import ObjectId
import pymongo
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import functools

# Crear un Blueprint para las rutas de vehículos
vehicles_bp = Blueprint('vehicles', __name__)

# Variable global para almacenar la referencia a la base de datos
db = None
vehicles_collection = None

# Función para inicializar las colecciones necesarias
def setup_collections(database):
    global db, vehicles_collection
    db = database
    vehicles_collection = db['vehicles']

# Decorador para requerir rol de administrador
def admin_required(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        # Obtener identidad del token
        current_user_id = get_jwt_identity()
        
        # Buscar usuario en la base de datos
        from app import users_collection
        user = users_collection.find_one({'_id': ObjectId(current_user_id)})
        
        if not user or user.get('role') != 'admin':
            return jsonify({"error": "Se requiere rol de administrador"}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper

# Rutas para la gestión de vehículos
@vehicles_bp.route('/api/admin/vehicles/list', methods=['GET'])
@jwt_required()
def get_vehicles():
    """Obtener todos los vehículos"""
    try:
        # Verificar si hay filtros en la solicitud
        query = {}
        
        # Filtros posibles: tipo, categoría, disponibilidad, etc.
        if request.args.get('type'):
            query['type'] = request.args.get('type')
        
        if request.args.get('category'):
            query['category'] = request.args.get('category')
        
        if request.args.get('available') is not None:
            query['available'] = request.args.get('available').lower() == 'true'
        
        if request.args.get('ownerType'):
            query['ownerType'] = request.args.get('ownerType')
        
        # Obtener vehículos de la base de datos
        vehicles = list(vehicles_collection.find(query))
        
        # Convertir ObjectId a string para serialización JSON
        for vehicle in vehicles:
            vehicle['_id'] = str(vehicle['_id'])
        
        return jsonify({
            'status': 'success',
            'vehicles': vehicles,
            'count': len(vehicles)
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@vehicles_bp.route('/api/admin/vehicles/<vehicle_id>', methods=['GET'])
@jwt_required()
def get_vehicle(vehicle_id):
    """Obtener un vehículo específico por ID"""
    try:
        # Buscar el vehículo en la base de datos
        vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle_id)})
        
        if not vehicle:
            return jsonify({
                'status': 'error',
                'message': 'Vehículo no encontrado'
            }), 404
        
        # Convertir ObjectId a string para serialización JSON
        vehicle['_id'] = str(vehicle['_id'])
        
        return jsonify({
            'status': 'success',
            'vehicle': vehicle
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@vehicles_bp.route('/api/admin/vehicles/create', methods=['POST'])
@jwt_required()
@admin_required
def create_vehicle():
    """Crear un nuevo vehículo"""
    try:
        # Obtener datos del request
        vehicle_data = request.json
        
        # Añadir timestamp de creación
        vehicle_data['created_at'] = datetime.utcnow()
        vehicle_data['updated_at'] = datetime.utcnow()
        
        # Validar datos requeridos
        required_fields = ['type', 'category', 'name', 'details', 'capacity', 'pricing']
        for field in required_fields:
            if field not in vehicle_data:
                return jsonify({
                    'status': 'error',
                    'message': f'Campo requerido: {field}'
                }), 400
        
        # Insertar en la base de datos
        result = vehicles_collection.insert_one(vehicle_data)
        
        return jsonify({
            'status': 'success',
            'message': 'Vehículo creado exitosamente',
            'vehicle_id': str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@vehicles_bp.route('/api/admin/vehicles/<vehicle_id>/update', methods=['PUT'])
@jwt_required()
@admin_required
def update_vehicle(vehicle_id):
    """Actualizar un vehículo existente"""
    try:
        # Obtener datos del request
        vehicle_data = request.json
        
        # Añadir timestamp de actualización
        vehicle_data['updated_at'] = datetime.utcnow()
        
        # Actualizar en la base de datos
        result = vehicles_collection.update_one(
            {'_id': ObjectId(vehicle_id)}, 
            {'$set': vehicle_data}
        )
        
        if result.matched_count == 0:
            return jsonify({
                'status': 'error',
                'message': 'Vehículo no encontrado'
            }), 404
        
        return jsonify({
            'status': 'success',
            'message': 'Vehículo actualizado exitosamente'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@vehicles_bp.route('/api/admin/vehicles/<vehicle_id>/delete', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_vehicle(vehicle_id):
    """Eliminar un vehículo"""
    try:
        # Eliminar de la base de datos
        result = vehicles_collection.delete_one({'_id': ObjectId(vehicle_id)})
        
        if result.deleted_count == 0:
            return jsonify({
                'status': 'error',
                'message': 'Vehículo no encontrado'
            }), 404
        
        return jsonify({
            'status': 'success',
            'message': 'Vehículo eliminado exitosamente'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@vehicles_bp.route('/api/admin/vehicles/<vehicle_id>/toggle-availability', methods=['PATCH'])
@jwt_required()
@admin_required
def toggle_vehicle_availability(vehicle_id):
    """Cambiar el estado de disponibilidad de un vehículo"""
    try:
        # Obtener vehículo actual
        vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle_id)})
        
        if not vehicle:
            return jsonify({
                'status': 'error',
                'message': 'Vehículo no encontrado'
            }), 404
        
        # Cambiar el estado de disponibilidad
        new_availability = not vehicle.get('available', False)
        
        # Actualizar en la base de datos
        result = vehicles_collection.update_one(
            {'_id': ObjectId(vehicle_id)}, 
            {'$set': {
                'available': new_availability,
                'updated_at': datetime.utcnow()
            }}
        )
        
        return jsonify({
            'status': 'success',
            'message': f'Disponibilidad del vehículo cambiada a: {"disponible" if new_availability else "no disponible"}',
            'available': new_availability
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@vehicles_bp.route('/api/admin/vehicles/<vehicle_id>/assign-driver', methods=['POST'])
@jwt_required()
@admin_required
def assign_driver_to_vehicle(vehicle_id):
    """Asignar un conductor a un vehículo"""
    try:
        # Obtener ID del conductor desde el request
        data = request.json
        driver_id = data.get('driver_id')
        
        if not driver_id:
            return jsonify({
                'status': 'error',
                'message': 'Se requiere el ID del conductor'
            }), 400
        
        # Verificar si el vehículo existe
        vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle_id)})
        if not vehicle:
            return jsonify({
                'status': 'error',
                'message': 'Vehículo no encontrado'
            }), 404
        
        # Verificar si el conductor existe
        from app import drivers_collection
        driver = drivers_collection.find_one({'_id': ObjectId(driver_id)})
        if not driver:
            return jsonify({
                'status': 'error',
                'message': 'Conductor no encontrado'
            }), 404
        
        # Actualizar la lista de conductores asignados al vehículo
        associated_drivers = vehicle.get('associatedDrivers', [])
        
        # Convertir ObjectId a string si es necesario
        driver_id_str = str(driver_id) if isinstance(driver_id, ObjectId) else driver_id
        
        # Añadir conductor solo si no está ya asignado
        if driver_id_str not in associated_drivers:
            associated_drivers.append(driver_id_str)
            
            # Actualizar el vehículo
            vehicles_collection.update_one(
                {'_id': ObjectId(vehicle_id)},
                {'$set': {
                    'associatedDrivers': associated_drivers,
                    'updated_at': datetime.utcnow()
                }}
            )
        
        return jsonify({
            'status': 'success',
            'message': 'Conductor asignado al vehículo exitosamente',
            'associatedDrivers': associated_drivers
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@vehicles_bp.route('/api/admin/vehicles/<vehicle_id>/remove-driver', methods=['POST'])
@jwt_required()
@admin_required
def remove_driver_from_vehicle(vehicle_id):
    """Eliminar un conductor de un vehículo"""
    try:
        # Obtener ID del conductor desde el request
        data = request.json
        driver_id = data.get('driver_id')
        
        if not driver_id:
            return jsonify({
                'status': 'error',
                'message': 'Se requiere el ID del conductor'
            }), 400
        
        # Verificar si el vehículo existe
        vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle_id)})
        if not vehicle:
            return jsonify({
                'status': 'error',
                'message': 'Vehículo no encontrado'
            }), 404
        
        # Actualizar la lista de conductores asignados al vehículo
        associated_drivers = vehicle.get('associatedDrivers', [])
        
        # Convertir ObjectId a string si es necesario
        driver_id_str = str(driver_id) if isinstance(driver_id, ObjectId) else driver_id
        
        # Eliminar conductor si está asignado
        if driver_id_str in associated_drivers:
            associated_drivers.remove(driver_id_str)
            
            # Actualizar el vehículo
            vehicles_collection.update_one(
                {'_id': ObjectId(vehicle_id)},
                {'$set': {
                    'associatedDrivers': associated_drivers,
                    'updated_at': datetime.utcnow()
                }}
            )
        
        return jsonify({
            'status': 'success',
            'message': 'Conductor eliminado del vehículo exitosamente',
            'associatedDrivers': associated_drivers
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@vehicles_bp.route('/api/admin/vehicles/by-collaborator/<collaborator_id>', methods=['GET'])
@jwt_required()
def get_vehicles_by_collaborator(collaborator_id):
    """Obtener vehículos asociados a un colaborador específico por ID"""
    current_user_id = get_jwt_identity()
    
    # Verificar si el usuario es administrador
    from app import users_collection
    admin_user = users_collection.find_one({
        '_id': ObjectId(current_user_id),
        'role': 'admin'
    })
    
    if not admin_user:
        return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
    
    try:
        # Buscar vehículos por collaboratorId
        vehicles_cursor = vehicles_collection.find({'collaboratorId': collaborator_id})
        
        # Convertir a formato esperado por el frontend
        vehicles_list = []
        for vehicle in vehicles_cursor:
            # Extraer detalles de modelo y año
            details = vehicle.get('details', {})
            brand = details.get('brand', '')
            model_name = details.get('model', '')
            year = details.get('year', '')
            
            # Crear cadena descriptiva evitando la duplicación de marca
            # Verificar si el modelo ya incluye la marca

            model_display = f"{model_name} {year}".strip()
                
            if not model_display:
                model_display = vehicle.get('name', 'Vehículo sin modelo')
            
            # Mapear campos
            vehicle_data = {
                'id': str(vehicle['_id']),
                'brand': brand,
                'model': model_display,  # Usamos la combinación de marca, modelo y año
                'modelName': model_name,  # Guardamos también el nombre del modelo por separado
                'year': year,  # Guardamos el año por separado
                'licensePlate': vehicle.get('licensePlate', ''),
                'type': vehicle.get('type', ''),
                'category': vehicle.get('category', ''),
                'image': vehicle.get('image', ''),
                'available': vehicle.get('available', False),
                'color': details.get('color', ''),
                'details': details  # Enviamos todos los detalles por si se necesitan más adelante
            }
            
            # Buscar conductor asociado si existe
            if 'associatedDrivers' in vehicle and vehicle['associatedDrivers']:
                try:
                    from app import drivers_collection
                    driver_id = vehicle['associatedDrivers'][0]  # Tomar el primer conductor
                    driver = drivers_collection.find_one({'_id': ObjectId(driver_id)})
                    if driver:
                        vehicle_data['associatedDriver'] = {
                            'id': str(driver['_id']),
                            'name': driver.get('name', ''),
                            'photo': driver.get('photo', '')
                        }
                except Exception as driver_error:
                    print(f"Error al obtener conductor: {str(driver_error)}")
            
            vehicles_list.append(vehicle_data)
        
        return jsonify({'vehicles': vehicles_list}), 200
    
    except Exception as e:
        return jsonify({'error': f'Error al obtener vehículos por colaborador: {str(e)}'}), 500

# Ruta para buscar vehículos por ubicación
@vehicles_bp.route('/api/vehicles/nearby', methods=['GET'])
def get_nearby_vehicles():
    """Buscar vehículos cercanos a una ubicación geográfica"""
    try:
        # Obtener parámetros de la solicitud
        longitude = float(request.args.get('longitude'))
        latitude = float(request.args.get('latitude'))
        max_distance = float(request.args.get('distance', 10000))  # Metros, default 10km
        vehicle_type = request.args.get('type')
        
        # Construir el query
        query = {
            'location': {
                '$near': {
                    '$geometry': {
                        'type': 'Point',
                        'coordinates': [longitude, latitude]
                    },
                    '$maxDistance': max_distance
                }
            },
            'available': True
        }
        
        # Filtrar por tipo si se especifica
        if vehicle_type:
            query['type'] = vehicle_type
        
        # Buscar vehículos
        vehicles = list(vehicles_collection.find(query))
        
        # Convertir ObjectId a string para serialización JSON
        for vehicle in vehicles:
            vehicle['_id'] = str(vehicle['_id'])
        
        return jsonify({
            'status': 'success',
            'vehicles': vehicles,
            'count': len(vehicles)
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 