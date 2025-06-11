import pytz
from datetime import datetime
from typing import Optional, Tuple, Dict, Any
import requests
import json

class TimezoneService:
    """Servicio para manejar conversiones de zonas horarias basado en ubicación"""
    
    # Mapeo de países/ciudades a zonas horarias
    TIMEZONE_MAP = {
        # México
        'mexico': 'America/Mexico_City',
        'méxico': 'America/Mexico_City',
        'mx': 'America/Mexico_City',
        'ciudad de méxico': 'America/Mexico_City',
        'cdmx': 'America/Mexico_City',
        'guadalajara': 'America/Mexico_City',
        'monterrey': 'America/Monterrey',
        'tijuana': 'America/Tijuana',
        'cancún': 'America/Cancun',
        'cancun': 'America/Cancun',
        
        # España
        'españa': 'Europe/Madrid',
        'spain': 'Europe/Madrid',
        'madrid': 'Europe/Madrid',
        'barcelona': 'Europe/Madrid',
        'valencia': 'Europe/Madrid',
        'sevilla': 'Europe/Madrid',
        
        # Estados Unidos
        'united states': 'America/New_York',
        'usa': 'America/New_York',
        'new york': 'America/New_York',
        'los angeles': 'America/Los_Angeles',
        'chicago': 'America/Chicago',
        'miami': 'America/New_York',
        
        # Colombia
        'colombia': 'America/Bogota',
        'bogotá': 'America/Bogota',
        'bogota': 'America/Bogota',
        'medellín': 'America/Bogota',
        'medellin': 'America/Bogota',
        
        # Argentina
        'argentina': 'America/Argentina/Buenos_Aires',
        'buenos aires': 'America/Argentina/Buenos_Aires',
        
        # Chile
        'chile': 'America/Santiago',
        'santiago': 'America/Santiago',
        
        # Peru
        'perú': 'America/Lima',
        'peru': 'America/Lima',
        'lima': 'America/Lima',
    }
    
    @classmethod
    def get_timezone_from_address(cls, address: str) -> str:
        """
        Obtiene la zona horaria basada en una dirección
        
        Args:
            address: Dirección completa (ej: "Moctezuma 2da Sección, Ciudad de México, CDMX, México")
        
        Returns:
            str: Zona horaria (ej: "America/Mexico_City")
        """
        if not address:
            return 'UTC'
        
        address_lower = address.lower()
        
                # Buscar coincidencias en el mapa de zonas horarias        for location_key, timezone in cls.TIMEZONE_MAP.items():            if location_key in address_lower:                return timezone
        
        # Si no encuentra coincidencia, intentar con Google Maps API (opcional)
        timezone_from_api = cls._get_timezone_from_google_api(address)
        if timezone_from_api:
            return timezone_from_api
        
        # Por defecto usar UTC
        print(f"⚠️ No se pudo determinar zona horaria para '{address}', usando UTC")
        return 'UTC'        @classmethod    def _get_timezone_from_google_api(cls, address: str) -> Optional[str]:        """        Obtiene la zona horaria usando Google Maps API (opcional)        Requiere GOOGLE_MAPS_API_KEY en variables de entorno        """        try:            import os            api_key = os.getenv('GOOGLE_MAPS_API_KEY')            if not api_key:                return None                        # Primero geocodificar la dirección            geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json"            geocode_params = {                'address': address,                'key': api_key            }                        geocode_response = requests.get(geocode_url, params=geocode_params, timeout=5)            geocode_data = geocode_response.json()                        if geocode_data['status'] != 'OK' or not geocode_data['results']:                return None                        # Obtener coordenadas            location = geocode_data['results'][0]['geometry']['location']            lat, lng = location['lat'], location['lng']                        # Obtener zona horaria para las coordenadas            timezone_url = f"https://maps.googleapis.com/maps/api/timezone/json"            timezone_params = {                'location': f"{lat},{lng}",                'timestamp': int(datetime.now().timestamp()),                'key': api_key            }                        timezone_response = requests.get(timezone_url, params=timezone_params, timeout=5)            timezone_data = timezone_response.json()                        if timezone_data['status'] == 'OK':                return timezone_data['timeZoneId']                    except Exception as e:            print(f"Error obteniendo zona horaria de Google API: {str(e)}")                return None    @classmethod
    def convert_utc_to_local(cls, utc_datetime: datetime, address: str) -> datetime:
        """
        Convierte una fecha UTC a la zona horaria local basada en la dirección
        
        Args:
            utc_datetime: Fecha/hora en UTC
            address: Dirección para determinar zona horaria
        
        Returns:
            datetime: Fecha/hora en zona horaria local
        """
        if not utc_datetime:
            return utc_datetime
        
        try:
            # Obtener zona horaria
            timezone_str = cls.get_timezone_from_address(address)
            timezone = pytz.timezone(timezone_str)
            
            # Asegurar que la fecha está en UTC
            if utc_datetime.tzinfo is None:
                utc_datetime = pytz.UTC.localize(utc_datetime)
            elif utc_datetime.tzinfo != pytz.UTC:
                utc_datetime = utc_datetime.astimezone(pytz.UTC)
            
            # Convertir a zona horaria local
            local_datetime = utc_datetime.astimezone(timezone)
            
            # print(f"🕐 Conversión: {utc_datetime.strftime('%Y-%m-%d %H:%M:%S %Z')} → {local_datetime.strftime('%Y-%m-%d %H:%M:%S %Z')}")
            
            return local_datetime
            
        except Exception as e:
            print(f"Error convirtiendo zona horaria: {str(e)}")
            return utc_datetime
    
    @classmethod
    def convert_local_to_utc(cls, local_datetime: datetime, address: str) -> datetime:
        """
        Convierte una fecha local a UTC basada en la dirección
        
        Args:
            local_datetime: Fecha/hora en zona horaria local
            address: Dirección para determinar zona horaria
        
        Returns:
            datetime: Fecha/hora en UTC
        """
        if not local_datetime:
            return local_datetime
        
        try:
            # Obtener zona horaria
            timezone_str = cls.get_timezone_from_address(address)
            timezone = pytz.timezone(timezone_str)
            
            # Si la fecha no tiene zona horaria, asumimos que está en la zona local
            if local_datetime.tzinfo is None:
                local_datetime = timezone.localize(local_datetime)
            
            # Convertir a UTC
            utc_datetime = local_datetime.astimezone(pytz.UTC)
            
            print(f"🕐 Conversión a UTC: {local_datetime.strftime('%Y-%m-%d %H:%M:%S %Z')} → {utc_datetime.strftime('%Y-%m-%d %H:%M:%S %Z')}")
            
            return utc_datetime
            
        except Exception as e:
            print(f"Error convirtiendo a UTC: {str(e)}")
            return local_datetime
    
    @classmethod
    def get_driver_availability_in_local_time(cls, driver_agenda: Dict[str, Any], address: str) -> Dict[str, Any]:
        """
        Convierte la agenda de un conductor de UTC a tiempo local
        
        Args:
            driver_agenda: Agenda del conductor con fechas en UTC
            address: Dirección para determinar zona horaria
        
        Returns:
            Dict: Agenda con fechas convertidas a tiempo local
        """
        if not driver_agenda or 'availability' not in driver_agenda:
            return driver_agenda
        
        try:
            # Hacer una copia para no modificar el original
            local_agenda = driver_agenda.copy()
            local_agenda['availability'] = []
            
            for slot in driver_agenda['availability']:
                local_slot = slot.copy()
                
                # Convertir fechas de inicio y fin
                if 'start_date' in slot and slot['start_date']:
                    local_slot['start_date'] = cls.convert_utc_to_local(slot['start_date'], address)
                
                if 'end_date' in slot and slot['end_date']:
                    local_slot['end_date'] = cls.convert_utc_to_local(slot['end_date'], address)
                
                local_agenda['availability'].append(local_slot)
            
            return local_agenda
            
        except Exception as e:
            print(f"Error convirtiendo agenda a tiempo local: {str(e)}")
            return driver_agenda
    
    @classmethod
    def format_time_for_display(cls, dt: datetime, address: str) -> str:
        """
        Formatea una fecha/hora para mostrar en la zona horaria local
        
        Args:
            dt: Fecha/hora a formatear
            address: Dirección para determinar zona horaria
        
        Returns:
            str: Fecha/hora formateada (ej: "14:30 GMT-6")
        """
        if not dt:
            return ""
        
        try:
            local_dt = cls.convert_utc_to_local(dt, address)
            
            # Obtener información de zona horaria
            timezone_str = cls.get_timezone_from_address(address)
            timezone = pytz.timezone(timezone_str)
            
            # Formatear con información de zona horaria
            return local_dt.strftime('%H:%M %Z')
            
        except Exception as e:
            print(f"Error formateando fecha: {str(e)}")
            return dt.strftime('%H:%M UTC') if dt else ""
    
    @classmethod
    def is_driver_available_local_time(cls, driver_agenda: Dict[str, Any], 
                                     request_start: datetime, request_end: datetime, 
                                     address: str) -> bool:
        """
        Verifica si un conductor está disponible comparando en tiempo local
        
        Args:
            driver_agenda: Agenda del conductor
            request_start: Hora de inicio solicitada (en tiempo local)
            request_end: Hora de fin solicitada (en tiempo local)
            address: Dirección para zona horaria
        
        Returns:
            bool: True si está disponible
        """
        try:
            # Convertir agenda a tiempo local
            local_agenda = cls.get_driver_availability_in_local_time(driver_agenda, address)
            
            # Buscar slots disponibles que cubran el período solicitado
            for slot in local_agenda.get('availability', []):
                if slot.get('status') != 'available':
                    continue
                
                slot_start = slot.get('start_date')
                slot_end = slot.get('end_date')
                
                if not slot_start or not slot_end:
                    continue
                
                # Verificar si el slot cubre completamente el período solicitado
                if slot_start <= request_start and slot_end >= request_end:
                    print(f"✅ Conductor disponible: {slot_start.strftime('%Y-%m-%d %H:%M')} - {slot_end.strftime('%Y-%m-%d %H:%M')}")
                    return True
            
            print(f"❌ Conductor no disponible para: {request_start.strftime('%Y-%m-%d %H:%M')} - {request_end.strftime('%Y-%m-%d %H:%M')}")
            return False
            
        except Exception as e:
            print(f"Error verificando disponibilidad en tiempo local: {str(e)}")
            return False 