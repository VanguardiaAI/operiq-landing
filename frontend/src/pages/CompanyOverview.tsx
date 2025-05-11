import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, ArrowRight } from "lucide-react";

const CompanyOverview = () => {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section with Full-Width Image */}
      <div className="relative bg-white overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10"></div>
        <img 
          src="/images/ejecutivo-tablet.png" 
          alt="Ejecutivo usando tablet en el asiento trasero de un Mercedes-Benz" 
          className="w-full h-[600px] object-cover object-center"
        />
        <div className="absolute inset-0 flex items-center z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Descubra servicios de transporte corporativo <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300">fiables</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content with Centered Max Width */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-6xl">
        {/* Introduction Section with Subheading */}
        <section className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
            Servicios de chófer a nivel mundial galardonados
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>

          {/* Services Grid with 3 Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {/* Service 1 */}
            <div className="bg-white p-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 flex flex-col">
              <div className="w-full h-60 overflow-hidden">
                <img 
                  src="/images/chauffeur-waiting-client.jpg" 
                  alt="Chófer esperando al cliente junto al coche" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Viaje de negocios</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                  No importa si se trata de reuniones con clientes, viajes de negocios o asistencias a conferencias, cubriremos sus necesidades de transporte corporativo.
                </p>
                <Link to="#" className="flex items-center text-red-500 font-medium hover:text-red-600 group transition-colors duration-300">
                  Descubra los viajes corporativos
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            
            {/* Service 2 */}
            <div className="bg-white p-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 flex flex-col">
              <div className="w-full h-60 overflow-hidden">
                <img 
                  src="/images/chauffeur-opening-door.jpg" 
                  alt="Chófer abriendo la puerta para el cliente" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Agencias de viajes</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                  Agregue una fuente de ingresos adicional a su agencia de viajes ofreciendo experiencias memorables de principio a fin a sus clientes.
                </p>
                <Link to="#" className="flex items-center text-red-500 font-medium hover:text-red-600 group transition-colors duration-300">
                  Descubra los servicios de agencia de viajes
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            
            {/* Service 3 */}
            <div className="bg-white p-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 flex flex-col">
              <div className="w-full h-60 overflow-hidden">
                <img 
                  src="/images/chauffeur-door-view.jpg" 
                  alt="Vista desde arriba del chófer abriendo la puerta" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Servicios complementarios</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                  Ofrezca a sus clientes un valioso servicio de transporte de lujo con nuestras soluciones empresariales personalizadas y una asistencia prioritaria.
                </p>
                <Link to="#" className="flex items-center text-red-500 font-medium hover:text-red-600 group transition-colors duration-300">
                  Descubra las alianzas estratégicas
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-2xl shadow-sm text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">¿Comenzamos?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Comience hoy mismo y cree su propia cuenta en unos minutos.
          </p>
          <button className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            Crear una cuenta
          </button>
        </section>

        {/* Testimonial Section */}
        <section className="mb-32">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-12 rounded-xl mb-10 max-w-4xl mx-auto shadow-lg">
            <blockquote className="italic text-xl text-white mb-6 relative">
              <span className="text-5xl text-red-400 absolute -top-6 -left-2">"</span>
              I can always rely on Operiq to provide our customers with a reliable, professional, and elegant service, with new and clean vehicles that always leave a good impression.
              <span className="text-5xl text-red-400 absolute -bottom-10 -right-2">"</span>
            </blockquote>
            <p className="text-right font-medium mt-2 text-gray-200">Witta Wette, Project Manager, American Express Meetings & Events</p>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16 relative">
            ¿Por qué elegir Operiq?
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Fiabilidad global</h3>
              <p className="text-gray-600 leading-relaxed">
                Cuente con una confirmación inmediata y un servicio de alta calidad para sus clientes en más de 50 países.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Precios competitivos</h3>
              <p className="text-gray-600 leading-relaxed">
                Acceda a un servicio de primera calidad a precios basados en la distancia que son justos para usted y para nuestros chóferes.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Flexibilidad incomparable</h3>
              <p className="text-gray-600 leading-relaxed">
                Diga adiós al estrés a la hora de gestionar viajes de negocios con nuestras políticas de cancelación flexibles.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Asistencia prioritaria</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestros clientes corporativos siempre reciben asistencia multilingüe 24/7.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Gestión de viajes simplificada</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestro portal de reservas a medida hace que la gestión de viajes sea rápida y fácil.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Sostenibilidad</h3>
              <p className="text-gray-600 leading-relaxed">
                Estamos orgullosos de ofrecer una variedad de vehículos eléctricos. Además, nos aseguramos de compensar nuestra huella de carbono.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16 bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-2xl shadow-sm text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">¿Tiene alguna pregunta?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Contáctanos
          </p>
          <button className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            Póngase en contacto
          </button>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CompanyOverview; 