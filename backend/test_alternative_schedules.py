#!/usr/bin/env python3
"""
Script para probar el sistema de horarios alternativos
"""

import sys
import os
import requests
import json
from datetime import datetime, timedelta

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# URL base del API (ajusta según tu configuración)
API_BASE_URL = "http://localhost:5000"

def test_vehicle_availability_with_alternatives():
    """
    Prueba el endpoint de búsqueda de vehículos con horarios alternativos
    """
    print("=== PRUEBA DE HORARIOS ALTERNATIVOS ===\n")
    
    # Datos de prueba - usar una dirección conocida en Madrid
    test_data = {
        "pickup_address": "Aeropuerto Adolfo Suárez Madrid-Barajas, Madrid, España",
        "pickup_date": "2024-12-20",  # Fecha de prueba
        "pickup_time": "14:30",       # Hora que puede estar ocupada
        "estimated_duration": 60
    }
    
    print(f"📍 Probando disponibilidad para:")
    print(f"   - Dirección: {test_data['pickup_address']}")
    print(f"   - Fecha: {test_data['pickup_date']}")
    print(f"   - Hora: {test_data['pickup_time']}")
    print(f"   - Duración: {test_data['estimated_duration']} minutos\n")
    
    try:
        # Hacer la petición al endpoint
        url = f"{API_BASE_URL}/api/admin/reservations/search-vehicles"
        headers = {"Content-Type": "application/json"}
        
        print(f"🔄 Enviando petición a: {url}")
        
        response = requests.post(url, json=test_data, headers=headers)
        
        print(f"📊 Código de respuesta: {response.status_code}\n")
        
        if response.status_code == 200:
            data = response.json()
            
            # Mostrar resultados generales
            search_results = data.get("search_results", {})
            print("📈 RESULTADOS GENERALES:")
            print(f"   - Total vehículos encontrados: {search_results.get('total_vehicles_found', 0)}")
            print(f"   - En zonas fijas: {search_results.get('zones_found', 0)}")
            print(f"   - Con ruta flexible: {search_results.get('flexible_vehicles_found', 0)}")
            
            if "alternative_vehicles_count" in search_results:
                print(f"   - Con horarios alternativos: {search_results.get('alternative_vehicles_count', 0)}")
            
            print()
            
            # Mostrar vehículos disponibles
            available_vehicles = data.get("vehicles", [])
            if available_vehicles:
                print("✅ VEHÍCULOS DISPONIBLES:")
                for i, vehicle in enumerate(available_vehicles, 1):
                    print(f"   {i}. {vehicle.get('model', 'Modelo desconocido')} - {vehicle.get('license_plate', 'Sin placa')}")
                    print(f"      Conductor: {vehicle.get('driver_name', 'No asignado')}")
                    print(f"      Tipo: {vehicle.get('availability_type', 'flexible_route')}")
                    if vehicle.get('distance_km'):
                        print(f"      Distancia: {vehicle.get('distance_km')} km")
                    print()
            else:
                print("❌ No hay vehículos disponibles en el horario solicitado\n")
            
            # Mostrar vehículos con horarios alternativos
            alternative_vehicles = data.get("vehicles_with_alternative_schedules", [])
            if alternative_vehicles:
                print("🕒 VEHÍCULOS CON HORARIOS ALTERNATIVOS:")
                for i, vehicle in enumerate(alternative_vehicles, 1):
                    print(f"   {i}. {vehicle.get('model', 'Modelo desconocido')} - {vehicle.get('license_plate', 'Sin placa')}")
                    print(f"      Conductor: {vehicle.get('driver_name', 'No asignado')}")
                    print(f"      Tipo: {vehicle.get('availability_type', 'flexible_route')}")
                    print(f"      Motivo no disponible: {vehicle.get('unavailable_reason', 'No especificado')}")
                    
                    if vehicle.get('distance_km'):
                        print(f"      Distancia: {vehicle.get('distance_km')} km")
                    
                    # Mostrar próxima disponibilidad
                    if vehicle.get('next_available_time'):
                        print(f"      Próxima disponibilidad: {vehicle.get('next_available_time')}")
                    
                    # Mostrar horarios alternativos
                    alt_slots = vehicle.get('alternative_time_slots', [])
                    if alt_slots:
                        print(f"      Horarios disponibles hoy:")
                        for slot in alt_slots[:3]:  # Mostrar solo los primeros 3
                            print(f"        - {slot.get('start_time')} - {slot.get('end_time')}")
                        if len(alt_slots) > 3:
                            print(f"        - ... y {len(alt_slots) - 3} horarios más")
                    
                    print()
            else:
                print("ℹ️  No hay vehículos con horarios alternativos\n")
            
            # Mostrar datos raw para depuración
            print("🔍 DATOS RAW DE RESPUESTA:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
        else:
            print(f"❌ Error en la petición: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Mensaje: {error_data.get('error', 'Error desconocido')}")
                print(f"   Datos: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"   Respuesta: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión. Asegúrate de que el servidor esté ejecutándose en http://localhost:5000")
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")

def test_different_times():
    """
    Prueba con diferentes horarios para ver cómo cambian los resultados
    """
    print("\n\n=== PRUEBA CON DIFERENTES HORARIOS ===\n")
    
    test_times = [
        "08:00",  # Horario matutino
        "14:30",  # Horario tarde
        "20:00",  # Horario noche
        "23:30"   # Horario muy tardío
    ]
    
    base_data = {
        "pickup_address": "Plaza Mayor, Madrid, España",
        "pickup_date": "2024-12-20",
        "estimated_duration": 60
    }
    
    for time in test_times:
        print(f"⏰ Probando horario: {time}")
        
        test_data = {**base_data, "pickup_time": time}
        
        try:
            url = f"{API_BASE_URL}/api/admin/reservations/search-vehicles"
            response = requests.post(url, json=test_data, headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                data = response.json()
                available_count = len(data.get("vehicles", []))
                alternative_count = len(data.get("vehicles_with_alternative_schedules", []))
                
                print(f"   ✅ Disponibles: {available_count}, Con horarios alternativos: {alternative_count}")
            else:
                print(f"   ❌ Error: {response.status_code}")
        
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print()

if __name__ == "__main__":
    print("🚗 INICIANDO PRUEBAS DEL SISTEMA DE HORARIOS ALTERNATIVOS")
    print("=" * 60)
    
    # Prueba principal
    test_vehicle_availability_with_alternatives()
    
    # Prueba con diferentes horarios
    test_different_times()
    
    print("✅ Pruebas completadas")
    print("\n💡 PRÓXIMOS PASOS:")
    print("   1. Si ves vehículos con horarios alternativos, ¡la función está funcionando!")
    print("   2. Si no ves horarios alternativos, verifica que haya:")
    print("      - Vehículos en zonas cerca de la ubicación de prueba")
    print("      - Conductores con agendas configuradas")
    print("      - Datos de prueba en la base de datos")
    print("   3. Prueba en el frontend para ver la UI completa") 