// Script para ayudar a gestionar las variables de entorno
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener la ruta del directorio actual usando ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta al archivo .env en el frontend
const envFilePath = join(__dirname, '..', '.env');
const envDevLocalPath = join(__dirname, '..', '.env.development.local');
const sampleEnvPath = join(__dirname, '..', 'sample.env');

// Verifica si ya existe un archivo .env para leer los valores actuales
let currentEnv = {};
try {
  if (fs.existsSync(envFilePath)) {
    const content = fs.readFileSync(envFilePath, 'utf8');
    content.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        currentEnv[key.trim()] = value.trim();
      }
    });
    console.log('Valores actuales leídos del archivo .env existente');
  }
} catch (err) {
  console.log('No se pudo leer el archivo .env existente:', err.message);
}

// Función para verificar si una API key de Google Maps parece válida
const isValidGoogleMapsApiKey = (key) => {
  if (!key || key === 'TU_API_KEY_DE_GOOGLE_MAPS' || key.includes('...')) {
    return false;
  }
  // Las API keys de Google generalmente comienzan con "AIza"
  return key.startsWith('AIza');
};

// Valores que queremos establecer/mantener
const envValues = {
  VITE_API_URL: 'http://localhost:5000/api',
  VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_51Gwqz5KCraMsIVbxYFpmwi9sCKsIUjwXT8zBl84P8fj7CEh2N8KfzBz9AlVxe6i4vERIJfUEY8CAKWHJx903xwn700k3IJ2sEu',
  // Conservar la API key de Google Maps si ya existe y es válida
  VITE_GOOGLE_MAPS_API_KEY: isValidGoogleMapsApiKey(currentEnv.VITE_GOOGLE_MAPS_API_KEY) 
    ? currentEnv.VITE_GOOGLE_MAPS_API_KEY 
    : 'TU_API_KEY_DE_GOOGLE_MAPS'
};

// Crear contenido del archivo .env
const envContent = Object.entries(envValues)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Crear contenido para sample.env (sin valores reales para APIs sensibles)
const sampleEnvContent = `VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=TU_API_KEY_DE_GOOGLE_MAPS
VITE_STRIPE_PUBLISHABLE_KEY=TU_STRIPE_KEY
`;

// Escribir en los archivos .env
try {
  // Escribir en .env
  fs.writeFileSync(envFilePath, envContent, 'utf8');
  console.log(`Archivo .env actualizado en: ${envFilePath}`);
  
  // Escribir en .env.development.local
  fs.writeFileSync(envDevLocalPath, envContent, 'utf8');
  console.log(`Archivo .env.development.local actualizado en: ${envDevLocalPath}`);
  
  // Actualizar sample.env
  fs.writeFileSync(sampleEnvPath, sampleEnvContent, 'utf8');
  console.log(`Archivo sample.env actualizado en: ${sampleEnvPath}`);
  
  console.log('\nContenido .env:');
  console.log(envContent.replace(/VITE_GOOGLE_MAPS_API_KEY=(.+)/, (match, key) => {
    // Oculta la API key real en la consola por seguridad
    return isValidGoogleMapsApiKey(key) 
      ? `VITE_GOOGLE_MAPS_API_KEY=${key.substring(0, 6)}...${key.substring(key.length - 4)}` 
      : match;
  }));
  
  console.log('\nRecuerda:');
  console.log('1. Si ves "TU_API_KEY_DE_GOOGLE_MAPS", necesitas configurar una API key válida de Google Maps.');
  console.log('2. Reinicia el servidor de desarrollo para que los cambios surtan efecto.');
} catch (error) {
  console.error('Error al actualizar los archivos .env:', error);
} 