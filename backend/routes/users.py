from flask import Blueprint, request, jsonify
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity
import datetime

# Crear blueprint para las rutas de usuarios
users_bp = Blueprint("users", __name__)

# Referencia a la colección de usuarios (se inicializará en setup_collections)
users_collection = None

# Configurar colecciones de MongoDB
def setup_collections(db):
    global users_collection
    users_collection = db['users']

# Obtener todos los usuarios (sólo para administradores)
@users_bp.route('/list', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    
    # Verificar si el usuario es administrador
    admin_user = users_collection.find_one({
        '_id': ObjectId(current_user_id),
        'role': 'admin'
    })
    
    if not admin_user:
        return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
    
    # Obtener parámetros de consulta para filtrado
    role_filter = request.args.get('role', '')
    status_filter = request.args.get('status', '')
    search_query = request.args.get('search', '')
    tag_filter = request.args.get('tag', '')
    
    # Construir filtro de consulta
    query = {}
    
    if role_filter and role_filter != 'all':
        query['role'] = role_filter
        
    if status_filter and status_filter != 'all':
        query['status'] = status_filter
    
    if tag_filter and tag_filter != 'all':
        query['tags'] = tag_filter
    
    if search_query:
        # Búsqueda por nombre, email o ID
        query['$or'] = [
            {'name': {'$regex': search_query, '$options': 'i'}},
            {'email': {'$regex': search_query, '$options': 'i'}},
            {'_id': {'$regex': search_query, '$options': 'i'} if ObjectId.is_valid(search_query) else ''}
        ]
    
    # Obtener usuarios filtrados
    users_cursor = users_collection.find(query)
    
    # Convertir a formato esperado por el frontend
    users_list = []
    for user in users_cursor:
        # Calcular estadísticas de reservas (pendiente de implementar)
        total_spent = 0
        bookings_count = 0
        last_booking_date = None
        
        # TODO: Obtener estadísticas de la colección de reservas
        
        # Preparar usuario para el frontend
        user_data = {
            'id': str(user['_id']),
            'name': user.get('name', ''),
            'email': user.get('email', ''),
            'role': user.get('role', 'user'),
            'status': user.get('status', 'active'),
            'created_at': user.get('created_at').strftime('%Y-%m-%d') if 'created_at' in user else '',
            'avatar': user.get('avatar', ''),
            'tags': user.get('tags', []),
            'totalSpent': total_spent,
            'bookingsCount': bookings_count,
            'lastBookingDate': last_booking_date
        }
        users_list.append(user_data)
    
    return jsonify({'users': users_list}), 200

# Obtener detalles de un usuario específico
@users_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    current_user_id = get_jwt_identity()
    
    # Verificar si el usuario es administrador
    admin_user = users_collection.find_one({
        '_id': ObjectId(current_user_id),
        'role': 'admin'
    })
    
    if not admin_user:
        return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
    
    # Buscar usuario por ID
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Obtener datos adicionales (preferencias, destinos favoritos, etc.)
    # Esto puede obtenerse de otras colecciones si es necesario
    
    # Convertir a formato UserExtended para el frontend
    user_data = {
        'id': str(user['_id']),
        'name': user.get('name', ''),
        'email': user.get('email', ''),
        'role': user.get('role', 'user'),
        'status': user.get('status', 'active'),
        'created_at': user.get('created_at').strftime('%Y-%m-%d') if 'created_at' in user else '',
        'avatar': user.get('avatar', ''),
        'tags': user.get('tags', []),
        'profile_completed': user.get('profile_completed', False),
        'profile': user.get('profile', {}),
        'is_company': user.get('is_company', False),
        'company_profile': user.get('company_profile', {}),
        'totalSpent': 0,  # TODO: Calcular desde reservas
        'bookingsCount': 0,  # TODO: Calcular desde reservas
        'lastBookingDate': None,  # TODO: Obtener desde reservas
        'favoriteDestinations': [],  # TODO: Calcular desde reservas
        'preferences': {
            'vehicleType': user.get('preferences', {}).get('vehicleType', ''),
            'paymentMethod': user.get('preferences', {}).get('paymentMethod', ''),
            'notifications': user.get('preferences', {}).get('notifications', True)
        }
    }
    
    return jsonify({'user': user_data}), 200

# Crear nuevo usuario (sólo administradores)
@users_bp.route('/create', methods=['POST'])
@jwt_required()
def create_user():
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
    if not data or 'email' not in data or 'name' not in data or 'role' not in data:
        return jsonify({'error': 'Se requieren email, name y role'}), 400
    
    # Verificar si el usuario ya existe
    existing_user = users_collection.find_one({'email': data['email']})
    if existing_user:
        return jsonify({'error': 'El usuario ya existe'}), 409
    
    # Generar contraseña aleatoria temporal si se proporciona
    password = data.get('password', '')
    if password:
        from flask_bcrypt import Bcrypt
        bcrypt = Bcrypt()
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    else:
        hashed_password = ''
    
    # Crear nuevo usuario con campos básicos
    new_user = {
        'email': data['email'],
        'password': hashed_password,
        'name': data['name'],
        'role': data['role'],
        'status': data.get('status', 'active'),
        'created_at': datetime.datetime.now(),
        'profile_completed': False,
        'tags': data.get('tags', [])
    }
    
    # Configurar perfil según el tipo de usuario
    if data['role'] == 'user':
        new_user['profile'] = {
            'title': data.get('title', ''),
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', ''),
            'phone': data.get('phone', ''),
            'country_code': data.get('country_code', ''),
            'address': data.get('address', '')
        }
        
        # Si se proporcionaron campos de perfil, marcar como completo
        if any([data.get('first_name'), data.get('last_name'), data.get('phone')]):
            new_user['profile_completed'] = True
    
    # Si es una empresa, agregar perfil de empresa
    elif data['role'] == 'company':
        new_user['is_company'] = True
        new_user['profile'] = {
            'title': data.get('title', ''),
            'first_name': data.get('representativeFirstName', ''),
            'last_name': data.get('representativeLastName', ''),
            'phone': data.get('phoneNumber', ''),
            'country_code': '',
            'address': data.get('location', '')
        }
        
        new_user['company_profile'] = {
            'companyName': data.get('companyName', ''),
            'phoneNumber': data.get('phoneNumber', ''),
            'country': data.get('country', ''),
            'location': data.get('location', ''),
            'companySize': data.get('companySize', ''),
            'hearAbout': data.get('hearAbout', ''),
            'additionalInfo': data.get('additionalInfo', ''),
            'representativeInfo': {
                'firstName': data.get('representativeFirstName', ''),
                'lastName': data.get('representativeLastName', ''),
                'email': data['email']
            },
            'isCompany': True
        }
        
        # Si se proporcionaron campos de perfil de empresa, marcar como completo
        if data.get('companyName') and data.get('phoneNumber'):
            new_user['profile_completed'] = True
    
    # Guardar en la base de datos
    result = users_collection.insert_one(new_user)
    
    response_user = {
        'id': str(result.inserted_id),
        'name': data['name'],
        'email': data['email'],
        'role': data['role'],
        'status': data.get('status', 'active')
    }
    
    # Agregar campos adicionales a la respuesta según el tipo de usuario
    if data['role'] == 'user':
        response_user['profile'] = new_user['profile']
    elif data['role'] == 'company':
        response_user['profile'] = new_user['profile']
        response_user['company_profile'] = new_user['company_profile']
    
    return jsonify({
        'message': 'Usuario creado exitosamente',
        'user': response_user
    }), 201

# Actualizar usuario existente
@users_bp.route('/<user_id>/update', methods=['PUT'])
@jwt_required()
def update_user(user_id):
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
    
    # Buscar usuario por ID
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Bloquear la edición de administradores
    if user.get('role') == 'admin':
        return jsonify({'error': 'Los administradores no pueden ser editados'}), 403
    
    # Crear objeto de actualización
    update_data = {}
    
    # Actualizar campos básicos
    if 'name' in data:
        update_data['name'] = data['name']
    
    if 'email' in data:
        update_data['email'] = data['email']
    
    if 'status' in data:
        update_data['status'] = data['status']
    
    # Manejo para usuarios regulares
    if user.get('role') == 'user':
        # Actualizar campos de perfil
        profile_update = {}
        
        profile_fields = ['title', 'first_name', 'last_name', 'phone', 'country_code', 'address']
        for field in profile_fields:
            if field in data:
                profile_update[field] = data[field]
        
        if profile_update:
            update_data['profile'] = profile_update
            update_data['profile_completed'] = True
    
    # Manejo para empresas
    elif user.get('role') == 'company':
        # Actualizar perfil de empresa
        company_profile_update = {}
        
        company_fields = ['companyName', 'phoneNumber', 'country', 'location', 
                          'companySize', 'hearAbout', 'additionalInfo']
        for field in company_fields:
            if field in data:
                company_profile_update[field] = data[field]
        
        # Actualizar info del representante
        if any(key in data for key in ['representativeFirstName', 'representativeLastName', 'representativeEmail']):
            rep_info = {}
            
            if 'representativeFirstName' in data:
                rep_info['firstName'] = data['representativeFirstName']
            
            if 'representativeLastName' in data:
                rep_info['lastName'] = data['representativeLastName']
            
            if 'representativeEmail' in data:
                rep_info['email'] = data['representativeEmail']
            
            if rep_info:
                company_profile_update['representativeInfo'] = rep_info
        
        if company_profile_update:
            update_data['company_profile'] = company_profile_update
            update_data['profile_completed'] = True
    
    # Actualizar en la base de datos
    if update_data:
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'No se pudo actualizar el usuario'}), 500
    
    # Obtener usuario actualizado
    updated_user = users_collection.find_one({'_id': ObjectId(user_id)})
    
    return jsonify({
        'message': 'Usuario actualizado exitosamente',
        'user': {
            'id': str(updated_user['_id']),
            'name': updated_user.get('name', ''),
            'email': updated_user.get('email', ''),
            'role': updated_user.get('role', 'user'),
            'status': updated_user.get('status', 'active'),
            'profile': updated_user.get('profile', {}),
            'company_profile': updated_user.get('company_profile', {}) if updated_user.get('role') == 'company' else None
        }
    }), 200

# Eliminar usuario
@users_bp.route('/<user_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    
    # Verificar si el usuario es administrador
    admin_user = users_collection.find_one({
        '_id': ObjectId(current_user_id),
        'role': 'admin'
    })
    
    if not admin_user:
        return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
    
    # Buscar usuario por ID
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Eliminar usuario
    result = users_collection.delete_one({'_id': ObjectId(user_id)})
    
    if result.deleted_count == 0:
        return jsonify({'error': 'No se pudo eliminar el usuario'}), 500
    
    return jsonify({'message': 'Usuario eliminado exitosamente'}), 200

# Asignar o eliminar etiqueta
@users_bp.route('/<user_id>/tags', methods=['POST'])
@jwt_required()
def manage_tags(user_id):
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
    
    if not data or 'action' not in data or 'tag' not in data:
        return jsonify({'error': 'Se requieren action y tag'}), 400
    
    action = data['action']  # 'add' o 'remove'
    tag = data['tag']
    
    # Buscar usuario por ID
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Realizar acción según el tipo
    if action == 'add':
        # Añadir etiqueta si no existe
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$addToSet': {'tags': tag}}
        )
    elif action == 'remove':
        # Eliminar etiqueta
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$pull': {'tags': tag}}
        )
    else:
        return jsonify({'error': 'Acción no válida. Use "add" o "remove"'}), 400
    
    # Obtener usuario actualizado
    updated_user = users_collection.find_one({'_id': ObjectId(user_id)})
    
    return jsonify({
        'message': 'Etiquetas actualizadas exitosamente',
        'tags': updated_user.get('tags', [])
    }), 200 