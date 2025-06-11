from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import requests
from bson import ObjectId
from services.availability import check_vehicle_availability_for_location
from services.contact_service import (
    get_driver_contact_info,
    get_client_contact_info,
    create_contact_log,
    create_schedule_suggestion,
    get_contact_history,
    format_whatsapp_message
)
import os
from utils.geo_utils import get_coordinates_from_address
from services.extra_schedule_service import (
    create_extra_schedule_slot,
    check_schedule_conflicts,
    get_driver_extra_schedules,
    cancel_extra_schedule
)

# Crear el blueprint para las rutas de disponibilidad
availability_bp = Blueprint('availability', __name__)

# Variable que se inicializará en setup_collections
db = None

def setup_collections(database):
    """Inicializa las colecciones necesarias para este módulo"""
    global db
    db = database

def get_db():
    """Función auxiliar para obtener la instancia de la base de datos"""
    from app import db
    return db

@availability_bp.route('/api/admin/availability/check', methods=['POST'])
def check_availability():
    """
    Verifica la disponibilidad de vehículos para una ubicación específica
    Espera recibir:
    - address: Dirección en texto (opcional si se envían coordinates)
    - coordinates: Coordenadas [longitud, latitud] (opcional si se envía address)
    - pickup_date: Fecha y hora de recogida (ISO format)
    - estimated_duration: Duración estimada en minutos (opcional, default 60)
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400
        
        # Verificar que se proporcionó una dirección o coordenadas
        address = data.get('address')
        coordinates = data.get('coordinates')
        
        if not address and not coordinates:
            return jsonify({"error": "Se requiere una dirección o coordenadas"}), 400
        
        # Verificar que se proporcionó una fecha de recogida
        pickup_date_str = data.get('pickup_date')
        if not pickup_date_str:
            return jsonify({"error": "Se requiere una fecha de recogida"}), 400
        
        # Convertir fecha de string a datetime
        try:
            pickup_date = datetime.fromisoformat(pickup_date_str.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"error": "Formato de fecha inválido. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
        
        # Obtener duración estimada (opcional)
        estimated_duration = int(data.get('estimated_duration', 60))
        
        # Si solo se proporcionó dirección, obtener coordenadas usando geocoding
        if address and not coordinates:
            coordinates = get_coordinates_from_address(address)
            if not coordinates:
                return jsonify({"error": "No se pudieron obtener coordenadas para la dirección proporcionada"}), 400
        
        # Verificar disponibilidad de vehículos (con dirección para zona horaria)
        availability_result = check_vehicle_availability_for_location(
            db,
            address or "Dirección no especificada",
            coordinates,
            pickup_date,
            estimated_duration
        )
        
        return jsonify(availability_result), 200
        
    except Exception as e:
        print(f"Error al verificar disponibilidad: {str(e)}")
        return jsonify({"error": f"Error al verificar disponibilidad: {str(e)}"}), 500

@availability_bp.route('/api/admin/reservations/search-vehicles', methods=['POST'])
def admin_search_vehicles():
    """
    Endpoint específico para el panel de administración que busca vehículos
    disponibles al introducir una dirección durante la creación de una reserva
    
    Espera recibir:
    - pickup_address: Dirección de recogida
    - pickup_date: Fecha de recogida (YYYY-MM-DD)
    - pickup_time: Hora de recogida (HH:MM)
    - estimated_duration: Duración estimada en minutos (opcional, default 60)
    - dropoff_address: Dirección de destino (opcional)
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400
        
        # Verificar campos obligatorios
        if not data.get('pickup_address'):
            return jsonify({"error": "Se requiere dirección de recogida"}), 400
        
        if not data.get('pickup_date') or not data.get('pickup_time'):
            return jsonify({"error": "Se requieren fecha y hora de recogida"}), 400
        
        # Combinar fecha y hora para obtener datetime
        try:
            date_string = f"{data['pickup_date']} {data['pickup_time']}"
            pickup_datetime = datetime.strptime(date_string, '%Y-%m-%d %H:%M')
        except ValueError:
            return jsonify({"error": "Formato de fecha u hora inválido"}), 400
        
        # Obtener duración estimada
        estimated_duration = int(data.get('estimated_duration', 60))
        
        # Obtener coordenadas para la dirección de recogida
        pickup_address = data.get('pickup_address')
        pickup_coordinates = get_coordinates_from_address(pickup_address)
        
        if not pickup_coordinates:
            return jsonify({"error": "No se pudieron obtener coordenadas para la dirección de recogida"}), 400
        
        # Verificar disponibilidad de vehículos (con dirección para zona horaria)
        availability_result = check_vehicle_availability_for_location(
            db,
            pickup_address,
            pickup_coordinates,
            pickup_datetime,
            estimated_duration
        )
        
        # Formatear respuesta para el panel de administración
        admin_response = {
            "search_results": {
                "pickup_address": pickup_address,
                "pickup_coordinates": pickup_coordinates,
                "pickup_datetime": pickup_datetime.isoformat(),
                "estimated_duration": estimated_duration,
                "total_vehicles_found": availability_result["total_vehicles_found"]
            },
            "vehicles": []
        }
        
        # Formatear vehículos para el panel de administración
        for vehicle in availability_result["available_vehicles"]:
            vehicle_data = vehicle["vehicle_data"]
            driver_data = vehicle_data.get("driver", {})
            
            vehicle_info = {
                "id": vehicle["vehicle_id"],
                "driver_id": vehicle["driver_id"],
                "model": vehicle_data.get("model", ""),
                "name": vehicle_data.get("name", ""),
                "license_plate": vehicle_data.get("licensePlate", ""),
                "image": vehicle_data.get("image", ""),
                "imageUrl": vehicle_data.get("imageUrl", ""),
                "capacity": vehicle_data.get("capacity", 4),
                "type": vehicle_data.get("type", "sedan"),
                "color": vehicle_data.get("color", ""),
                "year": vehicle_data.get("year", ""),
                "driver_name": driver_data.get("name", ""),
                "driver_photo": driver_data.get("photo", ""),
                "driver_phone": driver_data.get("phone", ""),
                "driver_email": driver_data.get("email", ""),
                "driver_whatsapp": driver_data.get("whatsapp", ""),
                "driver_license": driver_data.get("license_number", ""),
                "driver_rating": driver_data.get("rating", 0),
                "driver_experience": driver_data.get("experience_years", 0),
                "driver_total_trips": driver_data.get("total_trips", 0),
                "driver_languages": driver_data.get("languages", []),
                "availability_type": vehicle["availability_type"],
                "zone_name": vehicle.get("zone_name", ""),
                "pricing": vehicle.get("pricing", {}),
            }
            
            if vehicle["availability_type"] == "flexible_route":
                vehicle_info["distance_km"] = vehicle.get("distance_km", 0)
            
            admin_response["vehicles"].append(vehicle_info)
        
        # Añadir información sobre zonas encontradas
        admin_response["search_results"]["zones_found"] = availability_result["fixed_zone_count"]
        admin_response["search_results"]["flexible_vehicles_found"] = availability_result["flexible_route_count"]
        
        # **NUEVO**: Agregar vehículos con horarios alternativos si existen
        if "vehicles_with_alternative_schedules" in availability_result:
            admin_response["vehicles_with_alternative_schedules"] = []
            
            for alt_vehicle in availability_result["vehicles_with_alternative_schedules"]:
                alt_vehicle_data = alt_vehicle["vehicle_data"]
                alt_driver_data = alt_vehicle_data.get("driver", {})
                
                alt_vehicle_info = {
                    "id": alt_vehicle["vehicle_id"],
                    "vehicle_id": alt_vehicle["vehicle_id"],
                    "driver_id": alt_vehicle["driver_id"],
                    "model": alt_vehicle_data.get("model", ""),
                    "name": alt_vehicle_data.get("name", ""),
                    "license_plate": alt_vehicle_data.get("licensePlate", ""),
                    "image": alt_vehicle_data.get("image", ""),
                    "imageUrl": alt_vehicle_data.get("imageUrl", ""),
                    "capacity": alt_vehicle_data.get("capacity", 4),
                    "type": alt_vehicle_data.get("type", "sedan"),
                    "color": alt_vehicle_data.get("color", ""),
                    "year": alt_vehicle_data.get("year", ""),
                    "driver_name": alt_driver_data.get("name", ""),
                    "driver_photo": alt_driver_data.get("photo", ""),
                    "driver_phone": alt_driver_data.get("phone", ""),
                    "driver_email": alt_driver_data.get("email", ""),
                    "driver_whatsapp": alt_driver_data.get("whatsapp", ""),
                    "driver_license": alt_driver_data.get("license_number", ""),
                    "driver_rating": alt_driver_data.get("rating", 0),
                    "driver_experience": alt_driver_data.get("experience_years", 0),
                    "driver_total_trips": alt_driver_data.get("total_trips", 0),
                    "driver_languages": alt_driver_data.get("languages", []),
                    "availability_type": alt_vehicle["availability_type"],
                    "zone_name": alt_vehicle.get("zone_name", ""),
                    "unavailable_reason": alt_vehicle.get("unavailable_reason", "No disponible"),
                    "pricing": alt_vehicle.get("pricing", {}),
                }
                
                # Agregar información específica según el tipo
                if alt_vehicle["availability_type"] == "flexible_route":
                    alt_vehicle_info["distance_km"] = alt_vehicle.get("distance_km", 0)
                
                # Agregar horarios alternativos si existen
                if "alternative_time_slots" in alt_vehicle:
                    alt_vehicle_info["alternative_time_slots"] = alt_vehicle["alternative_time_slots"]
                
                # Agregar próxima disponibilidad si existe
                if "next_available_time" in alt_vehicle:
                    alt_vehicle_info["next_available_time"] = alt_vehicle["next_available_time"]
                
                admin_response["vehicles_with_alternative_schedules"].append(alt_vehicle_info)
            
            # Agregar conteo de vehículos alternativos
            admin_response["search_results"]["alternative_vehicles_count"] = len(admin_response["vehicles_with_alternative_schedules"])
        
        return jsonify(admin_response), 200
    
    except Exception as e:
        print(f"Error al buscar vehículos para el panel admin: {str(e)}")
        return jsonify({"error": f"Error al buscar vehículos: {str(e)}"}), 500

# ========== NUEVOS ENDPOINTS PARA CONTACTO Y SUGERENCIAS ==========

@availability_bp.route('/api/admin/contact/driver/<driver_id>', methods=['GET'])
def get_driver_contact(driver_id):
    """
    Obtiene información de contacto completa de un conductor
    
    Args:
        driver_id: ID del conductor
    
    Returns:
        Información de contacto del conductor
    """
    try:
        if not driver_id:
            return jsonify({"error": "Se requiere el ID del conductor"}), 400
        
        contact_info = get_driver_contact_info(db, driver_id)
        
        if "error" in contact_info:
            return jsonify(contact_info), 404
        
        return jsonify(contact_info), 200
    
    except Exception as e:
        print(f"Error al obtener información de contacto del conductor: {str(e)}")
        return jsonify({"error": f"Error al obtener información de contacto: {str(e)}"}), 500

@availability_bp.route('/api/admin/contact/client/<client_id>', methods=['GET'])
def get_client_contact(client_id):
    """
    Obtiene información de contacto de un cliente
    
    Args:
        client_id: ID del cliente
    
    Returns:
        Información de contacto del cliente
    """
    try:
        if not client_id:
            return jsonify({"error": "Se requiere el ID del cliente"}), 400
        
        contact_info = get_client_contact_info(db, client_id)
        
        if "error" in contact_info:
            return jsonify(contact_info), 404
        
        return jsonify(contact_info), 200
    
    except Exception as e:
        print(f"Error al obtener información de contacto del cliente: {str(e)}")
        return jsonify({"error": f"Error al obtener información de contacto: {str(e)}"}), 500

@availability_bp.route('/api/admin/contact/log', methods=['POST'])
def register_contact():
    """
    Registra un contacto realizado entre admin y conductor
    
    Espera recibir:
    - admin_id: ID del administrador
    - driver_id: ID del conductor contactado
    - client_id: ID del cliente (opcional)
    - contact_method: Método de contacto (phone, whatsapp, email)
    - contact_reason: Motivo del contacto
    - notes: Notas adicionales
    - pickup_date: Fecha de recogida relacionada
    - pickup_location: Ubicación de recogida
    - vehicle_id: ID del vehículo
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400
        
        # Verificar campos obligatorios
        required_fields = ['admin_id', 'driver_id', 'contact_method']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"El campo '{field}' es obligatorio"}), 400
        
        # Registrar el contacto
        result = create_contact_log(db, data)
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify(result), 201
    
    except Exception as e:
        print(f"Error al registrar contacto: {str(e)}")
        return jsonify({"error": f"Error al registrar contacto: {str(e)}"}), 500

@availability_bp.route('/api/admin/contact/suggest-schedule', methods=['POST'])
def suggest_schedule():
    """
    Crea una sugerencia de horario alternativo para un cliente
    
    Espera recibir:
    - admin_id: ID del administrador
    - client_id: ID del cliente
    - driver_id: ID del conductor
    - vehicle_id: ID del vehículo
    - original_pickup_date: Fecha original solicitada
    - suggested_pickup_date: Fecha sugerida
    - pickup_location: Ubicación de recogida
    - dropoff_location: Ubicación de destino (opcional)
    - reason: Motivo de la sugerencia
    - alternative_time_slots: Lista de horarios alternativos
    - contact_method: Método de contacto preferido
    - message: Mensaje personalizado
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400
        
        # Verificar campos obligatorios
        required_fields = ['admin_id', 'client_id', 'driver_id', 'vehicle_id', 
                          'original_pickup_date', 'pickup_location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"El campo '{field}' es obligatorio"}), 400
        
        # Crear la sugerencia
        result = create_schedule_suggestion(db, data)
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify(result), 201
    
    except Exception as e:
        print(f"Error al crear sugerencia de horario: {str(e)}")
        return jsonify({"error": f"Error al crear sugerencia: {str(e)}"}), 500

@availability_bp.route('/api/admin/contact/history/<driver_id>', methods=['GET'])
def get_driver_contact_history(driver_id):
    """
    Obtiene el historial de contactos de un conductor
    
    Args:
        driver_id: ID del conductor
    
    Query params:
        limit: Número máximo de registros (default: 10)
    
    Returns:
        Lista con el historial de contactos
    """
    try:
        if not driver_id:
            return jsonify({"error": "Se requiere el ID del conductor"}), 400
        
        # Obtener parámetro de límite
        limit = int(request.args.get('limit', 10))
        
        # Obtener historial
        history = get_contact_history(db, driver_id, limit)
        
        return jsonify({
            "driver_id": driver_id,
            "contacts": history,
            "total_contacts": len(history)
        }), 200
    
    except Exception as e:
        print(f"Error al obtener historial de contactos: {str(e)}")
        return jsonify({"error": f"Error al obtener historial: {str(e)}"}), 500

@availability_bp.route('/api/admin/contact/whatsapp-message', methods=['POST'])
def generate_whatsapp_message():
    """
    Genera un mensaje formateado para WhatsApp con información del viaje
    
    Espera recibir:
    - driver_name: Nombre del conductor
    - client_name: Nombre del cliente
    - pickup_date: Fecha original solicitada
    - pickup_location: Ubicación de recogida
    - alternative_slots: Lista de horarios alternativos (opcional)
    
    Returns:
        Mensaje formateado para WhatsApp
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400
        
        # Verificar campos obligatorios
        required_fields = ['driver_name', 'client_name', 'pickup_date', 'pickup_location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"El campo '{field}' es obligatorio"}), 400
        
        # Generar mensaje
        message = format_whatsapp_message(
            driver_name=data['driver_name'],
            client_name=data['client_name'],
            pickup_date=data['pickup_date'],
            pickup_location=data['pickup_location'],
            alternative_slots=data.get('alternative_slots', [])
        )
        
        return jsonify({
            "message": message,
            "encoded_message": requests.utils.quote(message)
        }), 200
    
    except Exception as e:
        print(f"Error al generar mensaje de WhatsApp: {str(e)}")
        return jsonify({"error": f"Error al generar mensaje: {str(e)}"}), 500

# Agregar nuevas rutas para horarios extras
@availability_bp.route('/api/admin/extra-schedule/create', methods=['POST'])
def create_extra_schedule():
    """Crear un horario extra para un conductor"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['driver_id', 'date', 'start_time', 'end_time']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        # Agregar admin_id por defecto si no se proporciona
        if not data.get('admin_id'):
            data['admin_id'] = 'admin-default'
        
        result = create_extra_schedule_slot(get_db(), data)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 201
        
    except Exception as e:
        print(f"Error en create_extra_schedule: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@availability_bp.route('/api/admin/extra-schedule/check-conflicts', methods=['POST'])
def check_conflicts():
    """Verificar si hay conflictos para un horario propuesto"""
    try:
        data = request.get_json()
        
        driver_id = data.get('driver_id')
        date_str = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if not all([driver_id, date_str, start_time, end_time]):
            return jsonify({'error': 'Faltan datos requeridos'}), 400
        
        # Convertir a datetime
        start_datetime = datetime.strptime(f"{date_str} {start_time}", "%Y-%m-%d %H:%M")
        end_datetime = datetime.strptime(f"{date_str} {end_time}", "%Y-%m-%d %H:%M")
        
        result = check_schedule_conflicts(get_db(), driver_id, start_datetime, end_datetime)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error en check_conflicts: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@availability_bp.route('/api/admin/extra-schedule/driver/<driver_id>', methods=['GET'])
def get_extra_schedules(driver_id):
    """Obtener horarios extras de un conductor"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # Convertir fechas si se proporcionan
        date_from_obj = datetime.strptime(date_from, "%Y-%m-%d") if date_from else None
        date_to_obj = datetime.strptime(date_to, "%Y-%m-%d") if date_to else None
        
        extra_schedules = get_driver_extra_schedules(
            get_db(), 
            driver_id, 
            date_from_obj, 
            date_to_obj
        )
        
        return jsonify({
            'driver_id': driver_id,
            'extra_schedules': extra_schedules,
            'total_count': len(extra_schedules)
        }), 200
        
    except Exception as e:
        print(f"Error en get_extra_schedules: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@availability_bp.route('/api/admin/extra-schedule/cancel/<extra_schedule_id>', methods=['DELETE'])
def cancel_extra_schedule_endpoint(extra_schedule_id):
    """Cancelar un horario extra"""
    try:
        data = request.get_json() or {}
        admin_id = data.get('admin_id', 'admin-user-id')  # Este debería venir del contexto de usuario
        reason = data.get('reason', 'Cancelado por administrador')
        
        result = cancel_extra_schedule(get_db(), extra_schedule_id, admin_id, reason)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error en cancel_extra_schedule: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500 