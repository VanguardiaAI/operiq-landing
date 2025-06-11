from pymongo import MongoClient
from dotenv import load_dotenv
import os
import datetime

# Cargar variables de entorno
load_dotenv()

# Configuración de MongoDB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['operiq']
collaborators_collection = db['collaborators']

# Datos de prueba para colaboradores
sample_collaborators = [
    {
        'name': 'Luxury Fleet SL',
        'logo': 'https://randomuser.me/api/portraits/men/22.jpg',
        'type': 'company',
        'contactName': 'Alberto Martín',
        'contactPhone': '+34 612 345 789',
        'contactEmail': 'alberto@luxuryfleet.com',
        'taxId': 'B12345678',
        'country': 'España',
        'city': 'Madrid',
        'address': 'Calle Serrano 123',
        'postalCode': '28001',
        'startDate': '2021-06-15',
        'status': 'active',
        'commissionRate': 15,
        'paymentTerms': 'Pago mensual, 30 días',
        'bankAccount': 'ES12 1234 5678 9012 3456 7890',
        'serviceAreas': ['Madrid', 'Barcelona', 'Costa del Sol'],
        'specialties': ['Eventos corporativos', 'Bodas', 'Congresos'],
        'certifications': ['ISO 9001', 'Licencia VTC'],
        'notes': 'Colaborador principal para eventos corporativos',
        'rating': 4.8,
        'associatedDrivers': ['d2', 'd3'],
        'associatedVehicles': ['1', '3'],
        'created_at': datetime.datetime.now()
    },
    {
        'name': 'VIP Transports Ltd.',
        'logo': 'https://randomuser.me/api/portraits/women/22.jpg',
        'type': 'company',
        'contactName': 'María González',
        'contactPhone': '+34 623 456 789',
        'contactEmail': 'maria@viptransports.com',
        'taxId': 'B87654321',
        'country': 'España',
        'city': 'Barcelona',
        'address': 'Passeig de Gràcia 45',
        'postalCode': '08007',
        'startDate': '2022-02-10',
        'status': 'active',
        'commissionRate': 18,
        'paymentTerms': 'Pago quincenal',
        'bankAccount': '',
        'serviceAreas': ['Barcelona', 'Girona', 'Costa Brava'],
        'specialties': ['Turismo de lujo', 'Viajes de negocios'],
        'certifications': ['Licencia VTC', 'Certificado de Calidad Turística'],
        'notes': '',
        'rating': 4.5,
        'associatedDrivers': [],
        'associatedVehicles': ['2'],
        'created_at': datetime.datetime.now()
    },
    {
        'name': 'Carlos Rodríguez (Autónomo)',
        'logo': 'https://randomuser.me/api/portraits/men/32.jpg',
        'type': 'individual',
        'contactName': 'Carlos Rodríguez',
        'contactPhone': '+34 612 345 678',
        'contactEmail': 'carlos.rodriguez@email.com',
        'taxId': '12345678X',
        'country': 'España',
        'city': 'Valencia',
        'address': 'Avda. del Puerto 28',
        'postalCode': '46021',
        'startDate': '2023-01-20',
        'status': 'active',
        'commissionRate': 12,
        'paymentTerms': 'Pago por servicio',
        'bankAccount': '',
        'serviceAreas': ['Valencia', 'Alicante'],
        'specialties': ['Traslados aeropuerto', 'Eventos VIP'],
        'certifications': ['Licencia VTC', 'Idiomas certificados'],
        'notes': 'Chófer independiente con experiencia en clientes VIP',
        'rating': 4.9,
        'associatedDrivers': ['d1'],
        'associatedVehicles': [],
        'created_at': datetime.datetime.now()
    }
]

def main():
    # Verificar si ya hay colaboradores en la colección
    existing_count = collaborators_collection.count_documents({})
    if existing_count > 0:
        print(f"Ya hay {existing_count} colaboradores en la base de datos. ¿Desea borrarlos e insertar nuevos? (s/n)")
        response = input().lower()
        if response == 's':
            # Borrar colaboradores existentes
            collaborators_collection.delete_many({})
            print("Colaboradores existentes eliminados.")
        else:
            print("Operación cancelada. No se insertaron nuevos colaboradores.")
            return
    
    # Insertar colaboradores de prueba
    collaborators_collection.insert_many(sample_collaborators)
    print(f"Se insertaron {len(sample_collaborators)} colaboradores de prueba en la base de datos.")

if __name__ == "__main__":
    main() 