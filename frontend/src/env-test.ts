// Archivo de prueba para verificar variables de entorno
console.log('ENV TEST - Verificando carga de variables:');

// Función para ocultar parcialmente valores sensibles
const maskSensitiveValue = (value: string | undefined, prefix = 6, suffix = 4): string => {
  if (!value) return 'no definido';
  if (value.length <= prefix + suffix) return value;
  return `${value.substring(0, prefix)}...${value.substring(value.length - suffix)}`;
};

// Variables a verificar
const apiUrl = import.meta.env.VITE_API_URL;
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Mostrar información de diagnóstico
console.log({
  'VITE_API_URL': apiUrl,
  'VITE_STRIPE_PUBLISHABLE_KEY': stripeKey ? maskSensitiveValue(stripeKey) : 'no definido',
  'VITE_GOOGLE_MAPS_API_KEY': googleMapsKey ? maskSensitiveValue(googleMapsKey) : 'no definido',
  'BASE_URL': import.meta.env.BASE_URL,
  'MODE': import.meta.env.MODE,
  'DEV': import.meta.env.DEV,
  'PROD': import.meta.env.PROD,
  'SSR': import.meta.env.SSR,
});

// También verificar si las variables están disponibles en process.env
// (si se configuró correctamente en vite.config.ts)
console.log('\nVerificando process.env:');
try {
  const processEnv = (window as any).process?.env || {};
  console.log({
    'process.env.VITE_GOOGLE_MAPS_API_KEY': processEnv.VITE_GOOGLE_MAPS_API_KEY ? 
      maskSensitiveValue(processEnv.VITE_GOOGLE_MAPS_API_KEY) : 'no definido'
  });
} catch (error) {
  console.log('Error al acceder a process.env:', error);
}

// Función para verificar la validez de la API Key de Google Maps
const checkGoogleMapsApiKey = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error('ERROR: API Key de Google Maps no encontrada.');
    return false;
  }
  
  if (apiKey === 'TU_API_KEY_DE_GOOGLE_MAPS' || apiKey.includes('...')) {
    console.error('ERROR: API Key de Google Maps es un placeholder. Debes configurar una API key real en el archivo .env');
    return false;
  }
  
  // Verificar si la key tiene un formato válido (generalmente comienza con "AIza")
  if (!apiKey.startsWith('AIza')) {
    console.error('ERROR: API Key de Google Maps no tiene el formato esperado (debería comenzar con "AIza").');
    return false;
  }
  
  console.log('✅ API Key de Google Maps parece válida. Formato correcto detectado.');
  return true;
};

// Prueba práctica: intentar cargar una imagen estática de Google Maps
const testGoogleMapsApiCall = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'TU_API_KEY_DE_GOOGLE_MAPS') return;
  
  const testUrl = `https://maps.googleapis.com/maps/api/staticmap?center=19.4326,-99.1332&zoom=14&size=400x400&key=${apiKey}`;
  
  console.log('Probando conexión a Google Maps API...');
  
  // Crear una imagen para probar la carga
  const img = new Image();
  img.onload = () => {
    console.log('✅ Conexión a Google Maps API exitosa. La imagen se cargó correctamente.');
  };
  img.onerror = (error) => {
    console.error('❌ Error al conectar con Google Maps API. Verifica que la API key sea válida y tenga los permisos necesarios.');
    console.error('Detalles:', error);
  };
  
  // Iniciar la carga (no mostramos la imagen realmente)
  img.src = testUrl;
};

// Ejecutar verificaciones
const isGoogleMapsApiKeyValid = checkGoogleMapsApiKey();
if (isGoogleMapsApiKeyValid) {
  testGoogleMapsApiCall();
}

// Exportamos funciones para que puedan ser importadas
export const getEnv = () => {
  return {
    apiUrl,
    stripeKey,
    googleMapsKey,
    isGoogleMapsApiKeyValid,
    // Función útil para componentes que quieran mostrar parte de la key
    maskApiKey: (key?: string) => key ? maskSensitiveValue(key) : 'no definido'
  };
}; 