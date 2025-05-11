import { 
  ChevronDown, 
  AlertCircle, 
  Rocket, 
  Heart, 
  PenTool, 
  Puzzle, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter
} from "lucide-react"
import Image from "@/components/ui/image"
import { Link } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

import "../styles/operiq.css"

export default function AboutUs() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      {/* Navigation */}
      <Navbar />

      {/* Title Bar */}
      <div className="title-bar relative">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-black">
            Sobre nosotros
          </h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Redefiniendo la experiencia de viajar</h2>
            <div className="relative h-80 md:h-96 w-full mb-8 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                alt="Empleados de Operiq en reunión"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Operiq ha reinventado la forma de viajar conectando a los viajeros con una red mundial de chóferes profesionales; y no nos detenemos aquí. Nuestra visión sobre el futuro de los viajes se basa en la eficiencia, la sostenibilidad y la ética. Únete a nosotros en nuestro viaje para hacer que nuestro servicio de máxima calidad sea cómodo y accesible en todo el mundo.
            </p>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <div className="relative h-80 md:h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                  alt="Equipo de Operiq en evento"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Más de una década de innovación</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Fundada en 2011 por Jens Wohltorf y Frank Steuer, Operiq nació con el objetivo de ofrecer una forma más eficaz de reservar y gestionar viajes: asequible, fiable y eficiente. Desde entonces, Operiq ha pasado de ser una iniciativa de dos emprendedores en Alemania, a un equipo internacional galardonado de más de 300 personas con sedes en Singapur, España, los Emiratos Árabes Unidos, el Reino Unido y Estados Unidos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Cómo funciona Operiq</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Trabajamos con proveedores locales independientes de servicios de chófer en todo el mundo y, a través de nuestra tecnología, permitimos que los viajeros globales reserven viajes con ellos. No proporcionamos, poseemos ni controlamos ninguno de los viajes ofrecidos por estos proveedores, sino que los facilitamos. Los precios se calculan en función de diversos factores, como la clase del vehículo, la distancia y el tiempo de conducción, y nuestro margen proviene de la venta de esos viajes a proveedores locales independientes de servicios de chofer, generalmente a través de nuestra subasta, donde pueden elegir los viajes que mejor se adapten a ellos.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="relative h-80 w-full mb-8 rounded-lg overflow-hidden max-w-4xl mx-auto">
              <Image
                src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                alt="Chofer abriendo la puerta del auto"
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Nuestros valores fundamentales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
              <div className="p-3 bg-red-50 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sea fiable</h3>
              <p className="text-gray-600">
                Proporcione un servicio en el que los clientes puedan confiar. Sea alguien en quien puedan confiar sus colegas. Trabaje solo con conductores fiables en los que confiemos. Gane confianza y consérvela.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
              <div className="p-3 bg-blue-50 rounded-full mb-4">
                <Rocket className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Abra nuevos caminos</h3>
              <p className="text-gray-600">
                Busque maneras de mejorar. Fomente la curiosidad. Aprenda rápidamente de los errores y crezca a partir de la experiencia. Intente ser mejor cada día. Ofrece un servicio asombroso, siendo líder en la industria y sobrepasa las expectativas de los clientes.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
              <div className="p-3 bg-pink-50 rounded-full mb-4">
                <Heart className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cuidados</h3>
              <p className="text-gray-600">
                Preocúpese por los pasajeros, los conductores y los demás, por nuestra comunidad y por la forma en que retribuimos. Preocúpese por hacer que nuestro producto y servicio sean excepcionales.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
              <div className="p-3 bg-yellow-50 rounded-full mb-4">
                <PenTool className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Haga un esfuerzo extra</h3>
              <p className="text-gray-600">
                Vea más allá de lo que se exige. Sea proactivo para superar las expectativas de los clientes. Si ve algo que podría ser mejor, tome la iniciativa para mejorarlo.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
              <div className="p-3 bg-green-50 rounded-full mb-4">
                <Puzzle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Actúe con integridad</h3>
              <p className="text-gray-600">
                Actúe de manera justa y honesta. Esfuércese por hacer siempre lo correcto por nuestros pasajeros, nuestros chóferes y los demás. Trate a todos con el mismo nivel de respeto.
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-16 text-center">
            <blockquote className="text-2xl font-serif italic text-gray-700">
              "Wherever you are around the world, it's this special feeling of being taken care of."
              <footer className="mt-4 text-sm text-gray-500">
                CEO y cofundador Jens Wohltorf
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Next Steps Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-14 text-center">¿A dónde vamos a partir de aquí?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Equipo de trabajo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Únete al equipo</h3>
                <p className="text-gray-600 mb-4">
                  ¿Estás interesado en convertirte en un Operiq? Has llegado al lugar correcto - casi.
                </p>
                <Link to="/join" className="text-red-500 font-medium hover:text-red-600 transition-colors">
                  Únete
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1553484771-047a44eee27d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Hombre con smartphone"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Prensa</h3>
                <p className="text-gray-600 mb-4">
                  Consulta nuestros logros más destacados y las novedades de la empresa.
                </p>
                <Link to="/news" className="text-red-500 font-medium hover:text-red-600 transition-colors">
                  Últimas noticias
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1559566668-a153bfec01df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Coches de lujo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Blog de viaje</h3>
                <p className="text-gray-600 mb-4">
                  La inspiración está siempre a la vuelta de la esquina... en nuestro blog que reúne todo lo referente a los viajes.
                </p>
                <Link to="/blog" className="text-red-500 font-medium hover:text-red-600 transition-colors">
                  Descubre más
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
} 