#!/usr/bin/env python3
"""
Script de prueba para las mejoras de la Fase 2 del sistema de horarios alternativos
- Imágenes de vehículos
- Datos completos de contacto de conductores
- Funcionalidades de contacto y sugerencias
"""

import requests
import json
from datetime import datetime, timedelta

# Configuración
API_BASE_URL = "http://localhost:5001"

def test_enhanced_vehicle_search():
    """
    Prueba la búsqueda de vehículos con las nuevas mejoras:
    - Imágenes de vehículos
    - Datos completos de conductores
    """
    print("🔍 Prueba: Búsqueda de vehículos con datos mejorados")
    print("=" * 60)
    
    # Datos de prueba
    tomorrow = datetime.now() + timedelta(days=1)
    test_data = {
        "pickup_address": "Calle Gran Vía, 1, Madrid",
        "pickup_date": tomorrow.strftime("%Y-%m-%d"),
        "pickup_time": "14:30",
        "estimated_duration": 60
    }
    
    print(f"📍 Dirección: {test_data['pickup_address']}")
    print(f"📅 Fecha: {test_data['pickup_date']} a las {test_data['pickup_time']}")
    print()
    
    try:
        # Realizar búsqueda
        response = requests.post(
            f"{API_BASE_URL}/api/admin/reservations/search-vehicles",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ Búsqueda exitosa!")
            print(f"🚗 Total de vehículos encontrados: {data['search_results']['total_vehicles_found']}")
            print()
            
            # Mostrar vehículos disponibles con nuevos campos
            if data.get('vehicles'):
                print("🟢 VEHÍCULOS DISPONIBLES:")
                print("-" * 40)
                
                for i, vehicle in enumerate(data['vehicles'], 1):
                    print(f"{i}. {vehicle.get('model', 'N/A')} - {vehicle.get('license_plate', 'N/A')}")
                    print(f"   🖼️  Imagen: {vehicle.get('image', 'No disponible')}")
                    print(f"   🔗 URL imagen: {vehicle.get('imageUrl', 'No disponible')}")
                    print(f"   👤 Conductor: {vehicle.get('driver_name', 'N/A')}")
                    print(f"   📞 Teléfono: {vehicle.get('driver_phone', 'N/A')}")
                    print(f"   📧 Email: {vehicle.get('driver_email', 'N/A')}")
                    print(f"   💬 WhatsApp: {vehicle.get('driver_whatsapp', 'N/A')}")
                    print(f"   🆔 Licencia: {vehicle.get('driver_license', 'N/A')}")
                    print(f"   ⭐ Rating: {vehicle.get('driver_rating', 0)}/5")
                    print(f"   🎓 Experiencia: {vehicle.get('driver_experience', 0)} años")
                    print(f"   🚗 Viajes: {vehicle.get('driver_total_trips', 0)}")
                    print(f"   🗣️  Idiomas: {', '.join(vehicle.get('driver_languages', []))}")
                    print(f"   🏷️  Tipo: {vehicle.get('availability_type', 'N/A')}")
                    if vehicle.get('zone_name'):
                        print(f"   📍 Zona: {vehicle.get('zone_name')}")
                    print()
            
            # Mostrar vehículos con horarios alternativos
            if data.get('vehicles_with_alternative_schedules'):
                print("⚠️  VEHÍCULOS CON HORARIOS ALTERNATIVOS:")
                print("-" * 50)
                
                for i, vehicle in enumerate(data['vehicles_with_alternative_schedules'], 1):
                    print(f"{i}. {vehicle.get('model', 'N/A')} - {vehicle.get('license_plate', 'N/A')}")
                    print(f"   🖼️  Imagen: {vehicle.get('image', 'No disponible')}")
                    print(f"   👤 Conductor: {vehicle.get('driver_name', 'N/A')}")
                    print(f"   📞 Teléfono: {vehicle.get('driver_phone', 'N/A')}")
                    print(f"   📧 Email: {vehicle.get('driver_email', 'N/A')}")
                    print(f"   ❌ Motivo: {vehicle.get('unavailable_reason', 'N/A')}")
                    
                    if vehicle.get('alternative_time_slots'):
                        print(f"   ⏰ Horarios disponibles:")
                        for slot in vehicle['alternative_time_slots']:
                            print(f"      • {slot.get('start_time', 'N/A')} - {slot.get('end_time', 'N/A')}")
                    
                    if vehicle.get('next_available_time'):
                        print(f"   ⏳ Próxima disponibilidad: {vehicle['next_available_time']}")
                    
                    print()
        
        else:
            print(f"❌ Error en la búsqueda: {response.status_code}")
            print(f"Mensaje: {response.text}")
    
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")

def test_driver_contact_info():
    """
    Prueba la obtención de información de contacto de un conductor
    """
    print("\n👤 Prueba: Información de contacto del conductor")
    print("=" * 60)
    
    # ID de prueba (deberás cambiarlo por un ID real de tu BD)
    test_driver_id = "60a1234567890abcdef12345"  # Cambia por un ID real
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/admin/contact/driver/{test_driver_id}",
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ Información obtenida exitosamente!")
            print(f"👤 Nombre: {data.get('name', 'N/A')}")
            print(f"📞 Teléfono: {data.get('phone', 'N/A')}")
            print(f"📧 Email: {data.get('email', 'N/A')}")
            print(f"💬 WhatsApp: {data.get('whatsapp', 'N/A')}")
            print(f"🆔 Licencia: {data.get('license_number', 'N/A')}")
            print(f"⭐ Rating: {data.get('rating', 0)}/5")
            print(f"🚗 Total viajes: {data.get('total_trips', 0)}")
            print(f"📞 Métodos disponibles: {', '.join(data.get('available_contact_methods', []))}")
            
        elif response.status_code == 404:
            print(f"⚠️  Conductor no encontrado (ID: {test_driver_id})")
            print("💡 Nota: Cambia el ID en el script por uno real de tu base de datos")
        
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")

def test_whatsapp_message_generation():
    """
    Prueba la generación de mensajes de WhatsApp
    """
    print("\n💬 Prueba: Generación de mensaje de WhatsApp")
    print("=" * 60)
    
    test_data = {
        "driver_name": "Juan Pérez",
        "client_name": "María García",
        "pickup_date": "2024-01-15 14:30",
        "pickup_location": "Hotel Villa Magna, Madrid",
        "alternative_slots": ["15:00", "16:30", "18:00"]
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/admin/contact/whatsapp-message",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ Mensaje generado exitosamente!")
            print("\n📱 MENSAJE DE WHATSAPP:")
            print("-" * 40)
            print(data['message'])
            print("-" * 40)
            print(f"\n🔗 URL codificada: whatsapp://send?text={data['encoded_message'][:100]}...")
        
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")

def test_contact_log():
    """
    Prueba el registro de contactos
    """
    print("\n📝 Prueba: Registro de contacto")
    print("=" * 60)
    
    test_data = {
        "admin_id": "admin123",
        "driver_id": "60a1234567890abcdef12345",  # Cambia por un ID real
        "client_id": "60b1234567890abcdef12345",  # Cambia por un ID real
        "contact_method": "whatsapp",
        "contact_reason": "vehicle_inquiry",
        "notes": "Consulta sobre disponibilidad para servicio VIP",
        "pickup_date": "2024-01-15T14:30:00",
        "pickup_location": "Hotel Villa Magna, Madrid",
        "vehicle_id": "60c1234567890abcdef12345"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/admin/contact/log",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            data = response.json()
            
            print("✅ Contacto registrado exitosamente!")
            print(f"🆔 ID del contacto: {data.get('contact_id', 'N/A')}")
            print(f"💬 Mensaje: {data.get('message', 'N/A')}")
        
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")

def main():
    """
    Ejecuta todas las pruebas
    """
    print("🚗 PRUEBAS DE MEJORAS - FASE 2")
    print("Sistema de Horarios Alternativos - Privyde VIP")
    print("=" * 60)
    
    # Prueba 1: Búsqueda mejorada de vehículos
    test_enhanced_vehicle_search()
    
    # Prueba 2: Información de contacto
    test_driver_contact_info()
    
    # Prueba 3: Generación de mensajes WhatsApp
    test_whatsapp_message_generation()
    
    # Prueba 4: Registro de contactos
    test_contact_log()
    
    print("\n🎉 RESUMEN DE PRUEBAS")
    print("=" * 60)
    print("✅ Búsqueda de vehículos con imágenes y datos completos")
    print("✅ Información de contacto de conductores")
    print("✅ Generación de mensajes de WhatsApp")
    print("✅ Registro de contactos")
    print("\n💡 Nota: Para pruebas completas, actualiza los IDs de ejemplo")
    print("   con IDs reales de tu base de datos.")

if __name__ == "__main__":
    main() 