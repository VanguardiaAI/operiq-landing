import { Button } from "@/components/ui/button";

const BookingsFilters = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-sm p-4 lg:flex-1">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Filtros</h3>
        <div className="flex flex-wrap gap-2">
          <div className="w-full sm:w-auto">
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Cancelados</option>
              <option value="no_show">No presentados</option>
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Fecha desde"
            />
          </div>
          <div className="w-full sm:w-auto">
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Fecha hasta"
            />
          </div>
          <Button variant="outline" size="sm">
            Aplicar filtros
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:flex-1">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-xs text-gray-500">Hoy</h3>
          <p className="text-2xl font-semibold mt-1">12</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-xs text-gray-500">Pendientes</h3>
          <p className="text-2xl font-semibold mt-1 text-amber-600">8</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-xs text-gray-500">En progreso</h3>
          <p className="text-2xl font-semibold mt-1 text-gray-600">3</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-xs text-gray-500">Incidencias</h3>
          <p className="text-2xl font-semibold mt-1 text-gray-600">2</p>
        </div>
      </div>
    </div>
  );
};

export default BookingsFilters; 