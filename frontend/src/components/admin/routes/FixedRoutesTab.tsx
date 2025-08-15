import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Clock,
  Car,
  User,
  Building,
  X,
  Eye,
  Maximize2,
  Info,
} from "lucide-react";
import { FixedRoute } from "@/components/admin/sections/RoutesSection";
import FixedRouteForm from "./FixedRouteForm";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Nueva interfaz para la información del colaborador
interface Collaborator {
  id: string;
  name: string;
}

interface FixedRoutesTabProps {
  routes: FixedRoute[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateRoute: (routeData: Partial<FixedRoute>) => Promise<boolean>;
  onUpdateRoute: (
    routeId: string,
    routeData: Partial<FixedRoute>,
  ) => Promise<boolean>;
  onDeleteRoute: (routeId: string) => Promise<boolean>;
  onToggleStatus: (routeId: string) => Promise<boolean>;
}

// Componente para inicializar y almacenar la API key de Google Maps
const initGoogleMapsKey = () => {
  // Para simplificar, usamos una API key fija en desarrollo
  // En producción, esta debería venir de variables de entorno
  const HARDCODED_API_KEY = "AIzaSyCU7y7Jp7Fk-dLhURDYKBaWx_lWv28qyFc";

  // Intentar obtener la API key de diferentes fuentes
  const storedKey = localStorage.getItem("GOOGLE_MAPS_API_KEY");
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Usar la primera disponible o la hardcodeada en último caso
  const apiKey = envKey || storedKey || HARDCODED_API_KEY;

  // Guardar en localStorage para uso futuro
  if (apiKey && !storedKey) {
    localStorage.setItem("GOOGLE_MAPS_API_KEY", apiKey);
    console.log("API Key de Google Maps almacenada en localStorage");
  }

  return apiKey;
};

// Componente de mapa simplificado que usa la API key inicializada
const GoogleRouteMap = ({
  origin,
  destination,
}: {
  origin: {
    name: string;
    location: { type: string; coordinates: [number, number] };
  };
  destination: {
    name: string;
    location: { type: string; coordinates: [number, number] };
  };
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Inicializar la API key al montar el componente
  useEffect(() => {
    initGoogleMapsKey();
  }, []);

  // Validar datos de entrada
  if (!origin?.location?.coordinates || !destination?.location?.coordinates) {
    return (
      <div
        className="h-64 w-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
        data-oid="-vqs7yw"
      >
        Faltan coordenadas para mostrar el mapa
      </div>
    );
  }

  // Extraer coordenadas de manera segura
  const originCoords = {
    lat: origin.location.coordinates[1],
    lng: origin.location.coordinates[0],
  };

  const destCoords = {
    lat: destination.location.coordinates[1],
    lng: destination.location.coordinates[0],
  };

  // Obtener la API key del localStorage
  const googleApiKey =
    localStorage.getItem("GOOGLE_MAPS_API_KEY") || initGoogleMapsKey();

  // URL para el iframe de Google Maps
  const googleUrl = `https://www.google.com/maps/embed/v1/directions?key=${googleApiKey}&origin=${originCoords.lat},${originCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&mode=driving`;

  return (
    <>
      <div
        className="w-full h-64 rounded-lg overflow-hidden shadow-sm border relative bg-gray-50"
        data-oid="stq.3b6"
      >
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10"
            data-oid="-c51fft"
          >
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"
              data-oid="bcq1eir"
            ></div>
          </div>
        )}

        <iframe
          src={googleUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoading(false)}
          onError={(e) => {
            console.error("Error al cargar el mapa:", e);
            setError("Error al cargar el mapa");
            setLoading(false);
          }}
          data-oid="bpo-n3r"
        ></iframe>

        <div
          className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 p-2 rounded-md text-xs flex justify-between items-center"
          data-oid="y-gl-tc"
        >
          <span data-oid="ddowks3">
            <span className="font-bold" data-oid="-8mn8_-">
              Ruta:
            </span>{" "}
            {origin.name} → {destination.name}
          </span>
          <div className="flex items-center" data-oid="sqbf8m9">
            {error && (
              <span
                className="text-xs bg-gray-200 text-gray-600 p-1 rounded mr-2"
                data-oid="jf.m8i4"
              >
                {error}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-gray-900"
              onClick={() => setShowFullscreen(true)}
              data-oid="yicw829"
            >
              <Maximize2 className="h-4 w-4" data-oid="vhavdgt" />
              <span className="sr-only" data-oid="xaqxm.0">
                Ampliar
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal para mostrar el mapa a pantalla completa */}
      {showFullscreen && (
        <Dialog
          open={showFullscreen}
          onOpenChange={setShowFullscreen}
          data-oid="0sb4-ya"
        >
          <DialogContent
            className="max-w-6xl max-h-[90vh] p-0 overflow-hidden"
            data-oid="o5rpic."
          >
            <div className="relative h-[80vh] w-full" data-oid="ptwujkd">
              <iframe
                src={googleUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                data-oid="b13hzzg"
              ></iframe>

              <div
                className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 p-3 rounded-md shadow-md"
                data-oid="a826don"
              >
                <div
                  className="flex justify-between items-center"
                  data-oid="48zjbou"
                >
                  <div data-oid=":53xen:">
                    <div className="font-bold text-lg mb-1" data-oid="8_lnfqw">
                      Ruta
                    </div>
                    <div className="flex items-start" data-oid="6yletci">
                      <MapPin
                        className="h-4 w-4 text-black mt-0.5 mr-1 flex-shrink-0"
                        data-oid="07ca2tg"
                      />

                      <span className="font-medium" data-oid="gs:9q1o">
                        Origen:
                      </span>
                      <span className="ml-1" data-oid="sa4tc.-">
                        {origin.name}
                      </span>
                    </div>
                    <div className="flex items-start mt-1" data-oid=".9g_g8.">
                      <MapPin
                        className="h-4 w-4 text-black mt-0.5 mr-1 flex-shrink-0"
                        data-oid="u8qvtoo"
                      />

                      <span className="font-medium" data-oid="-c7b23v">
                        Destino:
                      </span>
                      <span className="ml-1" data-oid="8uhsljs">
                        {destination.name}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    className="bg-black hover:bg-gray-800 text-white"
                    onClick={() => setShowFullscreen(false)}
                    data-oid="d._87:s"
                  >
                    <X className="h-4 w-4 mr-2" data-oid="ujqsb4q" />
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const FixedRoutesTab = ({
  routes,
  searchQuery,
  setSearchQuery,
  onCreateRoute,
  onUpdateRoute,
  onDeleteRoute,
  onToggleStatus,
}: FixedRoutesTabProps) => {
  // Estados locales
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<FixedRoute | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Estado para el diálogo de detalles
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<FixedRoute | null>(null);

  // Estado para la lista de colaboradores
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };


  // Cargar la lista de colaboradores al iniciar
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const token = getAuthToken();
        const response = await fetch(`${apiUrl}/api/admin/collaborators/list`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar los colaboradores");
        }

        const data = await response.json();
        if (data.status === "success") {
          setCollaborators(data.collaborators);
        }
      } catch (error) {
        console.error("Error al cargar los colaboradores:", error);
      }
    };

    fetchCollaborators();
  }, []);

  // Filtrar rutas
  const filteredRoutes = routes.filter((route) => {
    // Filtrar por búsqueda
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      route.name.toLowerCase().includes(searchLower) ||
      route.origin.name.toLowerCase().includes(searchLower) ||
      route.destination.name.toLowerCase().includes(searchLower) ||
      (route.vehicle?.licensePlate &&
        route.vehicle.licensePlate.toLowerCase().includes(searchLower));

    // Filtrar por estado
    const matchesStatus =
      statusFilter === "all" || route.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Funciones de gestión de rutas
  const handleAddRoute = () => {
    setEditingRoute(null);
    setShowRouteForm(true);
  };

  const handleEditRoute = (route: FixedRoute) => {
    console.log("handleEditRoute - Ruta recibida:", route);
    console.log("¿La ruta tiene ID?", !!route.id);
    console.log("Tipo de ID:", typeof route.id);

    // Si no tiene ID pero tiene _id (como viene de MongoDB), usarlo como id
    if (!route.id && (route as any)._id) {
      console.log("La ruta no tiene id pero tiene _id:", (route as any)._id);
      route = {
        ...route,
        id: (route as any)._id,
      };
      console.log("Ruta con ID asignado:", route);
    }

    setEditingRoute(route);
    setShowRouteForm(true);
  };

  const handleViewRouteDetails = (route: FixedRoute, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Si no tiene ID pero tiene _id (como viene de MongoDB), usarlo como id
    if (!route.id && (route as any)._id) {
      route = {
        ...route,
        id: (route as any)._id,
      };
    }

    setSelectedRoute(route);
    setShowDetailsDialog(true);
  };

  const handleDeleteRoute = (routeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedRouteId(routeId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRouteId) {
      await onDeleteRoute(selectedRouteId);
      setDeleteDialogOpen(false);
      setSelectedRouteId(null);
    }
  };

  const handleRouteSubmit = async (
    routeData: Partial<FixedRoute>,
  ): Promise<boolean> => {
    let success = false;

    if (editingRoute) {
      // Actualizar una ruta existente
      console.log(
        "====================================================================================",
      );
      console.log("Intentando actualizar ruta existente");
      console.log("ID de la ruta a actualizar:", editingRoute.id);
      console.log("¿Es válido el ID?:", !!editingRoute.id);
      console.log("Tipo de ID:", typeof editingRoute.id);
      console.log(
        "Datos a enviar para actualización:",
        JSON.stringify(routeData, null, 2),
      );

      if (!editingRoute.id) {
        console.error("Error: falta ID de ruta para actualizar");
        toast({
          title: "Error",
          description: "No se puede actualizar la ruta: falta ID",
          variant: "destructive",
        });
        return false;
      }

      try {
        success = await onUpdateRoute(editingRoute.id, routeData);
        console.log("Resultado de la actualización:", success);
      } catch (error) {
        console.error("Error capturado durante la actualización:", error);
        success = false;
      }
      console.log(
        "====================================================================================",
      );
    } else {
      // Crear una nueva ruta
      console.log("Intentando crear nueva ruta");
      console.log("Datos a enviar para creación:", routeData);

      try {
        success = await onCreateRoute(routeData);
        console.log("Resultado de la creación:", success);
      } catch (error) {
        console.error("Error capturado durante la creación:", error);
        success = false;
      }
    }

    if (success) {
      setShowRouteForm(false);
      setEditingRoute(null);
    } else {
      toast({
        title: "Error",
        description:
          "No se pudo completar la operación. Verifica los datos e inténtalo de nuevo.",
        variant: "destructive",
      });
    }

    return success;
  };

  const handleToggleStatus = async (routeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    await onToggleStatus(routeId);
  };

  // Función para obtener el nombre del colaborador
  const getCollaboratorName = (collaboratorId: string | undefined) => {
    if (!collaboratorId) return "Colaborador no asignado";

    const collaborator = collaborators.find((c) => c.id === collaboratorId);
    return collaborator ? collaborator.name : "Colaborador no encontrado";
  };

  // Nueva función para truncar direcciones SOLO PARA LA TABLA
  const truncateAddressForTable = (address: string) => {
    const commaIndex = address.indexOf(",");
    if (commaIndex !== -1) {
      return address.substring(0, commaIndex);
    }
    return address;
  };

  return (
    <div className="space-y-6" data-oid="6yeife-">
      {showRouteForm ? (
        <FixedRouteForm
          editMode={!!editingRoute}
          routeData={editingRoute}
          onSubmit={handleRouteSubmit}
          onCancel={() => {
            setShowRouteForm(false);
            setEditingRoute(null);
          }}
          data-oid="0i7ewm8"
        />
      ) : (
        <>
          <div
            className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4"
            data-oid="hdd6q-:"
          >
            <div className="relative w-64" data-oid="f2ufe9.">
              <input
                type="text"
                placeholder="Buscar rutas..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-oid="kbr1hj3"
              />

              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
                data-oid="t-r.o7o"
              />
            </div>
            <div className="flex space-x-3" data-oid="qofy749">
              <select
                className="px-3 py-2 border rounded-lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                data-oid="5qo.:uv"
              >
                <option value="all" data-oid="xks5vzq">
                  Todos los estados
                </option>
                <option value="active" data-oid="576_r6i">
                  Activas
                </option>
                <option value="inactive" data-oid="0s.21_z">
                  Inactivas
                </option>
                <option value="draft" data-oid="l28tzee">
                  Borrador
                </option>
              </select>
              <Button
                onClick={handleAddRoute}
                className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                data-oid="0o:hoj:"
              >
                <PlusCircle size={18} className="mr-2" data-oid="myaem1_" />
                Nueva Ruta Fija
              </Button>
            </div>
          </div>

          <div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            data-oid="8u-ok._"
          >
            <div className="overflow-x-auto" data-oid="5t1on85">
              <table
                className="min-w-full divide-y divide-gray-200"
                data-oid="11y_eo4"
              >
                <thead className="bg-gray-50" data-oid="jqolm06">
                  <tr data-oid="bmgk4r1">
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      data-oid="8t.g.f1"
                    >
                      Nombre
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      data-oid="7r710ib"
                    >
                      Origen → Destino
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      data-oid="k6p_.to"
                    >
                      Colaborador
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      data-oid="hbw6e77"
                    >
                      Vehículo / Chófer
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      data-oid="g:.94rq"
                    >
                      Estado
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      data-oid="de-.t-m"
                    >
                      Tarifas
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      data-oid="w24t4a7"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="bg-white divide-y divide-gray-200"
                  data-oid="hymzuyq"
                >
                  {filteredRoutes.map((route, index) => (
                    <tr
                      key={`route-${route.id || index}`}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => handleViewRouteDetails(route, e)}
                      data-oid="jluqw:p"
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        data-oid=".k18po7"
                      >
                        <div
                          className="text-sm font-medium text-gray-900"
                          data-oid="5k1.zi2"
                        >
                          {route.name}
                        </div>
                        {route.distance && route.estimatedTime && (
                          <div
                            className="text-xs text-gray-500 flex items-center mt-1"
                            data-oid="3gm9114"
                          >
                            <Clock
                              className="h-3 w-3 mr-1"
                              data-oid="szr0oau"
                            />
                            {route.estimatedTime} min
                            <span className="mx-1" data-oid="b:z93i_">
                              •
                            </span>
                            <MapPin
                              className="h-3 w-3 mr-1"
                              data-oid="388c0is"
                            />
                            {route.distance} km
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4" data-oid="yq8ui94">
                        <div
                          className="text-sm text-gray-900 flex flex-col"
                          data-oid="oct573q"
                        >
                          <div className="flex items-start" data-oid="45luro_">
                            <MapPin
                              className="h-4 w-4 text-black mt-0.5 mr-1 flex-shrink-0"
                              data-oid="j9dw1xf"
                            />

                            <span data-oid=":hdut:h">
                              {truncateAddressForTable(route.origin.name)}
                            </span>
                          </div>
                          <div
                            className="flex items-start mt-2"
                            data-oid="u88esvd"
                          >
                            <MapPin
                              className="h-4 w-4 text-black mt-0.5 mr-1 flex-shrink-0"
                              data-oid="335k3kq"
                            />

                            <span data-oid="aafqmb-">
                              {truncateAddressForTable(route.destination.name)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        data-oid="wcvg3mh"
                      >
                        <div className="flex items-center" data-oid="o9rktcp">
                          <div
                            className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3"
                            data-oid="fsuesfe"
                          >
                            <Building
                              className="h-4 w-4 text-gray-600"
                              data-oid="q728b7f"
                            />
                          </div>
                          <div
                            className="text-sm text-gray-900"
                            data-oid=":w982l8"
                          >
                            {getCollaboratorName(route.collaboratorId)}
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        data-oid="txyaz6-"
                      >
                        {route.vehicles && route.vehicles.length > 0 ? (
                          <div className="space-y-2" data-oid="nc1ik61">
                            {/* Mostrar el primer vehículo */}
                            <div
                              className="flex items-center"
                              data-oid=":x38fen"
                            >
                              {route.vehicles[0].imageUrl ? (
                                <img
                                  src={route.vehicles[0].imageUrl}
                                  alt={route.vehicles[0].model}
                                  className="h-10 w-10 rounded-full object-cover"
                                  data-oid="sgk8x5s"
                                />
                              ) : (
                                <div
                                  className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
                                  data-oid="ol70fdy"
                                >
                                  <Car
                                    className="h-6 w-6 text-gray-500"
                                    data-oid="w_f9kj3"
                                  />
                                </div>
                              )}
                              <div className="ml-4" data-oid="dj:g6ra">
                                <div
                                  className="text-sm font-medium text-gray-900"
                                  data-oid="g-fweit"
                                >
                                  {route.vehicles[0].model}
                                </div>
                                <div
                                  className="text-xs text-gray-500"
                                  data-oid="8j88oe3"
                                >
                                  {route.vehicles[0].licensePlate}
                                </div>
                              </div>
                            </div>

                            {/* Mostrar contador si hay más vehículos */}
                            {route.vehicles.length > 1 && (
                              <div
                                className="ml-2 text-xs text-gray-600"
                                data-oid="5jt7c.x"
                              >
                                +{route.vehicles.length - 1} vehículo
                                {route.vehicles.length - 1 > 1 ? "s" : ""} más
                              </div>
                            )}

                            {/* Mostrar conductor del primer vehículo si existe */}
                            {route.drivers && route.drivers.length > 0 ? (
                              <div
                                className="flex items-center mt-2"
                                data-oid="v_adx3_"
                              >
                                {route.drivers[0].photo ? (
                                  <img
                                    src={route.drivers[0].photo}
                                    alt={route.drivers[0].name}
                                    className="h-6 w-6 rounded-full object-cover"
                                    data-oid="ezlr67d"
                                  />
                                ) : (
                                  <div
                                    className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center"
                                    data-oid="nnnw-b4"
                                  >
                                    <User
                                      className="h-4 w-4 text-gray-500"
                                      data-oid="l26fq7n"
                                    />
                                  </div>
                                )}
                                <span
                                  className="ml-2 text-xs text-gray-500"
                                  data-oid="cjza5-r"
                                >
                                  {route.drivers[0].name}
                                  {route.drivers.length > 1 &&
                                    ` +${route.drivers.length - 1} más`}
                                </span>
                              </div>
                            ) : (
                              route.driver && (
                                <div
                                  className="flex items-center mt-2"
                                  data-oid="h17c8x6"
                                >
                                  {route.driver.photo ? (
                                    <img
                                      src={route.driver.photo}
                                      alt={route.driver.name}
                                      className="h-6 w-6 rounded-full object-cover"
                                      data-oid="vtxwf0s"
                                    />
                                  ) : (
                                    <div
                                      className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center"
                                      data-oid="1d3b46m"
                                    >
                                      <User
                                        className="h-4 w-4 text-gray-500"
                                        data-oid="7gbe391"
                                      />
                                    </div>
                                  )}
                                  <span
                                    className="ml-2 text-xs text-gray-500"
                                    data-oid="ifl-q1s"
                                  >
                                    {route.driver.name}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : route.vehicle ? (
                          // Para compatibilidad con versiones anteriores
                          <div className="flex flex-col" data-oid="styu7.e">
                            <div
                              className="flex items-center"
                              data-oid="i0mcapu"
                            >
                              {route.vehicle.imageUrl ? (
                                <img
                                  src={route.vehicle.imageUrl}
                                  alt={route.vehicle.model}
                                  className="h-10 w-10 rounded-full object-cover"
                                  data-oid="z5m8r_j"
                                />
                              ) : (
                                <div
                                  className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
                                  data-oid="lwonqtc"
                                >
                                  <Car
                                    className="h-6 w-6 text-gray-500"
                                    data-oid="wgcj3.a"
                                  />
                                </div>
                              )}
                              <div className="ml-4" data-oid=".iu-fkk">
                                <div
                                  className="text-sm font-medium text-gray-900"
                                  data-oid="hybpv6t"
                                >
                                  {route.vehicle.model}
                                </div>
                                <div
                                  className="text-xs text-gray-500"
                                  data-oid="37yi048"
                                >
                                  {route.vehicle.licensePlate}
                                </div>
                              </div>
                            </div>
                            {route.driver && (
                              <div
                                className="flex items-center mt-2"
                                data-oid="0luq102"
                              >
                                {route.driver.photo ? (
                                  <img
                                    src={route.driver.photo}
                                    alt={route.driver.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                    data-oid="ylotsoa"
                                  />
                                ) : (
                                  <div
                                    className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center"
                                    data-oid="oyst92r"
                                  >
                                    <User
                                      className="h-4 w-4 text-gray-500"
                                      data-oid="78p88kt"
                                    />
                                  </div>
                                )}
                                <span
                                  className="ml-2 text-xs text-gray-500"
                                  data-oid="a0ykvcc"
                                >
                                  {route.driver.name}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className="text-gray-500 italic"
                            data-oid="7slqi5f"
                          >
                            Sin vehículos asignados
                          </div>
                        )}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        data-oid="aqda5di"
                      >
                        <Badge
                          className={`
                          ${
                            route.status === "active"
                              ? "bg-gray-200 text-green-800 hover:bg-gray-200"
                              : route.status === "inactive"
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          }
                        `}
                          data-oid="57xo_:l"
                        >
                          {route.status === "active"
                            ? "Activa"
                            : route.status === "inactive"
                              ? "Inactiva"
                              : "Borrador"}
                        </Badge>
                        <div
                          className="flex items-center mt-2"
                          data-oid="h.-8t:g"
                        >
                          <span
                            className="text-xs text-gray-500 mr-2"
                            data-oid="ee1b28i"
                          >
                            {route.availability.days.map((day, index) => (
                              <span
                                key={`${route.id}-day-${index}`}
                                data-oid="mgfngve"
                              >
                                {day}
                                {index < route.availability.days.length - 1
                                  ? ", "
                                  : ""}
                              </span>
                            ))}
                          </span>
                        </div>
                        <div
                          className="flex items-center mt-1"
                          data-oid="m3pa9h0"
                        >
                          <Clock
                            className="h-3 w-3 text-gray-400 mr-1"
                            data-oid="h030_x:"
                          />

                          <span
                            className="text-xs text-gray-500"
                            data-oid="-_tyjdj"
                          >
                            {route.availability.timeSlots.map((slot, index) => (
                              <span
                                key={`${route.id}-slot-${index}`}
                                data-oid="e749zhm"
                              >
                                {slot}
                                {index < route.availability.timeSlots.length - 1
                                  ? ", "
                                  : ""}
                              </span>
                            ))}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        data-oid="av::707"
                      >
                        <div className="text-sm" data-oid="kln2q_l">
                          <div
                            className="font-medium text-gray-900"
                            data-oid="kbuq74k"
                          >
                            {route.pricing.standard} {route.pricing.currency}
                          </div>
                          <div
                            className="text-xs text-gray-500 mt-1"
                            data-oid="htrfg2f"
                          >
                            Noche: {route.pricing.night}{" "}
                            {route.pricing.currency}
                          </div>
                          <div
                            className="text-xs text-gray-500"
                            data-oid="kk62wkn"
                          >
                            Festivo: {route.pricing.holiday}{" "}
                            {route.pricing.currency}
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2"
                        data-oid="umhqu08"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewRouteDetails(route, e);
                          }}
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          data-oid="huryphu"
                        >
                          <Eye className="h-4 w-4" data-oid="r3v1m-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(route.id, e);
                          }}
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          data-oid="ng11273"
                        >
                          {route.status === "active" ? (
                            <ToggleRight
                              className="h-5 w-5 text-gray-600"
                              data-oid="lnxo881"
                            />
                          ) : (
                            <ToggleLeft
                              className="h-5 w-5 text-gray-400"
                              data-oid="r78x2lk"
                            />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditRoute(route);
                          }}
                          className="text-gray-600 hover:text-blue-800 hover:bg-gray-100"
                          data-oid="h17fokk"
                        >
                          <Edit className="h-4 w-4" data-oid="zj1y66s" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoute(route.id, e);
                          }}
                          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                          data-oid="sioje2t"
                        >
                          <Trash2 className="h-4 w-4" data-oid="gryo-06" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRoutes.length === 0 && (
                <div className="py-10 text-center" data-oid="8:lnpm3">
                  <div
                    className="h-20 w-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100"
                    data-oid="mne.wqp"
                  >
                    <MapPin
                      className="h-10 w-10 text-gray-400"
                      data-oid="3a9vuam"
                    />
                  </div>
                  <p className="text-gray-500" data-oid="zsytq62">
                    No se encontraron rutas fijas que coincidan con los
                    criterios de búsqueda
                  </p>
                  <Button
                    onClick={handleAddRoute}
                    className="mt-4 flex items-center mx-auto px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    data-oid="zwihrch"
                  >
                    <PlusCircle size={18} className="mr-2" data-oid="gmy004w" />
                    Crear Nueva Ruta
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Diálogo de detalles de ruta */}
      <Dialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        data-oid="1qx08zo"
      >
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          data-oid="jie:_t0"
        >
          <DialogHeader data-oid="29.7q5p">
            <DialogTitle
              className="text-xl flex items-center gap-2"
              data-oid="f-jmaz7"
            >
              {selectedRoute?.name}
              <Badge
                className={`ml-2 ${
                  selectedRoute?.status === "active"
                    ? "bg-gray-200 text-green-800"
                    : selectedRoute?.status === "inactive"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-amber-100 text-amber-800"
                }`}
                data-oid="w-r2di7"
              >
                {selectedRoute?.status === "active"
                  ? "Activa"
                  : selectedRoute?.status === "inactive"
                    ? "Inactiva"
                    : "Borrador"}
              </Badge>
            </DialogTitle>
            <DialogDescription data-oid="c48wmld">
              Detalles de la ruta fija
            </DialogDescription>
          </DialogHeader>

          {selectedRoute && (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
              data-oid="z0.6:uq"
            >
              {/* Origen y Destino */}
              <div className="space-y-4" data-oid="wcuvq.n">
                <h3
                  className="font-medium text-gray-900 text-base mb-2"
                  data-oid="nxpmget"
                >
                  Información General
                </h3>

                <div
                  className="bg-gray-50 p-4 rounded-lg space-y-4"
                  data-oid="hqofyz0"
                >
                  <div data-oid="na-j03:">
                    <div
                      className="text-sm font-medium text-gray-500"
                      data-oid="ks.p.xn"
                    >
                      Origen
                    </div>
                    <div className="flex items-start mt-1" data-oid=":933sd3">
                      <MapPin
                        className="h-4 w-4 text-black mt-0.5 mr-1 flex-shrink-0"
                        data-oid="4_91hf:"
                      />

                      <span className="text-base" data-oid="ilg8t7m">
                        {selectedRoute.origin.name}
                      </span>
                    </div>
                  </div>

                  <div data-oid="z.9.q45">
                    <div
                      className="text-sm font-medium text-gray-500"
                      data-oid="54979el"
                    >
                      Destino
                    </div>
                    <div className="flex items-start mt-1" data-oid="m_x7fc1">
                      <MapPin
                        className="h-4 w-4 text-black mt-0.5 mr-1 flex-shrink-0"
                        data-oid="u907y5n"
                      />

                      <span className="text-base" data-oid="dfgl0k9">
                        {selectedRoute.destination.name}
                      </span>
                    </div>
                  </div>

                  {selectedRoute.distance && selectedRoute.estimatedTime && (
                    <div
                      className="flex items-center gap-3 text-sm text-gray-600 border-t pt-2"
                      data-oid="ejqeyqt"
                    >
                      <div className="flex items-center" data-oid="1d0a_we">
                        <MapPin className="h-3 w-3 mr-1" data-oid="mn60.c3" />
                        <span data-oid="8:xyqy_">
                          {selectedRoute.distance} km
                        </span>
                      </div>
                      <div className="flex items-center" data-oid="3blccu:">
                        <Clock className="h-3 w-3 mr-1" data-oid="aak3ybm" />
                        <span data-oid="zygkv87">
                          {selectedRoute.estimatedTime} min
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colaborador */}
                <div data-oid="ddzb25b">
                  <h3
                    className="font-medium text-gray-900 text-base mb-2"
                    data-oid="5lol88b"
                  >
                    Colaborador
                  </h3>
                  <div
                    className="flex items-center bg-gray-50 p-4 rounded-lg"
                    data-oid="t6:c1tv"
                  >
                    <div
                      className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3"
                      data-oid="vuv38:1"
                    >
                      <Building
                        className="h-5 w-5 text-gray-600"
                        data-oid="q2jbcqz"
                      />
                    </div>
                    <div data-oid="-nc2org">
                      <div className="font-medium" data-oid="h1xd7s9">
                        {getCollaboratorName(selectedRoute.collaboratorId)}
                      </div>
                      <div className="text-xs text-gray-500" data-oid="zg_c:r7">
                        ID: {selectedRoute.collaboratorId || "No asignado"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disponibilidad */}
                <div data-oid="8:zw4xg">
                  <h3
                    className="font-medium text-gray-900 text-base mb-2"
                    data-oid="8xqx4la"
                  >
                    Disponibilidad
                  </h3>
                  <div
                    className="bg-gray-50 p-4 rounded-lg space-y-3"
                    data-oid="f0exx-y"
                  >
                    <div data-oid="xbtue.8">
                      <div
                        className="text-sm font-medium text-gray-500"
                        data-oid="m9k07dl"
                      >
                        Días
                      </div>
                      <div className="mt-1 text-base" data-oid="204f7jw">
                        {selectedRoute.availability.days.join(", ")}
                      </div>
                    </div>
                    <div data-oid="85v0m1n">
                      <div
                        className="text-sm font-medium text-gray-500"
                        data-oid="g5bq19c"
                      >
                        Horarios
                      </div>
                      <div className="mt-1 text-base" data-oid="w.ah2ew">
                        {selectedRoute.availability.timeSlots.join(", ")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehículo, Tarifas y Acciones */}
              <div className="space-y-4" data-oid="1kik4kq">
                {/* Vehículo */}
                <div data-oid="8f_4n_y">
                  <h3
                    className="font-medium text-gray-900 text-base mb-2"
                    data-oid="8wyj.fb"
                  >
                    Vehículos (
                    {selectedRoute.vehicles ? selectedRoute.vehicles.length : 1}
                    )
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg" data-oid="tkhj:km">
                    {selectedRoute.vehicles &&
                    selectedRoute.vehicles.length > 0 ? (
                      // Mostrar todos los vehículos disponibles
                      <div className="space-y-4" data-oid="7ebmv7e">
                        {selectedRoute.vehicles.map((vehicle, idx) => (
                          <div
                            key={idx}
                            className={
                              idx > 0 ? "pt-4 border-t border-gray-200" : ""
                            }
                            data-oid="z2-c-43"
                          >
                            <div
                              className="flex items-center"
                              data-oid="b6jdbwz"
                            >
                              {vehicle.imageUrl ? (
                                <img
                                  src={vehicle.imageUrl}
                                  alt={vehicle.model}
                                  className="h-16 w-16 rounded-lg object-cover"
                                  data-oid="hov_c4h"
                                />
                              ) : (
                                <div
                                  className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center"
                                  data-oid="jobjkmu"
                                >
                                  <Car
                                    className="h-8 w-8 text-gray-500"
                                    data-oid="iylu3qr"
                                  />
                                </div>
                              )}
                              <div className="ml-4 flex-1" data-oid="n5j4.30">
                                <div
                                  className="text-lg font-medium"
                                  data-oid="_sxp4h4"
                                >
                                  {vehicle.model}
                                </div>
                                <div
                                  className="text-base text-gray-600"
                                  data-oid="ylmtakz"
                                >
                                  {vehicle.licensePlate}
                                </div>
                              </div>
                            </div>

                            {/* Mostrar conductor asociado a este vehículo si existe */}
                            {selectedRoute.drivers &&
                              selectedRoute.drivers[idx] && (
                                <div
                                  className="flex items-center mt-2 ml-4"
                                  data-oid="q7ezdn-"
                                >
                                  {selectedRoute.drivers[idx].photo ? (
                                    <img
                                      src={selectedRoute.drivers[idx].photo}
                                      alt={selectedRoute.drivers[idx].name}
                                      className="h-8 w-8 rounded-full object-cover"
                                      data-oid="hp4-z.h"
                                    />
                                  ) : (
                                    <div
                                      className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"
                                      data-oid="s7g1ux7"
                                    >
                                      <User
                                        className="h-4 w-4 text-gray-500"
                                        data-oid="vprm6qh"
                                      />
                                    </div>
                                  )}
                                  <div className="ml-2" data-oid="a27d89v">
                                    <div
                                      className="text-sm font-medium"
                                      data-oid="9iq1dnj"
                                    >
                                      Conductor
                                    </div>
                                    <div
                                      className="text-sm text-gray-600"
                                      data-oid="-v:0gg-"
                                    >
                                      {selectedRoute.drivers[idx].name}
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    ) : selectedRoute.vehicle ? (
                      // Compatibilidad con versión anterior
                      <div data-oid="suk98fx">
                        <div className="flex items-center" data-oid="tir3:ni">
                          {selectedRoute.vehicle.imageUrl ? (
                            <img
                              src={selectedRoute.vehicle.imageUrl}
                              alt={selectedRoute.vehicle.model}
                              className="h-16 w-16 rounded-lg object-cover"
                              data-oid=".2.hxnh"
                            />
                          ) : (
                            <div
                              className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center"
                              data-oid="ww_34a1"
                            >
                              <Car
                                className="h-8 w-8 text-gray-500"
                                data-oid="jidavqt"
                              />
                            </div>
                          )}
                          <div className="ml-4 flex-1" data-oid="m5ihkan">
                            <div
                              className="text-lg font-medium"
                              data-oid="tmkf_rp"
                            >
                              {selectedRoute.vehicle.model}
                            </div>
                            <div
                              className="text-base text-gray-600"
                              data-oid="likagwj"
                            >
                              {selectedRoute.vehicle.licensePlate}
                            </div>
                          </div>
                        </div>

                        {selectedRoute.driver && (
                          <div
                            className="flex items-center mt-4 border-t pt-3"
                            data-oid="6bkc2sd"
                          >
                            {selectedRoute.driver.photo ? (
                              <img
                                src={selectedRoute.driver.photo}
                                alt={selectedRoute.driver.name}
                                className="h-10 w-10 rounded-full object-cover"
                                data-oid="_qn:epa"
                              />
                            ) : (
                              <div
                                className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
                                data-oid="9e4-74:"
                              >
                                <User
                                  className="h-5 w-5 text-gray-500"
                                  data-oid="jvq-x87"
                                />
                              </div>
                            )}
                            <div className="ml-3" data-oid="7f9q1ix">
                              <div className="font-medium" data-oid="xt1zgi3">
                                Conductor
                              </div>
                              <div className="text-gray-600" data-oid="e7zb5cx">
                                {selectedRoute.driver.name}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center p-4 text-gray-500"
                        data-oid="n7rrnet"
                      >
                        <Info className="h-5 w-5 mr-2" data-oid="dwkuzcv" />
                        <span data-oid="l-j1v1e">
                          No hay vehículos asignados
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tarifas */}
                <div data-oid="wdg4so9">
                  <h3
                    className="font-medium text-gray-900 text-base mb-2"
                    data-oid=":h6p4g3"
                  >
                    Tarifas
                  </h3>
                  <div
                    className="bg-gray-50 p-4 rounded-lg space-y-2"
                    data-oid=":shkgic"
                  >
                    <div
                      className="flex justify-between items-center"
                      data-oid="0giu774"
                    >
                      <div
                        className="text-sm font-medium text-gray-500"
                        data-oid="kqbnatp"
                      >
                        Estándar:
                      </div>
                      <div className="text-lg font-medium" data-oid="g5t13jn">
                        {selectedRoute.pricing.standard}{" "}
                        {selectedRoute.pricing.currency}
                      </div>
                    </div>
                    <div
                      className="flex justify-between items-center"
                      data-oid="0ke5.1z"
                    >
                      <div
                        className="text-sm font-medium text-gray-500"
                        data-oid="k2kf.a:"
                      >
                        Tarifa nocturna:
                      </div>
                      <div data-oid="b8jon:l">
                        {selectedRoute.pricing.night}{" "}
                        {selectedRoute.pricing.currency}
                      </div>
                    </div>
                    <div
                      className="flex justify-between items-center"
                      data-oid="j7wr3h8"
                    >
                      <div
                        className="text-sm font-medium text-gray-500"
                        data-oid="uuehg0:"
                      >
                        Tarifa en festivos:
                      </div>
                      <div data-oid="7.1r4uo">
                        {selectedRoute.pricing.holiday}{" "}
                        {selectedRoute.pricing.currency}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mapa */}
                <div data-oid="930j8yy">
                  <h3
                    className="font-medium text-gray-900 text-base mb-2"
                    data-oid="spvo9kc"
                  >
                    Mapa de la Ruta
                  </h3>
                  <GoogleRouteMap
                    origin={selectedRoute.origin}
                    destination={selectedRoute.destination}
                    data-oid="5g9txgj"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter
            className="flex justify-end gap-2 mt-6"
            data-oid="2bulwo_"
          >
            <Button
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
              onClick={() => setShowDetailsDialog(false)}
              data-oid="nph3bx_"
            >
              <X className="h-4 w-4 mr-2" data-oid="9rk3pfx" />
              Cerrar
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => {
                if (selectedRoute) {
                  setShowDetailsDialog(false);
                  handleEditRoute(selectedRoute);
                }
              }}
              data-oid=":eop542"
            >
              <Edit className="h-4 w-4 mr-2" data-oid="d0kx65w" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        data-oid=":93k7au"
      >
        <AlertDialogContent data-oid="_l3gdbo">
          <AlertDialogHeader data-oid="x6flu:r">
            <AlertDialogTitle data-oid="y1ocnvd">
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription data-oid="idrhyc3">
              Esta acción eliminará permanentemente la ruta fija. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter data-oid="bhun_9o">
            <AlertDialogCancel data-oid="uch3dw2">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-black hover:bg-gray-800"
              data-oid="vldy8rf"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FixedRoutesTab;
