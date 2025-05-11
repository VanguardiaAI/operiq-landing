// Archivo de prueba para verificar variables de entorno
console.log('ENV TEST - Verificando carga de variables:');
console.log({
  'VITE_API_URL': import.meta.env.VITE_API_URL,
  'VITE_STRIPE_PUBLISHABLE_KEY': import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  'BASE_URL': import.meta.env.BASE_URL,
  'MODE': import.meta.env.MODE,
  'DEV': import.meta.env.DEV,
  'PROD': import.meta.env.PROD,
  'SSR': import.meta.env.SSR,
});

// Exportamos alguna función para que pueda ser importada
export const getEnv = () => {
  return {
    apiUrl: import.meta.env.VITE_API_URL,
    stripeKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  };
}; 