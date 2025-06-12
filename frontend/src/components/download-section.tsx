import { Button } from "@/components/ui/button"
import Image from "@/components/ui/image"
import { RetroGridWithRoute } from "@/components/ui/retro-grid-with-route"

export default function DownloadSection() {
  return (
    <div className="relative bg-black text-white py-16 w-full overflow-hidden">
      {/* Fondo animado tipo grid con ruta */}
      <RetroGridWithRoute className="z-0" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold mb-4">Chóferes al alcance de su mano</h2>
          <p className="text-lg mb-8">
            Descargue la aplicación de Privyde para reservar fácilmente viajes seguros y privados mientras se
            desplaza.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-3 rounded-lg w-32 h-32 flex items-center justify-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="text-black text-center font-bold">QR Code</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/appstore.png" alt="Download on the App Store" width={130} height={40} />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/googleplay.png" alt="Get it on Google Play" width={130} height={40} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 