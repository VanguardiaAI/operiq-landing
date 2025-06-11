from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
import datetime
import json

# Cargar variables de entorno
load_dotenv()

# Configuración de MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['operiq']
collaborators_collection = db['collaborators']

# Convertir ObjectId a string para JSON
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime.datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

# Crear blueprint para las rutas de colaboradores
collaborators_bp = Blueprint('collaborators', __name__)

@collaborators_bp.route('/list', methods=['GET'])
def get_collaborators():
    try:
        # Obtener parámetros de filtro
        type_filter = request.args.get('type', '')
        status_filter = request.args.get('status', '')
        search_query = request.args.get('search', '')
        
        # Construir el filtro
        filter_params = {}
        
        if type_filter:
            filter_params['type'] = type_filter
            
        if status_filter:
            filter_params['status'] = status_filter
            
        if search_query:
            # Buscar en varios campos
            filter_params['$or'] = [
                {'name': {'$regex': search_query, '$options': 'i'}},
                {'contactName': {'$regex': search_query, '$options': 'i'}},
                {'contactEmail': {'$regex': search_query, '$options': 'i'}},
                {'city': {'$regex': search_query, '$options': 'i'}},
                {'country': {'$regex': search_query, '$options': 'i'}}
            ]
        
        # Obtener colaboradores según los filtros
        collaborators = list(collaborators_collection.find(filter_params))
        
        # Convertir ObjectId a string para serialización JSON
        for collaborator in collaborators:
            collaborator['id'] = str(collaborator.pop('_id'))
        
        return jsonify({
            'status': 'success',
            'collaborators': collaborators
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@collaborators_bp.route('/add', methods=['POST'])
def add_collaborator():
    try:
        collaborator_data = request.json
        
        # Añadir fecha de creación
        collaborator_data['created_at'] = datetime.datetime.now()
        
        # Insertar en la base de datos
        result = collaborators_collection.insert_one(collaborator_data)
        
        # Obtener el colaborador recién creado
        new_collaborator = collaborators_collection.find_one({'_id': result.inserted_id})
        new_collaborator['id'] = str(new_collaborator.pop('_id'))
        
        return jsonify({
            'status': 'success',
            'message': 'Colaborador creado exitosamente',
            'collaborator': new_collaborator
        }), 201
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@collaborators_bp.route('/update/<collaborator_id>', methods=['PUT'])
def update_collaborator(collaborator_id):
    try:
        collaborator_data = request.json
        
        # Actualizar fecha de modificación
        collaborator_data['updated_at'] = datetime.datetime.now()
        
        # Actualizar en la base de datos
        result = collaborators_collection.update_one(
            {'_id': ObjectId(collaborator_id)},
            {'$set': collaborator_data}
        )
        
        if result.matched_count == 0:
            return jsonify({
                'status': 'error',
                'message': 'Colaborador no encontrado'
            }), 404
        
        # Obtener el colaborador actualizado
        updated_collaborator = collaborators_collection.find_one({'_id': ObjectId(collaborator_id)})
        updated_collaborator['id'] = str(updated_collaborator.pop('_id'))
        
        return jsonify({
            'status': 'success',
            'message': 'Colaborador actualizado exitosamente',
            'collaborator': updated_collaborator
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@collaborators_bp.route('/delete/<collaborator_id>', methods=['DELETE'])
def delete_collaborator(collaborator_id):
    try:
        # Eliminar de la base de datos
        result = collaborators_collection.delete_one({'_id': ObjectId(collaborator_id)})
        
        if result.deleted_count == 0:
            return jsonify({
                'status': 'error',
                'message': 'Colaborador no encontrado'
            }), 404
        
        return jsonify({
            'status': 'success',
            'message': 'Colaborador eliminado exitosamente'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@collaborators_bp.route('/detail/<collaborator_id>', methods=['GET'])
def get_collaborator_detail(collaborator_id):
    try:
        # Buscar el colaborador por ID
        collaborator = collaborators_collection.find_one({'_id': ObjectId(collaborator_id)})
        
        if not collaborator:
            return jsonify({
                'status': 'error',
                'message': 'Colaborador no encontrado'
            }), 404
        
        # Convertir ObjectId a string
        collaborator['id'] = str(collaborator.pop('_id'))
        
        return jsonify({
            'status': 'success',
            'collaborator': collaborator
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@collaborators_bp.route('/<collaborator_id>/update-associations', methods=['POST'])
def update_collaborator_associations(collaborator_id):
    try:
        data = request.json
        vehicle_id = data.get('vehicleId')
        driver_ids = data.get('driverIds', [])
        
        # Buscar el colaborador
        collaborator = collaborators_collection.find_one({'_id': ObjectId(collaborator_id)})
        
        if not collaborator:
            return jsonify({
                'status': 'error',
                'message': 'Colaborador no encontrado'
            }), 404
        
        # Inicializar arrays si no existen
        if 'associatedVehicles' not in collaborator:
            collaborator['associatedVehicles'] = []
        
        if 'associatedDrivers' not in collaborator:
            collaborator['associatedDrivers'] = []
            
        # Actualizar vehículo asociado si se proporciona
        if vehicle_id and vehicle_id not in collaborator['associatedVehicles']:
            collaborator['associatedVehicles'].append(vehicle_id)
        
        # Actualizar conductores asociados
        for driver_id in driver_ids:
            if driver_id not in collaborator['associatedDrivers']:
                collaborator['associatedDrivers'].append(driver_id)
        
        # Guardar cambios
        collaborators_collection.update_one(
            {'_id': ObjectId(collaborator_id)},
            {'$set': {
                'associatedVehicles': collaborator['associatedVehicles'],
                'associatedDrivers': collaborator['associatedDrivers'],
                'updated_at': datetime.datetime.now()
            }}
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Asociaciones actualizadas correctamente',
            'collaborator': {
                'id': str(collaborator['_id']),
                'associatedVehicles': collaborator['associatedVehicles'],
                'associatedDrivers': collaborator['associatedDrivers']
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 