import { Linkedin, Instagram, Facebook, Youtube, Twitter } from "lucide-react"
import Image from "@/components/ui/image"
import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        {/* Logo, Ayuda & App Buttons */}
        <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-8">
          <div>
            <Link to="/" className="text-2xl font-bold mb-8 block">OPERIQ</Link>
            <div className="flex space-x-3">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/appstore.png" alt="Download on the App Store" width={100} height={35} />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/googleplay.png" alt="Get it on Google Play" width={100} height={35} />
              </a>
            </div>
          </div>
          <a href="#" className="flex items-center hover:text-gray-300">
            <span className="mr-2 h-5 w-5 rounded-full border border-white flex items-center justify-center text-sm">?</span>
            Ayuda
          </a>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Empresa */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm">Sobre Nosotros</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Career</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Press</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Iniciativas ecológicas</a></li>
              <li><Link to="/drivers" className="text-gray-400 hover:text-white text-sm">Conviértase en socio del chófer</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Influencers</a></li>
            </ul>
          </div>

          {/* Operiq for Business */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Operiq for Business</h4>
            <ul className="space-y-2">
              <li><Link to="/company-overview" className="text-gray-400 hover:text-white text-sm">Resumen</Link></li>
              <li><Link to="/companies" className="text-gray-400 hover:text-white text-sm">Empresas</Link></li>
              <li><Link to="/travel-agencies" className="text-gray-400 hover:text-white text-sm">Agencias de viajes</Link></li>
              <li><Link to="/strategic-partnerships" className="text-gray-400 hover:text-white text-sm">Asociaciones estratégicas</Link></li>
            </ul>
          </div>

          {/* Principales ciudades */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Principales ciudades</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Nueva York</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Londres</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Berlín</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Los Angeles</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Paris</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Todas las ciudades</a></li>
            </ul>
          </div>

          {/* Explorar */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Explorar</h4>
            <ul className="space-y-2">
              <li><Link to="/city-to-city" className="text-gray-400 hover:text-white text-sm">Viajes de ciudad a ciudad</Link></li>
              <li><Link to="/airport-transfers" className="text-gray-400 hover:text-white text-sm">Transfer al aeropuerto</Link></li>
              <li><Link to="/hourly-hire" className="text-gray-400 hover:text-white text-sm">Alquiler por horas/días</Link></li>
              <li><Link to="/special-events" className="text-gray-400 hover:text-white text-sm">Servicios para eventos especiales</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Larga distancia</a></li>
              <li><Link to="/limousine-service" className="text-gray-400 hover:text-white text-sm">Servicio de limusinas</Link></li>
              <li><Link to="/private-jets" className="text-gray-400 hover:text-white text-sm">Jets privados</Link></li>
              <li><Link to="/corporate-transfers" className="text-gray-400 hover:text-white text-sm">Traslados corporativos VIP</Link></li>
              <li><Link to="/security-services" className="text-gray-400 hover:text-white text-sm">Servicios de seguridad ejecutiva</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Servicios de chófer</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Coche privado</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Ground transportation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">All countries</a></li>
            </ul>
          </div>

          {/* Viajes de ciudad a ciudad */}
          <div>
            <div className="flex items-center mb-4">
              <h4 className="text-lg font-semibold">Viajes de ciudad a ciudad</h4>
              <span className="ml-2 bg-white text-black text-xs font-semibold px-2 py-0.5 rounded">NUEVO</span>
            </div>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">East Hampton - Nueva York</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Los Angeles - San Diego</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Miami - Palm Beach</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">London - Bristol</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Dubai - Abu Dhabi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm">Paris - Reims</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row md:justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-400">© 2025 Operiq GmbH</p>
          </div>
          <div className="flex flex-wrap mb-4 md:mb-0">
            <a href="#" className="text-sm text-gray-400 hover:text-white mr-6 mb-2">Condiciones</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white mr-6 mb-2">Política de privacidad</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white mr-6 mb-2">Aviso legal</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white mb-2">Accesibilidad</a>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Youtube className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
