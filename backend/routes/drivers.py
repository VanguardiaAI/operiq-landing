from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
import uuid
from flask_jwt_extended import jwt_required, get_jwt_identity

# Crear blueprint para las rutas de chóferes
drivers_bp = Blueprint("drivers", __name__)

# Variables para las colecciones
users_collection = None
drivers_collection = None
driver_vehicle_assignments_collection = None

# Configurar las colecciones
def setup_collections(db):
    global users_collection, drivers_collection, driver_vehicle_assignments_collection
    users_collection = db['users']
    drivers_collection = db['drivers']
    driver_vehicle_assignments_collection = db['driver_vehicle_assignments']

# Obtener todos los chóferes (solo para administradores)
@drivers_bp.route('/list', methods=['GET'])
@jwt_required()
def get_drivers():
    current_user_id = get_jwt_identity()
    
    # Verificar si el usuario es administrador
    admin_user = users_collection.find_one({
        '_id': ObjectId(current_user_id),
        'role': 'admin'
    })
    
    if not admin_user:
        return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
    
    # Obtener parámetros de consulta para filtrado
    status_filter = request.args.get('status', '')
    search_query = request.args.get('search', '')
    location_filter = request.args.get('location', '')
    type_filter = request.args.get('type', '')
    
    # Construir filtro de consulta
    query = {}
    
    if status_filter and status_filter != 'all':
        if status_filter == 'active':
            query['active'] = True
        elif status_filter == 'inactive':
            query['active'] = False
        elif status_filter == 'pending':
            query['status'] = 'pending'
    
    if location_filter and location_filter != 'all':
        # Buscar por ciudad
        query['location.city'] = {'$regex': location_filter, '$options': 'i'}
    
    if type_filter and type_filter != 'all':
        if type_filter == 'private':
            query['company_id'] = {'$exists': False}
        elif type_filter == 'company':
            query['company_id'] = {'$exists': True}
    
    if search_query:
        # Búsqueda por nombre, email, teléfono o ID
        query['$or'] = [
            {'first_name': {'$regex': search_query, '$options': 'i'}},
            {'last_name': {'$regex': search_query, '$options': 'i'}},
            {'email': {'$regex': search_query, '$options': 'i'}},
            {'phone': {'$regex': search_query, '$options': 'i'}}
        ]
    
    try:
        # Obtener chóferes filtrados
        drivers_cursor = drivers_collection.find(query)
        
        # Convertir a formato esperado por el frontend
        drivers_list = []
        for driver in drivers_cursor:
            # Determinar estado
            status = 'active' if driver.get('active', False) else 'inactive'
            if driver.get('status') == 'pending':
                status = 'pending'
                
            # Determinar tipo
            driver_type = 'company' if driver.get('company_id') else 'private'
            
            # Obtener vehículos asignados
            direct_assigned_vehicles = driver.get('assigned_vehicles', [])
            
            # Mapear campos
            driver_data = {
                'id': str(driver['_id']),
                'name': f"{driver.get('first_name', '')} {driver.get('last_name', '')}",
                'photo': driver.get('profile_image', ''),
                'phone': driver.get('phone', ''),
                'email': driver.get('email', ''),
                'documentId': driver.get('document_id', ''),
                'licenseNumber': driver.get('licenses', {}).get('driving', {}).get('number', ''),
                'licenseExpiry': driver.get('licenses', {}).get('driving', {}).get('expiration', '').strftime('%Y-%m-%d') if driver.get('licenses', {}).get('driving', {}).get('expiration') else '',
                'type': driver_type,
                'companyName': driver.get('company_name', ''),
                'experience': driver.get('years_experience', 0),
                'rating': driver.get('ratings', {}).get('average', 0),
                'available': driver.get('available', False),
                'assignedVehicles': direct_assigned_vehicles,
                'languages': driver.get('languages', []),
                'specialty': driver.get('specialties', [])[0] if driver.get('specialties') and len(driver.get('specialties', [])) > 0 else '',
                'notes': driver.get('notes', ''),
                'status': status,
                'country': driver.get('country', ''),
                'city': driver.get('city', ''),
                'collaboratorId': driver.get('collaborator_id', '')
            }
            
            drivers_list.append(driver_data)
        
        return jsonify({'drivers': drivers_list}), 200
    
    except Exception as e:
        return jsonify({'error': f'Error al obtener chóferes: {str(e)}'}), 500

# Obtener detalles de un chófer específico
@drivers_bp.route('/<driver_id>', methods=['GET'])
@jwt_required()
def get_driver_details(driver_id):
    current_user_id = get_jwt_identity()
    
    # Verificar si el usuario es administrador
    admin_user = users_collection.find_one({
        '_id': ObjectId(current_user_id),
        'role': 'admin'
    })
    
    if not admin_user:
        return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
    
    try:
        # Buscar chófer por ID
        driver = drivers_collection.find_one({'_id': ObjectId(driver_id)})
        
        if not driver:
            return jsonify({'error': 'Chófer no encontrado'}), 404
            
        # Determinar estado
        status = 'active' if driver.get('active', False) else 'inactive'
        if driver.get('status') == 'pending':
            status = 'pending'
            
        # Determinar tipo
        driver_type = 'company' if driver.get('company_id') else 'private'
        
        # Buscar vehículos asignados
        assignments = list(driver_vehicle_assignments_collection.find(
            {"driver_id": driver_id, "status": "active"}
        ))
        
        assigned_vehicles = [assignment.get('vehicle_id') for assignment in assignments] if assignments else []
        
        # Verificar si hay vehículos directamente asignados en el documento
        direct_assigned_vehicles = driver.get('assigned_vehicles', [])
        
        # Combinar los vehículos de ambas fuentes
        all_vehicles = list(set(assigned_vehicles + direct_assigned_vehicles))
        
        # Mapear campos al formato esperado por el frontend
        driver_data = {
            'id': str(driver['_id']),
            'name': f"{driver.get('first_name', '')} {driver.get('last_name', '')}",
            'photo': driver.get('profile_image', ''),
            'phone': driver.get('phone', ''),
            'email': driver.get('email', ''),
            'documentId': driver.get('document_id', ''),
            'licenseNumber': driver.get('licenses', {}).get('driving', {}).get('number', ''),
            'licenseExpiry': driver.get('licenses', {}).get('driving', {}).get('expiration', '').strftime('%Y-%m-%d') if driver.get('licenses', {}).get('driving', {}).get('expiration') else '',
            'type': driver_type,
            'companyName': driver.get('company_name', ''),
            'experience': driver.get('years_experience', 0),
            'rating': driver.get('ratings', {}).get('average', 0),
            'available': driver.get('available', False),
            'assignedVehicles': all_vehicles,  # Usar la lista combinada
            'languages': driver.get('languages', []),
            'specialty': driver.get('specialties', [])[0] if driver.get('specialties') and len(driver.get('specialties', [])) > 0 else '',
            'notes': driver.get('notes', ''),
            'status': status,
            'country': driver.get('country', ''),
            'city': driver.get('city', ''),
            'collaboratorId': driver.get('collaborator_id', '')
        }
        
        return jsonify({'driver': driver_data}), 200
    
    except Exception as e:
        return jsonify({'error': f'Error al obtener detalles del chófer: {str(e)}'}), 500

# Crear nuevo chófer (solo administradores)
@drivers_bp.route('/create', methods=['POST'])
@jwt_required()
def create_driver():
    current_user_id = get_jwt_identity()
    
    # Verificar si el usuario es administrador
    admin_user = users_collection.find_one({
        '_id': ObjectId(current_user_id),
        'role': 'admin'
    })
    
    if not admin_user:
        return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
    
    # Obtener datos del request
    data = request.get_json()
    
    # Validar datos requeridos
    if not data or not all(k in data for k in ('name', 'email', 'phone')):
        return jsonify({'error': 'Se requieren nombre, email y teléfono'}), 400
    
    # Verificar si el chófer ya existe
    existing_driver = drivers_collection.find_one({'email': data['email']})
    if existing_driver:
        return jsonify({'error': 'El chófer ya existe con este email'}), 409
    
    try:
        # Separar nombre completo en nombre y apellido
        name_parts = data['name'].split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Crear estructura para la licencia
        license_data = {
            'driving': {
                'number': data.get('licenseNumber', ''),
                'expiration': datetime.strptime(data.get('licenseExpiry', '2030-01-01'), '%Y-%m-%d'),
                'type': 'Profesional'
            }
        }
        
        # Determinar estatus
        active = data.get('status', 'active') == 'active'
        status = data.get('status', 'active')
        if status not in ['active', 'inactive', 'pending']:
            status = 'active'
            
        # Convertir especialidades a lista
        specialties = []
        if data.get('specialty'):
            specialties.append(data.get('specialty'))
            
        # Convertir idiomas a lista si es string
        languages = data.get('languages', [])
        if isinstance(languages, str):
            languages = [lang.strip() for lang in languages.split(',')]
            
        # Crear nuevo registro de chófer
        new_driver = {
            'first_name': first_name,
            'last_name': last_name,
            'email': data['email'],
            'phone': data['phone'],
            'profile_image': data.get('photo', ''),
            'document_id': data.get('documentId', ''),
            'licenses': license_data,
            'languages': languages,
            'specialties': specialties,
            'years_experience': int(data.get('experience', 0)),
            'available': data.get('available', True),
            'active': active,
            'status': status,
            'ratings': {
                'average': float(data.get('rating', 0)),
                'count': 0
            },
            'notes': data.get('notes', ''),
            'country': data.get('country', ''),
            'city': data.get('city', ''),
            'collaborator_id': data.get('collaboratorId', ''),
            'created_at': datetime.now()
        }
        
        # Agregar campos de empresa si aplica
        if data.get('type') == 'company' and data.get('companyName'):
            new_driver['company_name'] = data.get('companyName')
        
        # Insertar en la base de datos
        result = drivers_collection.insert_one(new_driver)
        
        if not result.inserted_id:
            return jsonify({'error': 'No se pudo crear el chófer'}), 500
            
        # Devolver el id del chófer creado
        return jsonify({
            'message': 'Chófer creado exitosamente', 
            'driver_id': str(result.inserted_id)
        }), 201
    
    except Exception as e:
        return jsonify({'error': f'Error al crear el chófer: {str(e)}'}), 500

# Actualizar chófer existente
@drivers_bp.route('/<driver_id>/update', methods=['PUT'])
@jwt_required()
def update_driver(driver_id):
    current_user_id = get_jwt_identity()
    
    # Verificar si el usuario es administrador
    admin_user = users_collection.find_one({
        '_id': ObjectId(current_user_id),
        'role': 'admin'
    })
    
    if not admin_user:
        return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
    
    # Obtener datos del request
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No se proporcionaron datos para actualizar'}), 400
    
    # Buscar chófer por ID
    driver = drivers_collection.find_one({'_id': ObjectId(driver_id)})
    
    if not driver:
        return jsonify({'error': 'Chófer no encontrado'}), 404
    
    try:
        # Crear objeto de actualización
        update_data = {}
        
        # Actualizar campos básicos si están presentes
        if 'name' in data:
            name_parts = data['name'].split(' ', 1)
            update_data['first_name'] = name_parts[0]
            if len(name_parts) > 1:
                update_data['last_name'] = name_parts[1]
        
        if 'email' in data:
            update_data['email'] = data['email']
            
        if 'phone' in data:
            update_data['phone'] = data['phone']
            
        if 'photo' in data:
            update_data['profile_image'] = data['photo']
            
        if 'documentId' in data:
            update_data['document_id'] = data['documentId']
            
        if 'notes' in data:
            update_data['notes'] = data['notes']
            
        if 'country' in data:
            update_data['country'] = data['country']
            
        if 'city' in data:
            update_data['city'] = data['city']
            
        if 'experience' in data:
            update_data['years_experience'] = int(data['experience'])
            
        if 'available' in data:
            update_data['available'] = data['available']
            
        # Actualizar licencia si se proporcionan datos
        if 'licenseNumber' in data or 'licenseExpiry' in data:
            licenses = driver.get('licenses', {})
            driving = licenses.get('driving', {})
            
            if 'licenseNumber' in data:
                driving['number'] = data['licenseNumber']
                
            if 'licenseExpiry' in data:
                try:
                    driving['expiration'] = datetime.strptime(data['licenseExpiry'], '%Y-%m-%d')
                except:
                    # Si hay error en el formato, no actualizar
                    pass
                    
            licenses['driving'] = driving
            update_data['licenses'] = licenses
            
        # Actualizar estado
        if 'status' in data:
            status = data['status']
            if status == 'active':
                update_data['active'] = True
                update_data['status'] = 'active'
            elif status == 'inactive':
                update_data['active'] = False
                update_data['status'] = 'inactive'
            elif status == 'pending':
                update_data['status'] = 'pending'
                
        # Actualizar tipo y empresa
        if 'type' in data:
            if data['type'] == 'company' and 'companyName' in data:
                update_data['company_name'] = data['companyName']
            elif data['type'] == 'private':
                # Eliminar campos de empresa si existe
                drivers_collection.update_one(
                    {'_id': ObjectId(driver_id)},
                    {'$unset': {'company_name': "", 'company_id': ""}}
                )
                
        # Actualizar especialidad
        if 'specialty' in data:
            specialties = []
            if data['specialty']:
                specialties.append(data['specialty'])
            update_data['specialties'] = specialties
            
        # Actualizar idiomas
        if 'languages' in data:
            languages = data['languages']
            if isinstance(languages, str):
                languages = [lang.strip() for lang in languages.split(',')]
            update_data['languages'] = languages
            
        # Actualizar rating si se proporciona
        if 'rating' in data:
            try:
                # Asegurar que el rating sea un valor numérico válido
                rating_value = float(data['rating'])
                if rating_value < 0 or rating_value > 5:
                    rating_value = max(0, min(5, rating_value))  # Limitar entre 0 y 5
                    
                ratings = driver.get('ratings', {})
                ratings['average'] = rating_value
                update_data['ratings'] = ratings
            except (ValueError, TypeError) as e:
                # Registrar el error pero continuar con otras actualizaciones
                print(f"Error al convertir rating: {str(e)}, valor recibido: {data['rating']}")
                # No actualizar el rating si hay error de conversión
            
        # Actualizar collaboratorId
        if 'collaboratorId' in data:
            update_data['collaborator_id'] = data['collaboratorId']
            
        # Realizar la actualización
        result = drivers_collection.update_one(
            {'_id': ObjectId(driver_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'message': 'No se realizaron cambios'}), 200
            
        return jsonify({'message': 'Chófer actualizado exitosamente'}), 200
    
    except Exception as e:
        return jsonify({'error': f'Error al actualizar el chófer: {str(e)}'}), 500

# Eliminar chófer
@drivers_bp.route('/<driver_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_driver(driver_id):
    current_user_id = get_jwt_identity()
    
    # Verificar si el usuario es administrador
    admin_user = users_collection.find_one({
        '_id': ObjectId(current_user_id),
        'role': 'admin'
    })
    
    if not admin_user:
        return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
    
    # Buscar chófer por ID
    driver = drivers_collection.find_one({'_id': ObjectId(driver_id)})
    
    if not driver:
        return jsonify({'error': 'Chófer no encontrado'}), 404
    
    try:
        # Eliminar asignaciones de vehículos primero
        driver_vehicle_assignments_collection.delete_many({'driver_id': driver_id})
        
        # Eliminar chófer
        result = drivers_collection.delete_one({'_id': ObjectId(driver_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'No se pudo eliminar el chófer'}), 500
        
        return jsonify({'message': 'Chófer eliminado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': f'Error al eliminar el chófer: {str(e)}'}), 500

# Obtener chóferes filtrados por collaborator_id
@drivers_bp.route('/by-collaborator/<collaborator_id>', methods=['GET'])
@jwt_required()
def get_drivers_by_collaborator(collaborator_id):
    current_user_id = get_jwt_identity()
    
    # Verificar si el usuario es administrador
    admin_user = users_collection.find_one({
        '_id': ObjectId(current_user_id),
        'role': 'admin'
    })
    
    if not admin_user:
        return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
    
    try:
        # Buscar chóferes por collaborator_id
        drivers_cursor = drivers_collection.find({'collaborator_id': collaborator_id})
        
        # Convertir a formato esperado por el frontend
        drivers_list = []
        for driver in drivers_cursor:
            # Determinar estado
            status = 'active' if driver.get('active', False) else 'inactive'
            if driver.get('status') == 'pending':
                status = 'pending'
                
            # Determinar tipo
            driver_type = 'company' if driver.get('company_id') else 'private'
                
            # Mapear campos
            driver_data = {
                'id': str(driver['_id']),
                'name': f"{driver.get('first_name', '')} {driver.get('last_name', '')}",
                'email': driver.get('email', ''),
                'phone': driver.get('phone', ''),
                'status': status,
                'specialty': driver.get('specialties', [])[0] if driver.get('specialties') and len(driver.get('specialties', [])) > 0 else '',
                'city': driver.get('city', '')
            }
            
            drivers_list.append(driver_data)
        
        return jsonify({'drivers': drivers_list}), 200
    
    except Exception as e:
        return jsonify({'error': f'Error al obtener chóferes por colaborador: {str(e)}'}), 500 