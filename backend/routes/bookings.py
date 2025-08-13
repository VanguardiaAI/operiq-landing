from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime, timedelta
import json
from pymongo.errors import PyMongoError
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.reservations import (
    reservations_collection, 
    validate_reservation, 
    generate_reservation_code
)
from services.availability import check_vehicle_availability_for_location
from utils.geo_utils import get_coordinates_from_address

# Crear el blueprint para las rutas de reservas
bookings_bp = Blueprint('bookings', __name__)

# Variable que se inicializará en setup_collections
admin_users_collection = None

def setup_collections(db):
    """Inicializa las colecciones necesarias para este módulo"""
    global admin_users_collection
    admin_users_collection = db['users']  # Colección de usuarios admin

# Endpoint para obtener todas las reservas (con paginación y filtros)
@bookings_bp.route('/list', methods=['GET'])
@jwt_required()
def get_all_reservations():
    """
    Obtiene todas las reservas con paginación y filtros
    Parámetros de consulta:
    - page: número de página (default 1)
    - per_page: resultados por página (default 10)
    - status: filtrar por estado
    - search: buscar por código o nombre del cliente
    - from_date: filtrar desde fecha
    - to_date: filtrar hasta fecha
    """
    try:
        # Get JWT identity
        current_user_id = get_jwt_identity()
        print(f"[DEBUG] get_all_reservations - JWT identity type: {type(current_user_id)}")
        print(f"[DEBUG] get_all_reservations - JWT identity value: {current_user_id}")
        
        # Handle different JWT identity formats
        if isinstance(current_user_id, dict):
            # If JWT identity is a dict, try to get 'id' or '_id' or 'sub'
            user_id = current_user_id.get('id') or current_user_id.get('_id') or current_user_id.get('sub')
            print(f"[DEBUG] Extracted user_id from dict: {user_id}")
        else:
            user_id = current_user_id
            print(f"[DEBUG] Using JWT identity as is: {user_id}")
        
        # Verificar si el usuario es administrador
        admin_user = admin_users_collection.find_one({
            '_id': ObjectId(user_id),
            'role': 'admin'
        })
        
        if not admin_user:
            print(f"[DEBUG] User {user_id} not found or not admin")
            return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403
        
        print(f"[DEBUG] Admin user found: {admin_user.get('email')}")
    except Exception as e:
        print(f"[DEBUG] Authentication error: {str(e)}")
        print(f"[DEBUG] Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Error de autenticación', 'details': str(e)}), 422
    
    try:
        # Parámetros de paginación
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        skip = (page - 1) * per_page
        
        # Parámetros de filtrado
        status = request.args.get('status')
        search = request.args.get('search')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        
        # Construir la consulta
        query = {}
        
        # Filtrar por estado
        if status:
            # Handle comma-separated statuses for filtering multiple states
            if ',' in status:
                status_list = [s.strip() for s in status.split(',')]
                query['status'] = {'$in': status_list}
            else:
                query['status'] = status
        
        # Buscar por código o cliente
        if search:
            query['$or'] = [
                {'code': {'$regex': search, '$options': 'i'}},
                {'client_name': {'$regex': search, '$options': 'i'}}
            ]
        
        # Filtrar por rango de fechas
        date_filter = {}
        if from_date:
            date_filter['$gte'] = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
        if to_date:
            date_filter['$lte'] = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
        if date_filter:
            query['pickup.date'] = date_filter
        
        # Contar total de resultados para la paginación
        total_reservations = reservations_collection.count_documents(query)
        
        # Obtener resultados paginados y ordenados por fecha de creación (más recientes primero)
        reservations = list(reservations_collection.find(query)
                          .sort('created_at', -1)
                          .skip(skip)
                          .limit(per_page))
        
        # Convertir ObjectId a string para la serialización JSON
        for reservation in reservations:
            # Función recursiva para convertir ObjectIds
            def convert_objectids(obj):
                if isinstance(obj, ObjectId):
                    return str(obj)
                elif isinstance(obj, dict):
                    return {k: convert_objectids(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_objectids(item) for item in obj]
                else:
                    return obj
            
            # Convertir todos los ObjectIds del documento
            for key, value in list(reservation.items()):
                reservation[key] = convert_objectids(value)
            
            # Formatear fechas para JSON
            for date_field in ['created_at', 'updated_at']:
                if date_field in reservation and isinstance(reservation[date_field], datetime):
                    reservation[date_field] = reservation[date_field].isoformat()
            
            # Formatear fechas anidadas
            if 'pickup' in reservation and 'date' in reservation['pickup']:
                if isinstance(reservation['pickup']['date'], datetime):
                    reservation['pickup']['date'] = reservation['pickup']['date'].isoformat()
            
            if 'dropoff' in reservation and 'estimated_date' in reservation['dropoff']:
                if reservation['dropoff']['estimated_date'] and isinstance(reservation['dropoff']['estimated_date'], datetime):
                    reservation['dropoff']['estimated_date'] = reservation['dropoff']['estimated_date'].isoformat()
        
        # Crear respuesta con metadatos de paginación
        response = {
            "reservations": reservations,
            "pagination": {
                "total": total_reservations,
                "page": page,
                "per_page": per_page,
                "pages": (total_reservations + per_page - 1) // per_page  # Redondear hacia arriba
            }
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"Error al obtener reservas: {str(e)}")
        return jsonify({"error": f"Error al obtener reservas: {str(e)}"}), 500

# Endpoint para crear una nueva reserva
@bookings_bp.route('/create', methods=['POST'])
@jwt_required()
def create_reservation():
    """Crea una nueva reserva desde el panel de administración"""
    try:
        # Obtener datos del request
        data = request.json
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400
        
        # Generar un código de reserva único
        data['code'] = generate_reservation_code()
        
        # Establecer fechas si no se proporcionaron
        if 'created_at' not in data:
            data['created_at'] = datetime.utcnow()
        if 'updated_at' not in data:
            data['updated_at'] = datetime.utcnow()
        
        # Validar que se proporcionaron los campos requeridos
        is_valid, message = validate_reservation(data)
        if not is_valid:
            return jsonify({"error": message}), 400
        
        # Convertir IDs a ObjectId si no son None
        for id_field in ['user_id', 'vehicle_id', 'driver_id', 'collaborator_id', 'created_by', 'route_id']:
            if id_field in data and data[id_field]:
                try:
                    data[id_field] = ObjectId(data[id_field])
                except:
                    # Si la conversión falla, dejar como estaba
                    pass
        
        # Convertir fechas de string a datetime si son string
        if 'pickup' in data and 'date' in data['pickup'] and isinstance(data['pickup']['date'], str):
            data['pickup']['date'] = datetime.fromisoformat(data['pickup']['date'].replace('Z', '+00:00'))
        
        if 'dropoff' in data and 'estimated_date' in data['dropoff'] and data['dropoff']['estimated_date'] and isinstance(data['dropoff']['estimated_date'], str):
            data['dropoff']['estimated_date'] = datetime.fromisoformat(data['dropoff']['estimated_date'].replace('Z', '+00:00'))
        
        # Verificar si se proporcionaron coordenadas de pickup
        pickup_coordinates = None
        if 'pickup' in data and 'coordinates' in data['pickup']:
            pickup_coordinates = data['pickup']['coordinates']
        # Si no hay coordenadas pero hay dirección, intentar obtener coordenadas
        elif 'pickup' in data and 'location' in data['pickup'] and not pickup_coordinates:
            pickup_coordinates = get_coordinates_from_address(data['pickup']['location'])
            # Si se obtuvieron coordenadas, añadirlas a los datos
            if pickup_coordinates:
                if 'pickup' not in data:
                    data['pickup'] = {}
                data['pickup']['coordinates'] = pickup_coordinates
        
        # Verificar disponibilidad de vehículos y choferes si se proporcionaron IDs
        if 'vehicle_id' in data and data['vehicle_id'] and 'driver_id' in data and data['driver_id']:
            pickup_date = data['pickup']['date'] if 'pickup' in data and 'date' in data['pickup'] else datetime.utcnow()
            estimated_duration = data.get('estimated_duration', 60)  # Default 60 minutos
            
            # Calcular fecha estimada de fin
            dropoff_date = None
            if 'dropoff' in data and 'estimated_date' in data['dropoff'] and data['dropoff']['estimated_date']:
                dropoff_date = data['dropoff']['estimated_date']
            else:
                # Si no se proporcionó, calcular basado en la duración
                dropoff_date = pickup_date + timedelta(minutes=estimated_duration)
            
            # Verificar disponibilidad para el tiempo específico
            from models.drivers_agenda import check_driver_availability
            driver_available = check_driver_availability(
                str(data['driver_id']), 
                pickup_date, 
                dropoff_date
            )
            
            # Verificar conflictos con reservas existentes
            from utils.geo_utils import check_reservation_conflicts
            has_conflicts = check_reservation_conflicts(
                reservations_collection.database,  # Pasar la base de datos actual
                str(data['driver_id']), 
                str(data['vehicle_id']), 
                pickup_date, 
                dropoff_date
            )
            
            # Si el chofer no está disponible o hay conflictos, devolver error
            if not driver_available:
                return jsonify({
                    "error": "El chofer seleccionado no está disponible para el horario solicitado",
                    "driver_id": str(data['driver_id']),
                    "pickup_date": pickup_date.isoformat(),
                    "dropoff_date": dropoff_date.isoformat()
                }), 400
            
            if has_conflicts:
                return jsonify({
                    "error": "El chofer o vehículo seleccionado ya tiene una reserva para el horario solicitado",
                    "driver_id": str(data['driver_id']),
                    "vehicle_id": str(data['vehicle_id']),
                    "pickup_date": pickup_date.isoformat(),
                    "dropoff_date": dropoff_date.isoformat()
                }), 400
        
        # Insertar la reserva en la base de datos
        result = reservations_collection.insert_one(data)
        
        # Obtener la reserva recién creada
        new_reservation = reservations_collection.find_one({"_id": result.inserted_id})
        
        # Preparar respuesta
        new_reservation['_id'] = str(new_reservation['_id'])
        if 'user_id' in new_reservation and new_reservation['user_id']:
            new_reservation['user_id'] = str(new_reservation['user_id'])
        if 'driver_id' in new_reservation and new_reservation['driver_id']:
            new_reservation['driver_id'] = str(new_reservation['driver_id'])
        if 'vehicle_id' in new_reservation and new_reservation['vehicle_id']:
            new_reservation['vehicle_id'] = str(new_reservation['vehicle_id'])
        if 'created_by' in new_reservation and new_reservation['created_by']:
            new_reservation['created_by'] = str(new_reservation['created_by'])
        
        # Formatear fechas para JSON
        for date_field in ['created_at', 'updated_at']:
            if date_field in new_reservation and isinstance(new_reservation[date_field], datetime):
                new_reservation[date_field] = new_reservation[date_field].isoformat()
        
        # Formatear fechas anidadas
        if 'pickup' in new_reservation and 'date' in new_reservation['pickup']:
            if isinstance(new_reservation['pickup']['date'], datetime):
                new_reservation['pickup']['date'] = new_reservation['pickup']['date'].isoformat()
        
        if 'dropoff' in new_reservation and 'estimated_date' in new_reservation['dropoff']:
            if new_reservation['dropoff']['estimated_date'] and isinstance(new_reservation['dropoff']['estimated_date'], datetime):
                new_reservation['dropoff']['estimated_date'] = new_reservation['dropoff']['estimated_date'].isoformat()
        
        return jsonify({
            "message": "Reserva creada con éxito",
            "reservation": new_reservation
        }), 201
    
    except PyMongoError as e:
        print(f"Error de MongoDB al crear reserva: {str(e)}")
        return jsonify({"error": f"Error de base de datos: {str(e)}"}), 500
    except Exception as e:
        print(f"Error al crear reserva: {str(e)}")
        return jsonify({"error": f"Error al crear reserva: {str(e)}"}), 500

# Endpoint para obtener una reserva específica
@bookings_bp.route('/<reservation_id>', methods=['GET'])
@jwt_required()
def get_reservation(reservation_id):
    """Obtiene los detalles de una reserva específica"""
    try:
        # Buscar reserva por ID
        try:
            reservation = reservations_collection.find_one({"_id": ObjectId(reservation_id)})
        except:
            # Si el ID no es un ObjectId válido, buscar por código
            reservation = reservations_collection.find_one({"code": reservation_id})
        
        if not reservation:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # Convertir ObjectId a string para la serialización JSON
        reservation['_id'] = str(reservation['_id'])
        if 'user_id' in reservation and reservation['user_id']:
            reservation['user_id'] = str(reservation['user_id'])
        if 'driver_id' in reservation and reservation['driver_id']:
            reservation['driver_id'] = str(reservation['driver_id'])
        if 'vehicle_id' in reservation and reservation['vehicle_id']:
            reservation['vehicle_id'] = str(reservation['vehicle_id'])
        if 'created_by' in reservation and reservation['created_by']:
            reservation['created_by'] = str(reservation['created_by'])
        
        # Formatear fechas para JSON
        for date_field in ['created_at', 'updated_at']:
            if date_field in reservation and isinstance(reservation[date_field], datetime):
                reservation[date_field] = reservation[date_field].isoformat()
        
        # Formatear fechas anidadas
        if 'pickup' in reservation and 'date' in reservation['pickup']:
            if isinstance(reservation['pickup']['date'], datetime):
                reservation['pickup']['date'] = reservation['pickup']['date'].isoformat()
        
        if 'dropoff' in reservation and 'estimated_date' in reservation['dropoff']:
            if reservation['dropoff']['estimated_date'] and isinstance(reservation['dropoff']['estimated_date'], datetime):
                reservation['dropoff']['estimated_date'] = reservation['dropoff']['estimated_date'].isoformat()
        
        return jsonify(reservation), 200
    
    except Exception as e:
        print(f"Error al obtener reserva: {str(e)}")
        return jsonify({"error": f"Error al obtener reserva: {str(e)}"}), 500

# Endpoint para actualizar una reserva existente
@bookings_bp.route('/<reservation_id>/update', methods=['PUT'])
@jwt_required()
def update_reservation(reservation_id):
    """Actualiza una reserva existente"""
    try:
        # Obtener datos del request
        data = request.json
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400
        
        # Verificar si la reserva existe
        try:
            existing = reservations_collection.find_one({"_id": ObjectId(reservation_id)})
        except:
            # Si el ID no es un ObjectId válido, buscar por código
            existing = reservations_collection.find_one({"code": reservation_id})
            
        if not existing:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # No permitir cambiar el código
        if 'code' in data:
            del data['code']
        
        # Actualizar la fecha de modificación
        data['updated_at'] = datetime.utcnow()
        
        # Convertir IDs a ObjectId si no son None
        for id_field in ['user_id', 'vehicle_id', 'driver_id', 'collaborator_id', 'created_by', 'route_id']:
            if id_field in data and data[id_field]:
                try:
                    data[id_field] = ObjectId(data[id_field])
                except:
                    # Si la conversión falla, dejar como estaba
                    pass
        
        # Convertir fechas de string a datetime si son string
        if 'pickup' in data and 'date' in data['pickup'] and isinstance(data['pickup']['date'], str):
            data['pickup']['date'] = datetime.fromisoformat(data['pickup']['date'].replace('Z', '+00:00'))
        
        if 'dropoff' in data and 'estimated_date' in data['dropoff'] and data['dropoff']['estimated_date'] and isinstance(data['dropoff']['estimated_date'], str):
            data['dropoff']['estimated_date'] = datetime.fromisoformat(data['dropoff']['estimated_date'].replace('Z', '+00:00'))
        
        # Actualizar la reserva en la base de datos
        result = reservations_collection.update_one(
            {"_id": existing['_id']},
            {"$set": data}
        )
        
        if result.modified_count == 0:
            return jsonify({"message": "No se realizaron cambios"}), 200
        
        # Obtener la reserva actualizada
        updated_reservation = reservations_collection.find_one({"_id": existing['_id']})
        
        # Preparar respuesta
        updated_reservation['_id'] = str(updated_reservation['_id'])
        if 'user_id' in updated_reservation and updated_reservation['user_id']:
            updated_reservation['user_id'] = str(updated_reservation['user_id'])
        if 'driver_id' in updated_reservation and updated_reservation['driver_id']:
            updated_reservation['driver_id'] = str(updated_reservation['driver_id'])
        if 'vehicle_id' in updated_reservation and updated_reservation['vehicle_id']:
            updated_reservation['vehicle_id'] = str(updated_reservation['vehicle_id'])
        if 'created_by' in updated_reservation and updated_reservation['created_by']:
            updated_reservation['created_by'] = str(updated_reservation['created_by'])
        
        # Formatear fechas para JSON
        for date_field in ['created_at', 'updated_at']:
            if date_field in updated_reservation and isinstance(updated_reservation[date_field], datetime):
                updated_reservation[date_field] = updated_reservation[date_field].isoformat()
        
        # Formatear fechas anidadas
        if 'pickup' in updated_reservation and 'date' in updated_reservation['pickup']:
            if isinstance(updated_reservation['pickup']['date'], datetime):
                updated_reservation['pickup']['date'] = updated_reservation['pickup']['date'].isoformat()
        
        if 'dropoff' in updated_reservation and 'estimated_date' in updated_reservation['dropoff']:
            if updated_reservation['dropoff']['estimated_date'] and isinstance(updated_reservation['dropoff']['estimated_date'], datetime):
                updated_reservation['dropoff']['estimated_date'] = updated_reservation['dropoff']['estimated_date'].isoformat()
        
        return jsonify({
            "message": "Reserva actualizada con éxito",
            "reservation": updated_reservation
        }), 200
    
    except PyMongoError as e:
        print(f"Error de MongoDB al actualizar reserva: {str(e)}")
        return jsonify({"error": f"Error de base de datos: {str(e)}"}), 500
    except Exception as e:
        print(f"Error al actualizar reserva: {str(e)}")
        return jsonify({"error": f"Error al actualizar reserva: {str(e)}"}), 500

# Endpoint para cambiar el estado de una reserva
@bookings_bp.route('/<reservation_id>/status', methods=['PUT'])
@jwt_required()
def update_reservation_status(reservation_id):
    """Actualiza el estado de una reserva"""
    try:
        # Obtener datos del request
        data = request.json
        
        if not data or 'status' not in data:
            return jsonify({"error": "Se requiere el nuevo estado"}), 400
        
        # Verificar que el estado sea válido
        new_status = data['status']
        valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']
        
        if new_status not in valid_statuses:
            return jsonify({"error": f"Estado no válido. Debe ser uno de: {', '.join(valid_statuses)}"}), 400
        
        # Verificar si la reserva existe
        try:
            existing = reservations_collection.find_one({"_id": ObjectId(reservation_id)})
        except:
            # Si el ID no es un ObjectId válido, buscar por código
            existing = reservations_collection.find_one({"code": reservation_id})
            
        if not existing:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # Datos para la actualización
        update_data = {
            'status': new_status,
            'updated_at': datetime.utcnow(),
            'status_indicators': existing.get('status_indicators', []) + [f"changed_to_{new_status}"]
        }
        
        # Agregar campos adicionales según el nuevo estado
        if new_status == 'confirmed':
            update_data['confirmation'] = {
                'timestamp': datetime.utcnow(),
                'by': data.get('by', 'admin'),
                'notes': data.get('notes', '')
            }
        elif new_status == 'in_progress':
            update_data['trip_start'] = {
                'timestamp': datetime.utcnow(),
                'location': data.get('location', None),
                'notes': data.get('notes', '')
            }
        elif new_status == 'completed':
            update_data['trip_end'] = {
                'timestamp': datetime.utcnow(),
                'location': data.get('location', None),
                'notes': data.get('notes', ''),
                'rating': data.get('rating', None)
            }
            if data.get('actual_dropoff_time'):
                update_data['actual_dropoff_time'] = datetime.fromisoformat(data['actual_dropoff_time'].replace('Z', '+00:00'))
            else:
                update_data['actual_dropoff_time'] = datetime.utcnow()
        elif new_status == 'cancelled':
            update_data['cancellation'] = {
                'timestamp': datetime.utcnow(),
                'reason': data.get('reason', 'No especificado'),
                'by': data.get('by', 'admin'),
                'notes': data.get('notes', '')
            }
        
        # Actualizar la reserva en la base de datos
        result = reservations_collection.update_one(
            {"_id": existing['_id']},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({"message": "No se realizaron cambios"}), 200
        
        return jsonify({
            "message": f"Estado de reserva actualizado a '{new_status}'",
            "reservation_id": str(existing['_id']),
            "code": existing['code'],
            "previous_status": existing['status'],
            "new_status": new_status
        }), 200
    
    except Exception as e:
        print(f"Error al actualizar estado de reserva: {str(e)}")
        return jsonify({"error": f"Error al actualizar estado de reserva: {str(e)}"}), 500

# Endpoint para eliminar una reserva (solo para fines administrativos, normalmente se cambia el estado a 'cancelled')
@bookings_bp.route('/<reservation_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_reservation(reservation_id):
    """Elimina una reserva (solo para fines administrativos)"""
    try:
        # Verificar si la reserva existe
        try:
            existing = reservations_collection.find_one({"_id": ObjectId(reservation_id)})
        except:
            # Si el ID no es un ObjectId válido, buscar por código
            existing = reservations_collection.find_one({"code": reservation_id})
            
        if not existing:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        # Eliminar la reserva de la base de datos
        result = reservations_collection.delete_one({"_id": existing['_id']})
        
        if result.deleted_count == 0:
            return jsonify({"error": "No se pudo eliminar la reserva"}), 500
        
        return jsonify({
            "message": f"Reserva {existing['code']} eliminada con éxito"
        }), 200
    
    except Exception as e:
        print(f"Error al eliminar reserva: {str(e)}")
        return jsonify({"error": f"Error al eliminar reserva: {str(e)}"}), 500

# Endpoint para obtener estadísticas de reservas
@bookings_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_booking_stats():
    """Obtiene estadísticas generales de reservas"""
    try:
        # Get JWT identity and verify admin role
        current_user_id = get_jwt_identity()
        
        # Handle different JWT identity formats
        if isinstance(current_user_id, dict):
            user_id = current_user_id.get('id') or current_user_id.get('_id') or current_user_id.get('sub')
        else:
            user_id = current_user_id
        
        # Verificar si el usuario es administrador
        admin_user = admin_users_collection.find_one({
            '_id': ObjectId(user_id),
            'role': 'admin'
        })
        
        if not admin_user:
            return jsonify({'error': 'No autorizado. Se requieren permisos de administrador'}), 403

        # Obtener estadísticas generales
        total_reservations = reservations_collection.count_documents({})
        
        # Contar por estado
        status_counts = {}
        statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']
        
        for status in statuses:
            count = reservations_collection.count_documents({'status': status})
            status_counts[status] = count
        
        # Contar reservas activas (no completadas ni canceladas)
        active_statuses = ['pending', 'confirmed', 'in_progress']
        active_count = reservations_collection.count_documents({'status': {'$in': active_statuses}})
        
        # Contar historial (completadas, canceladas, no show)
        history_statuses = ['completed', 'cancelled', 'no_show']
        history_count = reservations_collection.count_documents({'status': {'$in': history_statuses}})
        
        # Reservas de hoy
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        today_count = reservations_collection.count_documents({
            'pickup.date': {
                '$gte': today_start,
                '$lt': today_end
            }
        })
        
        # Contar incidencias (reservas con incident_history)
        incidents_count = reservations_collection.count_documents({
            'incident_history': {'$exists': True, '$ne': []}
        })
        
        return jsonify({
            'total': total_reservations,
            'active': active_count,
            'history': history_count,
            'today': today_count,
            'incidents': incidents_count,
            'by_status': status_counts
        }), 200
        
    except Exception as e:
        print(f"Error al obtener estadísticas de reservas: {str(e)}")
        return jsonify({"error": f"Error al obtener estadísticas: {str(e)}"}), 500

# Nuevo endpoint para buscar vehículos disponibles para una reserva
@bookings_bp.route('/available-vehicles', methods=['POST'])
@jwt_required()
def find_available_vehicles():
    """
    Busca vehículos disponibles para una reserva
    
    Espera:
    - pickup_location: Dirección de recogida
    - pickup_date: Fecha y hora de recogida (ISO format)
    - estimated_duration: Duración estimada en minutos (opcional)
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400
        
        # Verificar campos requeridos
        if not data.get('pickup_location'):
            return jsonify({"error": "Se requiere ubicación de recogida"}), 400
        
        if not data.get('pickup_date'):
            return jsonify({"error": "Se requiere fecha y hora de recogida"}), 400
        
        # Obtener coordenadas de la dirección
        pickup_location = data.get('pickup_location')
        coordinates = None
        
        # Verificar si la ubicación ya contiene coordenadas
        if isinstance(pickup_location, dict) and 'coordinates' in pickup_location:
            coordinates = pickup_location['coordinates']
        else:
            # Intentar obtener coordenadas desde la dirección
            coordinates = get_coordinates_from_address(
                pickup_location if isinstance(pickup_location, str) else pickup_location.get('description', '')
            )
        
        if not coordinates:
            return jsonify({"error": "No se pudieron obtener coordenadas para la ubicación proporcionada"}), 400
        
        # Convertir fecha string a datetime
        try:
            pickup_date = datetime.fromisoformat(data.get('pickup_date').replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"error": "Formato de fecha inválido. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
        
        # Obtener duración estimada
        estimated_duration = int(data.get('estimated_duration', 60))
        
        # Buscar vehículos disponibles
        availability_result = check_vehicle_availability_for_location(
            admin_users_collection.database,  # Pasar la base de datos
            pickup_location if isinstance(pickup_location, str) else pickup_location.get('description', 'Dirección no especificada'),
            coordinates,
            pickup_date,
            estimated_duration
        )
        
        return jsonify(availability_result), 200
        
    except Exception as e:
        print(f"Error al buscar vehículos disponibles: {str(e)}")
        return jsonify({"error": f"Error al buscar vehículos disponibles: {str(e)}"}), 500 