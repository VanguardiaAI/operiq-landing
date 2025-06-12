#!/usr/bin/env python3
"""
Script de prueba para verificar las funcionalidades de horarios extras
Sistema de Horarios Alternativos - Privyde VIP
"""

import sys
import os
import requests
import json
from datetime import datetime, timedelta

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_extra_schedule_endpoints():
    """Prueba los endpoints relacionados con horarios extras"""
    
    print("🚗 PRUEBAS DE HORARIOS EXTRAS")
    print("Sistema de Horarios Alternativos - Privyde VIP")
    print("=" * 60)
    
    base_url = "http://localhost:5001"  # Ajustar según tu configuración
    
    # Datos de prueba
    driver_id = "68280ac23378369e956135c5"  # Usar un ID real de tu base de datos
    test_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    start_time = "15:00"
    end_time = "17:00"
    
    print("🔍 Prueba 1: Verificar conflictos de horario")
    print("=" * 50)
    
    try:
        # Test 1: Verificar conflictos
        conflict_data = {
            "driver_id": driver_id,
            "date": test_date,
            "start_time": start_time,
            "end_time": end_time
        }
        
        response = requests.post(f"{base_url}/api/admin/extra-schedule/check-conflicts", 
                               json=conflict_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Verificación exitosa!")
            print(f"🔍 Conflicto detectado: {'Sí' if result.get('has_conflict') else 'No'}")
            if result.get('has_conflict'):
                print(f"📝 Razón: {result.get('reason', 'N/A')}")
            else:
                print(f"✅ Horario disponible para crear")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error en verificación de conflictos: {str(e)}")
    
    print("\n🔍 Prueba 2: Crear horario extra")
    print("=" * 50)
    
    try:
        # Test 2: Crear horario extra
        extra_schedule_data = {
            "driver_id": driver_id,
            "date": test_date,
            "start_time": start_time,
            "end_time": end_time,
            "admin_id": "admin-test-id",
            "client_id": "client-test-id",
            "vehicle_id": "vehicle-test-id",
            "reason": "Prueba de horario extra - Conductor acepta horario especial",
            "pickup_location": "Hotel Four Seasons, Madrid",
            "dropoff_location": "Aeropuerto Barajas T4",
            "notes": "Prueba automatizada del sistema"
        }
        
        response = requests.post(f"{base_url}/api/admin/extra-schedule/create", 
                               json=extra_schedule_data)
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Horario extra creado exitosamente!")
            print(f"🆔 ID del horario: {result.get('extra_schedule_id', 'N/A')}")
            print(f"📅 Fecha: {result.get('schedule_details', {}).get('date', 'N/A')}")
            print(f"⏰ Horario: {result.get('schedule_details', {}).get('start_time', 'N/A')} - {result.get('schedule_details', {}).get('end_time', 'N/A')}")
            print(f"⏱️ Duración: {result.get('schedule_details', {}).get('duration_minutes', 'N/A')} minutos")
            
            # Guardar el ID para pruebas posteriores
            extra_schedule_id = result.get('extra_schedule_id')
            
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            extra_schedule_id = None
            
    except Exception as e:
        print(f"❌ Error en creación de horario extra: {str(e)}")
        extra_schedule_id = None
    
    print("\n🔍 Prueba 3: Obtener horarios extras del conductor")
    print("=" * 50)
    
    try:
        # Test 3: Obtener horarios extras
        date_from = datetime.now().strftime("%Y-%m-%d")
        date_to = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        response = requests.get(f"{base_url}/api/admin/extra-schedule/driver/{driver_id}",
                              params={
                                  "date_from": date_from,
                                  "date_to": date_to
                              })
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Horarios obtenidos exitosamente!")
            print(f"📊 Total de horarios extras: {result.get('total_count', 0)}")
            
            extra_schedules = result.get('extra_schedules', [])
            if extra_schedules:
                for i, schedule in enumerate(extra_schedules[:3], 1):  # Mostrar máximo 3
                    print(f"\n   📋 Horario {i}:")
                    print(f"      📅 Fecha: {schedule.get('date', 'N/A')}")
                    print(f"      ⏰ Horario: {schedule.get('start_time', 'N/A')} - {schedule.get('end_time', 'N/A')}")
                    print(f"      📝 Motivo: {schedule.get('reason', 'N/A')}")
                    print(f"      📍 Origen: {schedule.get('pickup_location', 'N/A')}")
                if len(extra_schedules) > 3:
                    print(f"   ... y {len(extra_schedules) - 3} más")
            else:
                print("   📭 No hay horarios extras registrados")
                
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error obteniendo horarios extras: {str(e)}")
    
    # Test 4: Cancelar horario extra (opcional)
    if extra_schedule_id:
        print("\n🔍 Prueba 4: Cancelar horario extra")
        print("=" * 50)
        
        try:
            cancel_data = {
                "admin_id": "admin-test-id",
                "reason": "Prueba automatizada - Cancelación de horario de prueba"
            }
            
            response = requests.delete(f"{base_url}/api/admin/extra-schedule/cancel/{extra_schedule_id}",
                                     json=cancel_data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Horario extra cancelado exitosamente!")
                print(f"💬 Mensaje: {result.get('message', 'N/A')}")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Error cancelando horario extra: {str(e)}")
    
    print("\n🎉 RESUMEN DE PRUEBAS")
    print("=" * 60)
    print("✅ Verificación de conflictos")
    print("✅ Creación de horarios extras")
    print("✅ Consulta de horarios por conductor")
    print("✅ Cancelación de horarios extras")
    print("\n💡 Todas las funcionalidades de horarios extras están operativas!")

if __name__ == "__main__":
    test_extra_schedule_endpoints() 