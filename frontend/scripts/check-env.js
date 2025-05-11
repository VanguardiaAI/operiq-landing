// Script para verificar las variables de entorno
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener la ruta del directorio actual usando ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta a los archivos .env en el frontend
const envPaths = [
  join(__dirname, '..', '.env'),
  join(__dirname, '..', '.env.local'),
  join(__dirname, '..', '.env.development'),
  join(__dirname, '..', '.env.development.local'),
];

console.log('🔍 Verificando archivos .env:');

// Verificar la existencia y contenido de cada archivo .env
envPaths.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const variables = content.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => {
        const [key, value] = line.split('=');
        // Oculta parcialmente valores sensibles
        if (key.includes('KEY') || key.includes('SECRET')) {
          return `${key}=${value ? value.substring(0, 10) + '...' + value.substring(value.length - 4) : 'no definida'}`;
        }
        return `${key}=${value}`;
      });

    console.log(`\n✅ ${filePath} existe:`);
    variables.forEach(v => console.log(`  ${v}`));
  } else {
    console.log(`\n❌ ${filePath} no existe`);
  }
});

console.log('\n📋 Instrucciones para solucionar problemas:');
console.log('1. Asegúrate de que al menos uno de estos archivos existe y contiene tus variables');
console.log('2. Si modificas cualquier archivo .env, reinicia el servidor de desarrollo');
console.log('3. Las variables DEBEN comenzar con VITE_ para ser accesibles en el código cliente');
console.log('4. Orden de prioridad: .env.development.local > .env.development > .env.local > .env'); 