import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const Drivers = () => {
  // Estado para controlar qué FAQ está abierta
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Toggle para abrir/cerrar FAQs
  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  // Datos de las preguntas frecuentes
  const faqData = [
    {
      question: "¿Puede cualquiera convertirse en socio de Operiq?",
      answer: (
        <>
          <p className="text-gray-600 mb-4">
            Solo nos asociamos con empresas de chóferes aseguradas ya existentes. Para hacer una solicitud, debe:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2 text-left">
            <li className="text-gray-600 text-left">Cumplir los nuestros requisitos para los vehículos</li>
            <li className="text-gray-600 text-left">Enviar la documentación de su negocio, un vehículo y de usted mismo o de uno de los chóferes de su empresa</li>
          </ul>
          <p className="text-gray-600">
            Una vez su cuenta esté activa, puede agregar tantos vehículos y chóferes como quiera. Puede consultar los requisitos de vehículo y documentación de su ciudad y comenzar su solicitud de socio aquí.
          </p>
        </>
      ),
    },
    {
      question: "¿Cuántos viajes puedo hacer al mes con Operiq?",
      answer: (
        <p className="text-gray-600">
          La cantidad de viajes que realice depende totalmente de usted. Puede aceptar tantos viajes como su capacidad permita. El volumen de viajes ofrecido depende de la demanda regional y estacional.
        </p>
      ),
    },
    {
      question: "¿Cómo recibo los pagos?",
      answer: (
        <>
          <p className="text-gray-600">
            Al principio de cada mes, le enviaremos una factura con los detalles de todos los viajes realizados el mes anterior. Su factura también incluirá cualquier compensación adicional por extras, como el tiempo de espera o los cambios de ruta.
          </p>
          <p className="text-gray-600 mt-3">
            Los pagos se realizan mediante transferencia bancaria y suelen aparecer en su cuenta antes del 17 de cada mes.
          </p>
        </>
      ),
    },
    {
      question: "¿Qué vehículos puedo usar para trabajar con Operiq?",
      answer: (
        <p className="text-gray-600">
          Solo pueden usarse determinados vehículos para los viajes de Operiq. Los requisitos del vehículo pueden variar según la ciudad en la que trabaje, y puede encontrar la lista de vehículos que necesita aquí. No tiene más que seleccionar el país y la ciudad sobre los que desea obtener más información.
        </p>
      ),
    },
    {
      question: "¿Cómo puedo asociarme con Blackane?",
      answer: (
        <>
          <p className="text-gray-600">
            Nuestro proceso de solicitud de asociación nos ayuda a encontrar los mejores servicios de chófer profesional disponibles. Solo trabajamos con empresas de chófer aseguradas y con licencia, y nuestros requisitos de documentación se basan en las normativas locales, por lo que no debería necesitar ningún papeleo adicional para comenzar.
          </p>
          <p className="text-gray-600 mt-3">
            Una vez aprobada su documentación, el último paso del proceso de registro consistirá en participar en una sesión de seminario web en grupo en línea. Esta entrevista nos brinda la oportunidad de conocernos y hacer preguntas sobre nuestras expectativas mutuas respecto a nuestra nueva asociación. Después del seminario web, ¡estará listo para comenzar!
          </p>
          <p className="text-gray-600 mt-3">
            Puede comenzar su solicitud de asociación aquí.
          </p>
        </>
      ),
    },
    {
      question: "¿Funciona Operiq con vehículos eléctricos?",
      answer: (
        <>
          <p className="text-gray-600">
            ¡Sí! En algunos mercados, los clientes pueden solicitar vehículos eléctricos específicamente y, en muchos otros, pasan a formar parte de nuestra flota regular. Además, nuestra flota en Dubai es ahora completamente eléctrica.
          </p>
          <p className="text-gray-600 mt-3">
            Animamos a invertir en vehículos eléctricos, no solo porque es mejor para su huella de carbono, sino porque la demanda de los clientes está aumentando, junto con los precios de los combustibles fósiles.
          </p>
          <p className="text-gray-600 mt-3">
            Solo se pueden utilizar vehículos totalmente eléctricos para realizar viajes con vehículos eléctricos. Los modelos eléctricos aceptados pueden variar según la ciudad en la que trabaje; puede encontrar la lista de vehículos que necesita aquí.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section with Full-Width Image */}
      <div className="relative bg-white overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10"></div>
        <img 
          src="/images/airport.jpeg" 
          alt="Chófer esperando a un cliente" 
          className="w-full h-[600px] object-cover object-center"
        />
        <div className="absolute inset-0 flex items-center z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Conviértase en socio de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300">servicios de chófer</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content with Centered Max Width */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-6xl">
        {/* Introduction Section with Testimonial */}
        <section className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 relative">
            Haga crecer su negocio con Operiq
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            La aplicación y el portal web de Operiq conectan a los socios de servicio chófer con licencia y seguro con una base de clientes global de viajeros de negocios y ocio. Puede completar algún hueco de su horario o incluso podríamos convertirnos en su principal fuente de viajes. Nuestros precios competitivos normalmente se ajustan a las tarifas del mercado local, y nuestro compromiso inquebrantable con la calidad nos permite ofrecer tarifas justas a los chóferes, al tiempo que garantiza un servicio excepcional a los pasajeros.
          </p>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl mb-10 max-w-4xl mx-auto shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md">
            <blockquote className="italic text-xl text-gray-700 mb-4 relative">
              <span className="text-5xl text-red-400 absolute -top-6 -left-2">"</span>
              Operiq is 60% of my revenue. I've grown from 2 to 20 chauffeurs and have 10 vehicles from working with them.
              <span className="text-5xl text-red-400 absolute -bottom-10 -right-2">"</span>
            </blockquote>
            <p className="text-right font-medium mt-2 text-gray-800">Angel T., Operiq chauffeur, Madrid</p>
          </div>
        </section>

        {/* Benefits Grid with Improved Design */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Pagos fiables</h3>
              <p className="text-gray-600 leading-relaxed">
                La cantidad que se muestra en cada oferta es el mínimo que se transferirá a su cuenta; no deducimos más tarifas ni impuestos. Los pagos mensuales de sus viajes completados se depositarán directamente en su cuenta bancaria.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Control completo de horarios</h3>
              <p className="text-gray-600 leading-relaxed">
                Seleccione sus viajes a través de nuestra subasta inversa. Cree su propio horario y simplemente realice los viajes que mejor se adapten a su disponibilidad, ubicación y tipo de vehículo. ¡Ofrecemos reservas por horas, viajes de ciudad a ciudad y mucho más!
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Únase a un equipo internacional</h3>
              <p className="text-gray-600 leading-relaxed">
                Como miembro del equipo de Operiq, podrá decir que forma parte de un servicio internacional, ya que organizamos viajes para nuestros socios y sus huéspedes en más de 50 países.
              </p>
            </div>
          </div>
        </section>

        {/* Additional Benefits Grid with Enhanced Style */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Gestión de cuentas superior</h3>
              <p className="text-gray-600 leading-relaxed">
                Tanto si se encarga de coordinar los viajes de su equipo como si es un propietario/operador que ofrece viajes en sus huecos libres, nuestra app y el Partner Portal en línea están diseñados para facilitarle la tarea.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Equipo de soporte dedicado</h3>
              <p className="text-gray-600 leading-relaxed">
                Junto con nuestro servicio de atención al cliente 24/7 que ofrece ayuda con los viajes en curso/próximos, nuestro equipo de soporte para socios resuelve problemas de administración 24/5 mediante chat y correo electrónico.
              </p>
            </div>
          </div>
        </section>

        {/* Requirements Section with Enhanced Design */}
        <section className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="/images/limo-equipaje.png" 
                alt="Chófer poniendo equipaje en el maletero" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                Requisitos
                <span className="block w-16 h-1 bg-gradient-to-r from-red-500 to-orange-400 mt-4"></span>
              </h2>
              <ul className="space-y-6 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Poseer un registro de empresa válido, licencias y seguros para todos los chóferes y vehículos.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Mantener los vehículos limpios, sin daños, libres de humo y en pleno cumplimiento de las regulaciones locales.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Mantenerse al día con las nuevas normas y políticas y garantizar una calidad excelente.</span>
                </li>
              </ul>
              <p className="text-gray-600 mb-8 italic">Los detalles varían según la ubicación, consulte los requisitos específicos de su área:</p>
              <button className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                Ver requisitos locales
              </button>
            </div>
          </div>
        </section>

        {/* Registration Section with Enhanced Design */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                Incorporación
                <span className="block w-16 h-1 bg-gradient-to-r from-red-500 to-orange-400 mt-4"></span>
              </h2>
              <p className="text-lg text-gray-700 mb-6 font-medium">Consiga su permiso de viajes en cuatro pasos:</p>
              <ol className="space-y-6 mb-10 list-none ml-0">
                <li className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold mr-4 flex-shrink-0">1</span>
                  <span className="text-gray-700 text-left">Solicítelo a través de nuestro portal de incorporación</span>
                </li>
                <li className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold mr-4 flex-shrink-0">2</span>
                  <span className="text-gray-700 text-left">Suba su documentación para que nuestro equipo la revise</span>
                </li>
                <li className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold mr-4 flex-shrink-0">3</span>
                  <span className="text-gray-700 text-left">Complete los módulos de formación y acceda a una breve entrevista con nosotros</span>
                </li>
                <li className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold mr-4 flex-shrink-0">4</span>
                  <span className="text-gray-700 text-left">¡Acepte su primer viaje!</span>
                </li>
              </ol>
              <button className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                Solicitar ahora
              </button>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="/images/woman-client.jpeg" 
                alt="Cliente caminando hacia su chófer" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Sustainable Future Section with Enhanced Design */}
        <section className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="/images/futuristic-city-choffer.jpeg" 
                alt="Vehículo eléctrico de Operiq" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                Conduciendo hacia un <span className="text-green-600">futuro sostenible</span>
                <span className="block w-16 h-1 bg-gradient-to-r from-green-500 to-green-400 mt-4"></span>
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Comprometidos a reducir nuestro impacto ambiental, estamos en pleno proceso de transformación para que todos nuestros viajes sean eléctricos. Nuestra adquisición del servicio de chófer totalmente eléctrico Havn, con sede en Londres, ha sido uno de nuestros primeros pasos importantes, así como la incorporación de más vehículos eléctricos en nuestras flotas en todo el mundo. Además, cada viaje desde 2017 está compensado en términos de carbono, y estamos trabajando en compensar todas nuestras emisiones de carbono desde la fundación de nuestra empresa en 2011.
              </p>
              <button className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                Más información
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section with Enhanced Design */}
        <section className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
            Preguntas más frecuentes
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>
          
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl border ${openFaqIndex === index ? 'border-red-200 shadow-md' : 'border-gray-200'} overflow-hidden transition-all duration-300`}
              >
                <button
                  className="flex justify-between items-center w-full p-6 text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className={`text-xl font-semibold ${openFaqIndex === index ? 'text-red-600' : 'text-gray-900'}`}>{faq.question}</h3>
                  <div className={`${openFaqIndex === index ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50'} rounded-full p-1 transition-colors duration-300`}>
                    {openFaqIndex === index ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </button>
                <div 
                  className={`transition-all duration-500 ease-in-out ${
                    openFaqIndex === index 
                      ? 'max-h-[1000px] opacity-100' 
                      : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <div className="border-t border-gray-200 pt-4 text-left">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Help Section with Enhanced Design */}
        <section className="mb-16 bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-2xl shadow-lg text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="/images/ejecutivo-tablet.png" 
                alt="Chófer sonriendo" 
                className="w-full h-auto rounded-xl shadow-lg object-cover border-4 border-white"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 relative text-white">
                ¿Todavía tiene alguna pregunta?
                <span className="block w-16 h-1 bg-gradient-to-r from-red-400 to-orange-300 mt-4"></span>
              </h2>
              <p className="text-gray-200 mb-8 leading-relaxed">
                Visite nuestro Centro de ayuda para socios para consultar nuestras preguntas frecuentes detalladas o póngase en contacto directamente con nuestro equipo de soporte.
              </p>
              <button className="bg-white text-gray-900 font-medium h-12 px-8 py-3 rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-100">
                Más información
              </button>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Drivers; 