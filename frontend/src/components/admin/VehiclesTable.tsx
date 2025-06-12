import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, Edit, Trash2, Eye, MapPin, 
  Check, X, Briefcase, UserCircle, Globe, Route,
  User 
} from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

// Tipo Vehicle unificado (basado en VehicleDetailsView.tsx)
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  seats: number; 
  luggageCapacity: number; 
  type: string;
  category: string;
  licensePlate: string;
  image?: string;
  available: boolean;
  ownerType: 'company' | 'private_driver';
  ownerName: string;
  ownerCountry: string; 
  associatedDrivers: string[];
  availabilityType: string[];
  availabilityDetails: string; 
  insurancePolicyNumber: string;
  lastMaintenanceDate: string; 
  contractEndDate?: string; 
  notes?: string;
  pricing?: {
    base_fare: number;
    currency: string;
    per_km?: number;
    per_hour?: number;
  };
  details?: {
    features?: string[];
    armored?: boolean;
    armor_level?: string;
  };
  location?: {
    type: string;
    coordinates: number[];
  };
  availability_radius?: number;
  description?: string;
}

// Interfaz para un chofer (Driver)
interface Driver {
  id: string;
  name: string;
  email?: string;
  status?: string;
}

// Componente de menú desplegable personalizado
const CustomDropdownMenu = ({ 
  children, 
  trigger 
}: { 
  children: React.ReactNode, 
  trigger: React.ReactNode 
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        {trigger}
      </div>
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                  const originalOnClick = (child.props as { onClick?: React.MouseEventHandler<HTMLButtonElement> }).onClick;
                  return React.cloneElement(child as React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLButtonElement> }>, { 
                    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      if (originalOnClick) {
                        originalOnClick(e);
                      }
                      setOpen(false);
                    }
                  });
                }
                return child;
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Componente de elemento de menú personalizado
const CustomDropdownMenuItem = ({ 
  onClick, 
  children,
  className = ""
}: { 
  onClick?: React.MouseEventHandler<HTMLButtonElement>,
  children: React.ReactNode,
  className?: string 
}) => (
  <button
    className={`w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
    role="menuitem"
    onClick={onClick}
  >
    {children}
  </button>
);

// Componente de diálogo de alerta personalizado
const CustomAlertDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmAction,
  confirmText = "Eliminar",
  cancelText = "Cancelar"
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  title: string,
  description: string,
  confirmAction: () => void,
  confirmText?: string,
  cancelText?: string
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-[101]">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            className="bg-black hover:bg-gray-800 text-white"
            onClick={() => {
              confirmAction();
              onOpenChange(false);
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

type VehiclesTableProps = {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
  onToggleAvailability: (vehicleId: string, available: boolean) => void;
  onViewDetails: (vehicle: Vehicle) => void;
  onAssignDriver: (vehicleId: string) => void;
};

const VehiclesTable = ({
  vehicles,
  onEdit,
  onDelete,
  onToggleAvailability,
  onViewDetails,
  onAssignDriver
}: VehiclesTableProps) => {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, vehicleId: string | null }>({
    open: false,
    vehicleId: null
  });
  const [driversMap, setDriversMap] = useState<Record<string, Driver>>({});
  const [loadingDrivers, setLoadingDrivers] = useState<boolean>(false);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  };

  useEffect(() => {
    const fetchDriversData = async () => {
      const driverIds = [...new Set(vehicles.flatMap(vehicle => vehicle.associatedDrivers))];
      if (driverIds.length === 0) return;
      
      setLoadingDrivers(true);
      try {
        const driversData: Record<string, Driver> = {};
        await Promise.all(driverIds.map(async (driverId) => {
          try {
            const response = await axios.get(`/api/admin/drivers/${driverId}`, getAuthHeaders());
            if (response.data && response.data.driver) {
              driversData[driverId] = {
                id: driverId,
                name: response.data.driver.name,
                email: response.data.driver.email,
                status: response.data.driver.status
              };
            }
          } catch (error) {
            console.error(`Error fetching driver ${driverId}:`, error);
            driversData[driverId] = {
              id: driverId,
              name: `Chofer #${driverId.substring(0, 6)}`};
          }
        }));
        
        setDriversMap(driversData);
      } catch (error) {
        console.error('Error fetching drivers data:', error);
      } finally {
        setLoadingDrivers(false);
      }
    };
    
    fetchDriversData();
  }, [vehicles]);

  const typeLabels: Record<string, { label: string, color: string, icon?: React.ReactNode }> = {
    sedan: { label: "Sedán", color: "bg-gray-200 text-blue-800" },
    suv: { label: "SUV", color: "bg-gray-200 text-green-800" },
    van: { label: "Van/Minivan", color: "bg-amber-100 text-amber-800" },
    luxury: { label: "Lujo", color: "bg-gray-200 text-yellow-800" },
    electric: { label: "Eléctrico", color: "bg-gray-200 text-teal-800" },
    classic: { label: "Clásico", color: "bg-pink-100 text-pink-800" },
    limousine: { label: "Limusina", color: "bg-gray-200 text-purple-800" },
    bus: { label: "Bus", color: "bg-gray-200 text-indigo-800" },
    helicopter: { label: "Helicóptero", color: "bg-gray-200 text-gray-800" },
    jet: { label: "Jet Privado", color: "bg-pink-100 text-pink-800" }
  };

  const categoryLabels: Record<string, { label: string, color: string }> = {
    standard: { label: "Estándar", color: "bg-gray-100 text-gray-800" },
    premium: { label: "Premium", color: "bg-gray-200 text-blue-800" },
    vip: { label: "VIP", color: "bg-gray-200 text-purple-800" },
    luxury: { label: "Lujo", color: "bg-amber-100 text-amber-800" },
    business: { label: "Business", color: "bg-gray-200 text-blue-800" },
    executive: { label: "Ejecutivo", color: "bg-gray-200 text-purple-800" }
  };

  const ownerTypeIcons = {
    company: <Briefcase className="mr-1.5 h-4 w-4 text-gray-600" />,
    private_driver: <UserCircle className="mr-1.5 h-4 w-4 text-gray-600" />
  };

  const handleDelete = (vehicleId: string) => {
    setDeleteDialog({ open: true, vehicleId });
  };

  const confirmDelete = () => {
    if (deleteDialog.vehicleId) {
      onDelete(deleteDialog.vehicleId);
      setDeleteDialog({ open: false, vehicleId: null });
    }
  };

  const getCountryFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehículo
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propietario
              </th>
               <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matrícula
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disponibilidad
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chóferes Asignados
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => onViewDetails(vehicle)}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 mr-3">
                      {vehicle.image ? (
                        <img className="h-10 w-10 rounded-md object-cover" src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} />
                      ) : (
                        <div className={`h-10 w-10 rounded-md ${typeLabels[vehicle.type]?.color || 'bg-gray-200'} flex items-center justify-center text-white font-semibold`}>
                          {vehicle.brand.charAt(0)}{vehicle.model.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vehicle.brand} {vehicle.model}</div>
                      <div className="text-xs text-gray-500">
                        {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.color}
                      </div>
                      <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeLabels[vehicle.type]?.color || "bg-gray-100 text-gray-800"}`}>
                        {typeLabels[vehicle.type]?.label || vehicle.type}
                      </span>
                      <span className={`mt-1 ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryLabels[vehicle.category]?.color || "bg-gray-100 text-gray-800"}`}>
                        {categoryLabels[vehicle.category]?.label || vehicle.category}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-700">
                    {ownerTypeIcons[vehicle.ownerType]}
                    <div>
                      {vehicle.ownerName}
                      <div className="text-xs text-gray-500 flex items-center">
                        <Globe className="h-3 w-3 mr-1" /> {getCountryFlagEmoji(vehicle.ownerCountry)} {vehicle.ownerCountry}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {vehicle.licensePlate}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Route className="h-4 w-4 mr-1.5 text-gray-400" />
                    <div>
                      {vehicle.availabilityType && vehicle.availabilityType.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {vehicle.availabilityType.includes('zone') && (
                            <span title={`Zona: ${vehicle.availabilityDetails}`} className="hover:underline cursor-help">
                              Zona: {vehicle.availabilityDetails.substring(0,15)}{vehicle.availabilityDetails.length > 15 ? '...' : ''}
                            </span>
                          )}
                          {vehicle.availabilityType.includes('fixed_route') && (
                            <span title={`Ruta fija: ${vehicle.availabilityDetails}`} className="hover:underline cursor-help">
                              Ruta fija{vehicle.availabilityDetails && !vehicle.availabilityType.includes('zone') ? `: ${vehicle.availabilityDetails.substring(0,15)}${vehicle.availabilityDetails.length > 15 ? '...' : ''}` : ''}
                            </span>
                          )}
                          {vehicle.availabilityType.includes('flexible_route') && (
                            <span title={`Ruta flexible: ${vehicle.availabilityDetails}`} className="hover:underline cursor-help">
                              Ruta flexible{vehicle.availabilityDetails && !vehicle.availabilityType.includes('zone') && !vehicle.availabilityType.includes('fixed_route') ? `: ${vehicle.availabilityDetails.substring(0,15)}${vehicle.availabilityDetails.length > 15 ? '...' : ''}` : ''}
                            </span>
                          )}
                        </div>
                      ) : (
                        'Sin definir'
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {vehicle.associatedDrivers && vehicle.associatedDrivers.length > 0 ? (
                      <>
                        {vehicle.associatedDrivers.slice(0, 3).map((driverId, index) => {
                          const driver = driversMap[driverId];
                          return (
                            <Badge 
                              key={driverId} 
                              className={cn(
                                "py-1 pl-1.5 pr-1.5 flex items-center bg-gray-200 text-gray-700 hover:bg-gray-300",
                                !driver && "bg-gray-100 text-gray-600"
                              )}
                            >
                              <User className="h-3 w-3 mr-1" />
                              {driver ? driver.name : `Chofer ${index + 1}`}
                            </Badge>
                          );
                        })}
                        {vehicle.associatedDrivers.length > 3 && (
                          <Badge className="py-1 px-2 bg-gray-100 text-gray-700">
                            +{vehicle.associatedDrivers.length - 3} más
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">No asignado</span>
                    )}
                    {loadingDrivers && <span className="text-xs text-gray-400 animate-pulse">Cargando...</span>}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={vehicle.available ? "default" : "destructive"} 
                         className={`${vehicle.available ? 'bg-gray-200 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                    {vehicle.available ? "Disponible" : "No disponible"}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <CustomDropdownMenu
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                  >
                    <CustomDropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(vehicle);}}>
                      <div className="flex items-center"><Eye className="mr-2 h-4 w-4" /><span>Ver Detalles</span></div>
                    </CustomDropdownMenuItem>
                    <CustomDropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(vehicle);}}>
                      <div className="flex items-center"><Edit className="mr-2 h-4 w-4" /><span>Editar</span></div>
                    </CustomDropdownMenuItem>
                    <CustomDropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleAvailability(vehicle.id, !vehicle.available); }}>
                      <div className="flex items-center">
                        {vehicle.available ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                        <span>{vehicle.available ? "No Disponible" : "Disponible"}</span>
                      </div>
                    </CustomDropdownMenuItem>
                    <CustomDropdownMenuItem onClick={(e) => { e.stopPropagation(); onAssignDriver(vehicle.id); }}>
                       <div className="flex items-center"><MapPin className="mr-2 h-4 w-4" /><span>Asignar Chóferes</span></div>
                    </CustomDropdownMenuItem>
                     <div className="border-t my-1"></div>
                    <CustomDropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); handleDelete(vehicle.id);}}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <div className="flex items-center"><Trash2 className="mr-2 h-4 w-4" /><span>Eliminar Vehículo</span></div>
                    </CustomDropdownMenuItem>
                  </CustomDropdownMenu>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-gray-500">No hay vehículos para mostrar.</p>
                  <p className="text-sm text-gray-400 mt-1">Agrega vehículos usando el botón "Añadir Vehículo".</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CustomAlertDialog
        open={deleteDialog.open}
        onOpenChange={(isOpen: boolean) => setDeleteDialog({ ...deleteDialog, open: isOpen })}
        title="¿Estás seguro?"
        description="Esta acción no se puede deshacer. El vehículo se eliminará permanentemente del sistema."
        confirmAction={confirmDelete}
      />
    </div>
  );
};

export default VehiclesTable; 