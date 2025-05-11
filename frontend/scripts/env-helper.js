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

// Valores que queremos establecer
const envValues = {
  VITE_API_URL: 'http://localhost:5000/api',
  VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_51Gwqz5KCraMsIVbxYFpmwi9sCKsIUjwXT8zBl84P8fj7CEh2N8KfzBz9AlVxe6i4vERIJfUEY8CAKWHJx903xwn700k3IJ2sEu'
};

// Crear contenido del archivo .env
const envContent = Object.entries(envValues)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Escribir en ambos archivos .env
try {
  // Escribir en .env
  fs.writeFileSync(envFilePath, envContent, 'utf8');
  console.log(`Archivo .env actualizado en: ${envFilePath}`);
  
  // Escribir en .env.development.local
  fs.writeFileSync(envDevLocalPath, envContent, 'utf8');
  console.log(`Archivo .env.development.local actualizado en: ${envDevLocalPath}`);
  
  console.log('\nContenido:');
  console.log(envContent);
  
  console.log('\nRecuerda reiniciar el servidor de desarrollo para que los cambios surtan efecto.');
} catch (error) {
  console.error('Error al actualizar los archivos .env:', error);
} 