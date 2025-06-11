from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import datetime
import uuid

# Colecciones de MongoDB
fixed_routes_collection = None
flexible_zones_collection = None

routes_bp = Blueprint('routes', __name__)

# Inicializar colecciones
def setup_collections(db):
    global fixed_routes_collection
    global flexible_zones_collection
    
    fixed_routes_collection = db['fixed_routes']
    flexible_zones_collection = db['flexible_zones']
    
    # Crear índices si es necesario
    fixed_routes_collection.create_index([("origin.location", "2dsphere")])
    fixed_routes_collection.create_index([("destination.location", "2dsphere")])
    flexible_zones_collection.create_index([("center.location", "2dsphere")])

# Función auxiliar para convertir ObjectId a str en documentos
def convert_objectids(doc):
    if isinstance(doc, dict):
        for k, v in list(doc.items()):
            if isinstance(v, ObjectId):
                doc[k] = str(v)
            elif isinstance(v, dict):
                convert_objectids(v)
            elif isinstance(v, list):
                for item in v:
                    if isinstance(item, dict):
                        convert_objectids(item)
    return doc

# Función auxiliar para obtener datos de un conductor por ID
def get_driver_by_id(driver_id):
    try:
        # Obtener la colección de conductores
        from app import drivers_collection
        
        # Si el driver_id es una cadena, convertirlo a ObjectId
        if isinstance(driver_id, str):
            driver_id = ObjectId(driver_id)
            
        # Buscar el conductor en la base de datos
        driver = drivers_collection.find_one({'_id': driver_id})
        
        if not driver:
            print(f"Conductor no encontrado para ID: {driver_id}")
            return None
        
        # Convertir a formato para incluir en respuesta
        # Crear nombre completo a partir de first_name y last_name
        full_name = f"{driver.get('first_name', '')} {driver.get('last_name', '')}".strip()
        
        return {
            "id": str(driver['_id']),
            "name": full_name or 'Sin nombre',
            "photo": driver.get('profile_image', '')
        }
        
    except Exception as e:
        print(f"Error al obtener conductor {driver_id}: {str(e)}")
        return None

# Función auxiliar para buscar y adjuntar conductores a vehículos en rutas
def attach_drivers_to_vehicles(vehicles_data):
    """Busca y adjunta información de conductor a cada vehículo usando associatedDrivers"""
    from app import vehicles_collection
    
    for vehicle in vehicles_data:
        if 'id' not in vehicle:
            continue
            
        try:
            # Obtener el vehículo completo para acceder a associatedDrivers
            db_vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle['id'])})
            
            if not db_vehicle or 'associatedDrivers' not in db_vehicle or not db_vehicle['associatedDrivers']:
                continue
                
            # Tomar el primer conductor asociado
            driver_id = db_vehicle['associatedDrivers'][0]
            driver_data = get_driver_by_id(driver_id)
            
            if driver_data:
                # Adjuntar datos del conductor al vehículo
                vehicle['driver'] = driver_data
                
        except Exception as e:
            print(f"Error al adjuntar conductor a vehículo {vehicle['id']}: {str(e)}")
            
    return vehicles_data

# RUTAS FIJAS
@routes_bp.route('/fixed/list', methods=['GET'])
@jwt_required()
def list_fixed_routes():
    try:
        # Obtener parámetros de filtro opcionales
        filters = {}
        status = request.args.get('status')
        collaborator_id = request.args.get('collaborator_id')
        
        if status:
            filters['status'] = status
        if collaborator_id:
            filters['collaborator_id'] = collaborator_id
            
        # Obtener todas las rutas fijas que coincidan con los filtros
        routes = list(fixed_routes_collection.find(filters))
        
        # Convertir ObjectId a string
        routes = [convert_objectids(route) for route in routes]
        
        return jsonify({
            "status": "success",
            "routes": routes
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al obtener las rutas fijas: {str(e)}"
        }), 500

@routes_bp.route('/fixed/<route_id>', methods=['GET'])
@jwt_required()
def get_fixed_route(route_id):
    try:
        # Buscar la ruta por ID
        route = fixed_routes_collection.find_one({"_id": ObjectId(route_id)})
        
        if not route:
            return jsonify({
                "status": "error",
                "message": "Ruta no encontrada"
            }), 404
            
        # Convertir ObjectId a string
        route = convert_objectids(route)
        
        return jsonify({
            "status": "success",
            "route": route
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al obtener la ruta: {str(e)}"
        }), 500

@routes_bp.route('/fixed/create', methods=['POST'])
@jwt_required()
def create_fixed_route():
    try:
        # Obtener datos de la solicitud
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['name', 'origin', 'destination', 'pricing', 'availability']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "message": f"El campo '{field}' es requerido"
                }), 400
        
        # Validar que haya al menos un vehículo (sea en vehicle o en vehicles)
        if 'vehicle' not in data and ('vehicles' not in data or not data['vehicles']):
            return jsonify({
                "status": "error",
                "message": "Se requiere al menos un vehículo"
            }), 400
        
        # Crear estructura de la ruta
        new_route = {
            "name": data['name'],
            "origin": {
                "name": data['origin']['name'],
                "location": data['origin']['location']
            },
            "destination": {
                "name": data['destination']['name'],
                "location": data['destination']['location']
            },
            "pricing": {
                "standard": data['pricing']['standard'],
                "night": data['pricing'].get('night', 0),
                "holiday": data['pricing'].get('holiday', 0),
                "currency": data['pricing']['currency']
            },
            "availability": {
                "timeSlots": data['availability']['timeSlots'],
                "days": data['availability']['days']
            },
            "status": data.get('status', 'draft'),
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }
        
        # Añadir vehículo individual (compatible con versión anterior)
        if 'vehicle' in data:
            new_route["vehicle"] = {
                "id": data['vehicle']['id'],
                "licensePlate": data['vehicle']['licensePlate'],
                "model": data['vehicle']['model'],
                "imageUrl": data['vehicle'].get('imageUrl', "")
            }
        
        # Añadir array de vehículos si está presente
        if 'vehicles' in data and isinstance(data['vehicles'], list) and data['vehicles']:
            # Asegurarse de que cada vehículo tenga un valor en el campo model
            validated_vehicles = []
            for vehicle in data['vehicles']:
                if not vehicle.get('model') or vehicle.get('model').strip() == '':
                    # Si el modelo está vacío, usar la placa como fallback
                    vehicle['model'] = f"Vehículo {vehicle.get('licensePlate', 'sin placa')}"
                validated_vehicles.append(vehicle)
                
            # Buscar y adjuntar información de conductores
            validated_vehicles = attach_drivers_to_vehicles(validated_vehicles)
            new_route["vehicles"] = validated_vehicles
            
            # Obtener conductores de los vehículos
            drivers = []
            for vehicle in validated_vehicles:
                if 'driver' in vehicle and vehicle['driver']:
                    drivers.append(vehicle['driver'])
                    
            if drivers:
                new_route["drivers"] = drivers
                # Para compatibilidad, usar el primer conductor
                new_route["driver"] = drivers[0]
        
        # Añadir campo de conductor individual si está presente explícitamente
        elif 'driver' in data and data['driver']:
            new_route["driver"] = {
                "id": data['driver']['id'],
                "name": data['driver']['name'],
                "photo": data['driver'].get('photo', "")
            }
            
        # Añadir array de conductores si está presente explícitamente
        elif 'drivers' in data and isinstance(data['drivers'], list) and data['drivers']:
            new_route["drivers"] = data['drivers']
        
        # Añadir collaboratorId si está presente
        if 'collaboratorId' in data:
            new_route["collaboratorId"] = data['collaboratorId']
            
        # Añadir distancia y tiempo estimado si están disponibles
        if 'distance' in data:
            new_route["distance"] = data['distance']
        if 'estimatedTime' in data:
            new_route["estimatedTime"] = data['estimatedTime']
            
        # Insertar la nueva ruta en la base de datos
        result = fixed_routes_collection.insert_one(new_route)
        
        # Obtener el ID de la ruta creada
        new_route_id = str(result.inserted_id)
        
        return jsonify({
            "status": "success",
            "message": "Ruta fija creada correctamente",
            "route_id": new_route_id
        }), 201
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al crear la ruta fija: {str(e)}"
        }), 500

@routes_bp.route('/fixed/<route_id>/update', methods=['PUT'])
@jwt_required()
def update_fixed_route(route_id):
    try:
        # Obtener datos de la solicitud
        data = request.get_json()
        
        print(f"Datos recibidos para actualizar ruta {route_id}:", data)
        
        # Buscar la ruta existente
        existing_route = fixed_routes_collection.find_one({"_id": ObjectId(route_id)})
        
        if not existing_route:
            return jsonify({
                "status": "error",
                "message": "Ruta no encontrada"
            }), 404
            
        # Actualizar los campos permitidos
        update_data = {
            "name": data.get('name', existing_route['name']),
            "updated_at": datetime.datetime.utcnow()
        }
        
        # Actualizar origen y destino si están presentes
        if 'origin' in data:
            update_data["origin"] = {
                "name": data['origin']['name'],
                "location": data['origin']['location']
            }
            
        if 'destination' in data:
            update_data["destination"] = {
                "name": data['destination']['name'],
                "location": data['destination']['location']
            }
            
        # Actualizar precios si están presentes
        if 'pricing' in data:
            update_data["pricing"] = {
                "standard": data['pricing']['standard'],
                "night": data['pricing'].get('night', 0),
                "holiday": data['pricing'].get('holiday', 0),
                "currency": data['pricing']['currency']
            }
            
        # Actualizar disponibilidad si está presente
        if 'availability' in data:
            update_data["availability"] = {
                "timeSlots": data['availability']['timeSlots'],
                "days": data['availability']['days']
            }
            
        # Actualizar estado si está presente
        if 'status' in data:
            update_data["status"] = data['status']
            
        # Actualizar vehículo individual si está presente
        if 'vehicle' in data:
            update_data["vehicle"] = {
                "id": data['vehicle']['id'],
                "licensePlate": data['vehicle']['licensePlate'],
                "model": data['vehicle']['model'],
                "imageUrl": data['vehicle'].get('imageUrl', "")
            }
            
        # Actualizar conductor individual si está presente
        if 'driver' in data:
            update_data["driver"] = {
                "id": data['driver']['id'],
                "name": data['driver']['name'],
                "photo": data['driver'].get('photo', "")
            }
            
        # Actualizar array de conductores si está presente
        if 'drivers' in data and isinstance(data['drivers'], list):
            update_data["drivers"] = data['drivers']
        
        # Actualizar array de vehículos si está presente
        if 'vehicles' in data and isinstance(data['vehicles'], list):
            print("Vehículos recibidos:", data['vehicles'])
            # Asegurarse de que cada vehículo tenga un valor en el campo model
            validated_vehicles = []
            for vehicle in data['vehicles']:
                if not vehicle.get('model') or vehicle.get('model').strip() == '':
                    # Si el modelo está vacío, usar la placa como fallback
                    vehicle['model'] = f"Vehículo {vehicle.get('licensePlate', 'sin placa')}"
                validated_vehicles.append(vehicle)
            
            # Buscar y adjuntar información de conductores a vehículos
            validated_vehicles = attach_drivers_to_vehicles(validated_vehicles)
            update_data["vehicles"] = validated_vehicles
            
            # Obtener conductores de los vehículos
            drivers = []
            for vehicle in validated_vehicles:
                if 'driver' in vehicle and vehicle['driver']:
                    drivers.append(vehicle['driver'])
                    
            if drivers:
                update_data["drivers"] = drivers
                # Para compatibilidad, usar el primer conductor
                update_data["driver"] = drivers[0]
                
        # Actualizar collaboratorId si está presente
        if 'collaboratorId' in data:
            update_data["collaboratorId"] = data['collaboratorId']
            
        # Actualizar distancia y tiempo estimado si están disponibles
        if 'distance' in data:
            update_data["distance"] = data['distance']
        if 'estimatedTime' in data:
            update_data["estimatedTime"] = data['estimatedTime']
        
        # Actualizar la ruta en la base de datos
        fixed_routes_collection.update_one(
            {"_id": ObjectId(route_id)},
            {"$set": update_data}
        )
        
        return jsonify({
            "status": "success",
            "message": "Ruta fija actualizada correctamente",
            "route_id": route_id
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@routes_bp.route('/fixed/<route_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_fixed_route(route_id):
    try:
        # Buscar la ruta existente
        existing_route = fixed_routes_collection.find_one({"_id": ObjectId(route_id)})
        
        if not existing_route:
            return jsonify({
                "status": "error",
                "message": "Ruta no encontrada"
            }), 404
            
        # Eliminar la ruta de la base de datos
        fixed_routes_collection.delete_one({"_id": ObjectId(route_id)})
        
        return jsonify({
            "status": "success",
            "message": "Ruta fija eliminada correctamente"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al eliminar la ruta fija: {str(e)}"
        }), 500

@routes_bp.route('/fixed/<route_id>/toggle-status', methods=['PATCH'])
@jwt_required()
def toggle_fixed_route_status(route_id):
    try:
        # Buscar la ruta existente
        existing_route = fixed_routes_collection.find_one({"_id": ObjectId(route_id)})
        
        if not existing_route:
            return jsonify({
                "status": "error",
                "message": "Ruta no encontrada"
            }), 404
            
        # Determinar el nuevo estado
        current_status = existing_route.get('status', 'draft')
        new_status = 'inactive' if current_status == 'active' else 'active'
        
        # Actualizar el estado de la ruta
        fixed_routes_collection.update_one(
            {"_id": ObjectId(route_id)},
            {"$set": {"status": new_status, "updated_at": datetime.datetime.utcnow()}}
        )
        
        return jsonify({
            "status": "success",
            "message": f"Estado de la ruta actualizado a '{new_status}'",
            "new_status": new_status
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al cambiar el estado de la ruta: {str(e)}"
        }), 500

# ZONAS FLEXIBLES
@routes_bp.route('/flexible/list', methods=['GET'])
@jwt_required()
def list_flexible_zones():
    try:
        # Obtener parámetros de filtro opcionales
        filters = {}
        status = request.args.get('status')
        collaborator_id = request.args.get('collaborator_id')
        
        if status:
            filters['status'] = status
        if collaborator_id:
            filters['collaborator_id'] = collaborator_id
            
        # Obtener todas las zonas flexibles que coincidan con los filtros
        zones = list(flexible_zones_collection.find(filters))
        
        # Convertir ObjectId a string
        zones = [convert_objectids(zone) for zone in zones]
        
        return jsonify({
            "status": "success",
            "zones": zones
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al obtener las zonas flexibles: {str(e)}"
        }), 500

@routes_bp.route('/flexible/<zone_id>', methods=['GET'])
@jwt_required()
def get_flexible_zone(zone_id):
    try:
        # Buscar la zona por ID
        zone = flexible_zones_collection.find_one({"_id": ObjectId(zone_id)})
        
        if not zone:
            return jsonify({
                "status": "error",
                "message": "Zona flexible no encontrada"
            }), 404
            
        # Convertir ObjectId a string
        zone = convert_objectids(zone)
        
        return jsonify({
            "status": "success",
            "zone": zone
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al obtener la zona flexible: {str(e)}"
        }), 500

@routes_bp.route('/flexible/create', methods=['POST'])
@jwt_required()
def create_flexible_zone():
    try:
        # Obtener datos de la solicitud
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['name', 'center', 'radius', 'pricing']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "message": f"El campo '{field}' es requerido"
                }), 400
        
        # Validar que haya al menos un vehículo
        if 'vehicles' not in data or not data['vehicles']:
            return jsonify({
                "status": "error",
                "message": "Se requiere al menos un vehículo"
            }), 400
        
        # Crear estructura de la zona flexible
        new_zone = {
            "name": data['name'],
            "center": {
                "name": data['center']['name'],
                "location": data['center']['location']
            },
            "radius": data['radius'],
            "pricing": {
                "perKm": data['pricing']['perKm'],
                "minFare": data['pricing']['minFare'],
                "nightSurcharge": data['pricing'].get('nightSurcharge', 0),
                "holidaySurcharge": data['pricing'].get('holidaySurcharge', 0),
                "currency": data['pricing']['currency']
            },
            "status": data.get('status', 'active'),
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }
        
        # Añadir restricciones si están presentes
        if 'restrictions' in data and data['restrictions']:
            new_zone["restrictions"] = {
                "minDistance": data['restrictions'].get('minDistance', 0),
                "maxDistance": data['restrictions'].get('maxDistance', 0)
            }
            
        # Añadir descripción si está presente
        if 'description' in data:
            new_zone["description"] = data['description']
        
        # Añadir array de vehículos con conductores
        if 'vehicles' in data and isinstance(data['vehicles'], list) and data['vehicles']:
            # Asegurarse de que cada vehículo tenga un valor en el campo model
            validated_vehicles = []
            for vehicle in data['vehicles']:
                if not vehicle.get('model') or vehicle.get('model').strip() == '':
                    # Si el modelo está vacío, usar la placa como fallback
                    vehicle['model'] = f"Vehículo {vehicle.get('licensePlate', 'sin placa')}"
                validated_vehicles.append(vehicle)
                
            # Buscar y adjuntar información de conductores
            validated_vehicles = attach_drivers_to_vehicles(validated_vehicles)
            new_zone["vehicles"] = validated_vehicles
            
        # Añadir collaboratorId si está presente
        if 'collaboratorId' in data:
            new_zone["collaboratorId"] = data['collaboratorId']
            
        # Insertar la nueva zona en la base de datos
        result = flexible_zones_collection.insert_one(new_zone)
        
        # Obtener el ID de la zona creada
        new_zone_id = str(result.inserted_id)
        
        return jsonify({
            "status": "success",
            "message": "Zona flexible creada correctamente",
            "zone_id": new_zone_id
        }), 201
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al crear la zona flexible: {str(e)}"
        }), 500

@routes_bp.route('/flexible/<route_id>/update', methods=['PUT'])
@jwt_required()
def update_flexible_route(route_id):
    try:
        # Obtener datos de la solicitud
        data = request.get_json()
        
        print(f"Datos recibidos para actualizar ruta flexible {route_id}:", data)
        
        # Buscar la ruta existente
        existing_route = flexible_zones_collection.find_one({"_id": ObjectId(route_id)})
        
        if not existing_route:
            return jsonify({
                "status": "error",
                "message": "Zona flexible no encontrada"
            }), 404
            
        # Actualizar los campos permitidos
        update_data = {
            "name": data.get('name', existing_route['name']),
            "updated_at": datetime.datetime.utcnow()
        }
        
        # Actualizar centro si está presente
        if 'center' in data:
            update_data["center"] = {
                "name": data['center']['name'],
                "location": data['center']['location']
            }
            
        # Actualizar radio si está presente
        if 'radius' in data:
            update_data["radius"] = data['radius']
        
        # Actualizar precios si están presentes
        if 'pricing' in data:
            # Usar el formato original de pricing para zonas flexibles
            update_data["pricing"] = {
                "perKm": data['pricing'].get('perKm', 0),
                "minFare": data['pricing'].get('minFare', 0),
                "nightSurcharge": data['pricing'].get('nightSurcharge', 0),
                "holidaySurcharge": data['pricing'].get('holidaySurcharge', 0),
                "currency": data['pricing']['currency']
            }
            
        # Actualizar estado si está presente
        if 'status' in data:
            update_data["status"] = data['status']
        
        # Actualizar restricciones si están presentes
        if 'restrictions' in data:
            if data['restrictions']:
                update_data["restrictions"] = {
                    "minDistance": data['restrictions'].get('minDistance', 0),
                    "maxDistance": data['restrictions'].get('maxDistance', 0)
                }
            else:
                # Si restrictions es null o {}, eliminamos el campo
                flexible_zones_collection.update_one(
                    {"_id": ObjectId(route_id)},
                    {"$unset": {"restrictions": ""}}
                )
                
        # Actualizar descripción si está presente
        if 'description' in data:
            update_data["description"] = data['description']
            
        # Actualizar array de vehículos si está presente
        if 'vehicles' in data and isinstance(data['vehicles'], list):
            print("Vehículos recibidos:", data['vehicles'])
            # Asegurarse de que cada vehículo tenga un valor en el campo model
            validated_vehicles = []
            for vehicle in data['vehicles']:
                if not vehicle.get('model') or vehicle.get('model').strip() == '':
                    # Si el modelo está vacío, usar la placa como fallback
                    vehicle['model'] = f"Vehículo {vehicle.get('licensePlate', 'sin placa')}"
                validated_vehicles.append(vehicle)
            
            # Buscar y adjuntar información de conductores a vehículos
            validated_vehicles = attach_drivers_to_vehicles(validated_vehicles)
            update_data["vehicles"] = validated_vehicles
                
        # Actualizar collaboratorId si está presente
        if 'collaboratorId' in data:
            update_data["collaboratorId"] = data['collaboratorId']
        
        # Actualizar la zona en la base de datos
        flexible_zones_collection.update_one(
            {"_id": ObjectId(route_id)},
            {"$set": update_data}
        )
        
        return jsonify({
            "status": "success",
            "message": "Zona flexible actualizada correctamente",
            "zone_id": route_id
        }), 200
    except Exception as e:
        print(f"Error al actualizar zona flexible: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@routes_bp.route('/flexible/<zone_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_flexible_zone(zone_id):
    try:
        # Buscar la zona existente
        existing_zone = flexible_zones_collection.find_one({"_id": ObjectId(zone_id)})
        
        if not existing_zone:
            return jsonify({
                "status": "error",
                "message": "Zona flexible no encontrada"
            }), 404
            
        # Eliminar la zona de la base de datos
        flexible_zones_collection.delete_one({"_id": ObjectId(zone_id)})
        
        return jsonify({
            "status": "success",
            "message": "Zona flexible eliminada correctamente"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al eliminar la zona flexible: {str(e)}"
        }), 500

@routes_bp.route('/flexible/<zone_id>/toggle-status', methods=['PATCH'])
@jwt_required()
def toggle_flexible_zone_status(zone_id):
    try:
        # Buscar la zona existente
        existing_zone = flexible_zones_collection.find_one({"_id": ObjectId(zone_id)})
        
        if not existing_zone:
            return jsonify({
                "status": "error",
                "message": "Zona flexible no encontrada"
            }), 404
            
        # Determinar el nuevo estado
        current_status = existing_zone.get('status', 'active')
        new_status = 'inactive' if current_status == 'active' else 'active'
        
        # Actualizar el estado de la zona
        flexible_zones_collection.update_one(
            {"_id": ObjectId(zone_id)},
            {"$set": {"status": new_status, "updated_at": datetime.datetime.utcnow()}}
        )
        
        return jsonify({
            "status": "success",
            "message": f"Estado de la zona actualizado a '{new_status}'",
            "new_status": new_status
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error al cambiar el estado de la zona: {str(e)}"
        }), 500

@routes_bp.route('/fixed/search', methods=['GET'])
def search_fixed_routes():
    try:
        # Obtener el término de búsqueda
        search_query = request.args.get('q', '')
        
        if not search_query or len(search_query) < 2:
            return jsonify({
                "status": "error",
                "message": "El término de búsqueda debe tener al menos 2 caracteres"
            }), 400
        
        # Crear consulta para MongoDB
        # Buscar coincidencias en nombre, origen.name o destino.name
        query = {
            "$or": [
                {"name": {"$regex": search_query, "$options": "i"}},
                {"origin.name": {"$regex": search_query, "$options": "i"}},
                {"destination.name": {"$regex": search_query, "$options": "i"}}
            ]
        }
        
        # Filtrar solo rutas activas
        query["status"] = "active"
        
        # Ejecutar búsqueda
        routes = list(fixed_routes_collection.find(query).limit(10))
        
        if not routes:
            return jsonify({
                "status": "success",
                "message": "No se encontraron rutas",
                "routes": []
            }), 200
            
        # Convertir ObjectId a string
        routes = [convert_objectids(route) for route in routes]
        
        return jsonify({
            "status": "success",
            "routes": routes
        }), 200
    except Exception as e:
        print(f"Error en búsqueda de rutas: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error al buscar rutas: {str(e)}"
        }), 500 