// Script para configurar la API key de Google Maps
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { spawn } from 'child_process';

// Configurar paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');

// Crear interfaz para leer desde la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Leer el archivo .env existente
 */
const readEnvFile = () => {
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const envVars = {};
      
      content.split('\n').forEach(line => {
        if (!line || line.startsWith('#')) return;
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      return envVars;
    }
  } catch (error) {
    console.error('Error al leer el archivo .env:', error.message);
  }
  
  return {};
};

/**
 * Guardar el archivo .env con las variables actualizadas
 */
const saveEnvFile = (envVars) => {
  try {
    const content = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('✅ Archivo .env actualizado correctamente.');
  } catch (error) {
    console.error('❌ Error al guardar el archivo .env:', error.message);
  }
};

/**
 * Verificar si una API key de Google Maps parece válida
 */
const isValidGoogleApiKey = (key) => {
  if (!key || key === 'TU_API_KEY_DE_GOOGLE_MAPS' || key.includes('...')) {
    return false;
  }
  
  // Las API keys de Google generalmente comienzan con "AIza"
  return key.startsWith('AIza');
};

/**
 * Función principal
 */
const main = async () => {
  console.log('🗺️  Configuración de Google Maps API Key');
  console.log('==========================================');
  console.log('\nEste script te ayudará a configurar la API key de Google Maps para el proyecto.');
  
  // Leer variables de entorno existentes
  const envVars = readEnvFile();
  const currentKey = envVars.VITE_GOOGLE_MAPS_API_KEY;
  
  console.log('\nInformación actual:');
  if (currentKey) {
    const isValid = isValidGoogleApiKey(currentKey);
    console.log(`API Key: ${currentKey.substring(0, 6)}...${currentKey.substring(currentKey.length - 4)}`);
    console.log(`Estado: ${isValid ? '✅ Parece válida' : '❌ No válida o es un placeholder'}`);
  } else {
    console.log('❌ No se encontró ninguna API key configurada.');
  }
  
  console.log('\nPara obtener una API key de Google Maps:');
  console.log('1. Ve a https://developers.google.com/maps/documentation/javascript/get-api-key');
  console.log('2. Crea un proyecto y habilita las APIs necesarias:');
  console.log('   - Maps JavaScript API');
  console.log('   - Maps Embed API');
  console.log('   - Static Maps API');
  
  // Preguntar al usuario por la nueva API key
  rl.question('\n🔑 Introduce tu API key de Google Maps (o presiona ENTER para mantener la actual): ', (newKey) => {
    if (!newKey.trim() && currentKey) {
      console.log(`Manteniendo la API key actual: ${currentKey.substring(0, 6)}...${currentKey.substring(currentKey.length - 4)}`);
    } else if (newKey.trim()) {
      envVars.VITE_GOOGLE_MAPS_API_KEY = newKey.trim();
      
      // Validar formato básico
      if (isValidGoogleApiKey(newKey)) {
        console.log('✅ La API key tiene el formato correcto.');
      } else {
        console.warn('⚠️ La API key no parece tener el formato correcto (debería comenzar con "AIza").');
        console.warn('   Asegúrate de haber copiado correctamente la clave.');
      }
    }
    
    // Guardar cambios
    saveEnvFile(envVars);
    
    console.log('\n🔄 Para que los cambios surtan efecto:');
    console.log('1. Detén el servidor de desarrollo si está en ejecución');
    console.log('2. Ejecuta "npm run dev" para iniciar de nuevo');
    
    rl.question('\n¿Quieres reiniciar el servidor de desarrollo ahora? (s/n): ', (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si' || answer.toLowerCase() === 'sí') {
        console.log('\n🔄 Reiniciando el servidor de desarrollo...');
        
        // Detectar sistema operativo para usar el comando correcto
        const isWindows = process.platform === 'win32';
        const command = isWindows ? 'npm.cmd' : 'npm';
        
        // Ejecutar npm run dev
        const child = spawn(command, ['run', 'dev'], {
          cwd: rootDir,
          stdio: 'inherit',
          shell: true
        });
        
        child.on('error', (error) => {
          console.error('❌ Error al iniciar el servidor:', error.message);
        });
      } else {
        console.log('\n👋 Finalizado. Recuerda reiniciar el servidor manualmente para aplicar los cambios.');
      }
    });
  });
};

// Ejecutar la función principal
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
}); 