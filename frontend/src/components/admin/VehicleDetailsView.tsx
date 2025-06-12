import React, { useState } from 'react';
import { X, Briefcase, Users, Globe, Car, Edit3, Tag, MapPin, FileText, Calendar, Shield, Info, Building, UserCircle, Layers, Compass, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

// Interfaz actualizada para incluir todos los campos disponibles
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
  availabilityType: string[]; // Cambiado a array de strings
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
  // Campos adicionales
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
  collaboratorId?: string;
}

interface VehicleDetailsViewProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onEdit: (vehicle: Vehicle) => void; // Función para iniciar la edición
}

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; className?: string }> = ({ icon, label, value, className }) => (
  <div className={cn("flex items-start py-2.5", className)}>
    <span className="text-gray-600 mr-2 mt-0.5 flex-shrink-0">{icon}</span>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500 text-left">{label}</p>
      <div className="text-md text-gray-800 mt-0.5 text-left">{value || '-'}</div>
    </div>
  </div>
);

const DetailSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className }) => (
  <div className={cn("border rounded-lg p-5 bg-white shadow-sm", className)}>
    <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center border-b pb-2">
      {icon}
      <span className="ml-2">{title}</span>
    </h4>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const getCountryFlagEmoji = (countryCode: string) => {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const VehicleDetailsView: React.FC<VehicleDetailsViewProps> = ({ vehicle, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState("general");
  
  if (!vehicle) return null;

  const renderAssociatedDrivers = () => {
    if (!vehicle.associatedDrivers || vehicle.associatedDrivers.length === 0) {
      return '-';
    }
    return (
      <div className="flex flex-wrap gap-2">
        {vehicle.associatedDrivers.map((driver, index) => (
          <Badge key={index} variant="secondary" className="bg-gray-200 text-gray-700">
            {driver} {/* Asumimos que son nombres o IDs legibles */}
          </Badge>
        ))}
      </div>
    );
  };

  // Nueva función para renderizar los tipos de disponibilidad
  const renderAvailabilityTypes = () => {
    if (!vehicle.availabilityType || vehicle.availabilityType.length === 0) {
      return '-';
    }
    
    // Mapeo de los tipos de disponibilidad a etiquetas en español
    const availabilityLabels: Record<string, string> = {
      'fixed_route': 'Ruta fija',
      'flexible_route': 'Ruta flexible',
      'zone': 'Zona'
    };
    
    return (
      <div className="flex flex-wrap gap-2">
        {vehicle.availabilityType.map((type, index) => (
          <Badge key={index} variant="secondary" className="bg-gray-200 text-gray-700">
            {availabilityLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        ))}
      </div>
    );
  };

  const renderFeatures = () => {
    if (!vehicle.details?.features || vehicle.details.features.length === 0) {
      return '-';
    }
    return (
      <div className="flex flex-wrap gap-2">
        {vehicle.details.features.map((feature, index) => (
          <Badge key={index} variant="secondary" className="bg-gray-200 text-gray-700">
            {feature}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center">
            <div className="bg-gray-100 p-2 rounded-lg mr-3">
              <Car size={24} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{vehicle.brand} {vehicle.model}</h2>
              <p className="text-sm text-gray-500">ID: {vehicle.id.substring(0, 8)}</p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant="outline" size="sm" onClick={() => onEdit(vehicle)} className="flex items-center">
              <Edit3 size={16} className="mr-2" /> Editar
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Imagen y estado */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {vehicle.image ? (
              <div className="w-full md:w-1/2 h-48 rounded-lg overflow-hidden bg-white border shadow-sm">
                <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full md:w-1/2 h-48 rounded-lg bg-gray-100 flex items-center justify-center border">
                <Car size={64} className="text-gray-300" />
              </div>
            )}
            <div className="w-full md:w-1/2 p-5 border rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{vehicle.brand} {vehicle.model} <span className="text-gray-500">({vehicle.year})</span></h3>
                <Badge variant={vehicle.available ? "default" : "destructive"} className={vehicle.available ? "bg-gray-200 text-green-700" : "bg-gray-200 text-gray-700"}>
                  {vehicle.available ? "Disponible" : "No Disponible"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow icon={<Car size={16} />} label="Matrícula" value={<span className="font-mono">{vehicle.licensePlate}</span>} />
                <DetailRow icon={<Tag size={16} />} label="Tipo" value={vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)} />
                <DetailRow icon={<Tag size={16} />} label="Categoría" value={vehicle.category.charAt(0).toUpperCase() + vehicle.category.slice(1)} />
                <DetailRow icon={<Info size={16} />} label="Color" value={vehicle.color} />
              </div>
            </div>
          </div>
          
          {/* Tabs para separar información */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="general" className="bg-white">Información General</TabsTrigger>
              <TabsTrigger value="features" className="bg-white">Características</TabsTrigger>
              <TabsTrigger value="logistics" className="bg-white">Logística</TabsTrigger>
              <TabsTrigger value="business" className="bg-white">Información Comercial</TabsTrigger>
            </TabsList>
            
            {/* Tab: Información General */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailSection 
                  title="Información Básica" 
                  icon={<Info size={18} className="text-gray-600" />}
                >
                  <div className="grid grid-cols-1 gap-y-3">
                    <DetailRow icon={<Users size={16} />} label="Asientos" value={vehicle.seats.toString()} />
                    <DetailRow icon={<Briefcase size={16} />} label="Cap. Maletas" value={vehicle.luggageCapacity.toString()} />
                    {(vehicle.description || vehicle.notes) && (
                      <DetailRow 
                        icon={<FileText size={16} />} 
                        label="Descripción" 
                        value={vehicle.description || vehicle.notes} 
                      />
                    )}
                  </div>
                </DetailSection>
                
                <DetailSection 
                  title="Propietario" 
                  icon={vehicle.ownerType === 'company' ? <Building size={18} className="text-gray-600" /> : <UserCircle size={18} className="text-gray-600" />}
                >
                  <div className="grid grid-cols-1 gap-y-3">
                    <DetailRow icon={<Tag size={16} />} label="Tipo de Propietario" value={vehicle.ownerType === 'company' ? 'Empresa' : 'Chófer Privado'} />
                    <DetailRow icon={<Users size={16} />} label="Nombre del Propietario" value={vehicle.ownerName} />
                    <DetailRow icon={<Globe size={16} />} label="País" value={<span className="flex items-center">{getCountryFlagEmoji(vehicle.ownerCountry)} <span className="ml-1">{vehicle.ownerCountry}</span></span>} />
                    {vehicle.collaboratorId && (
                      <DetailRow 
                        icon={<Building size={16} />} 
                        label="ID de Colaborador" 
                        value={vehicle.collaboratorId} 
                      />
                    )}
                  </div>
                </DetailSection>
              </div>
            </TabsContent>
            
            {/* Tab: Características */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailSection 
                  title="Características" 
                  icon={<Layers size={18} className="text-gray-600" />}
                >
                  <DetailRow 
                    icon={<Layers size={16} />} 
                    label="Características" 
                    value={renderFeatures()} 
                  />
                  
                  {vehicle.details?.armored && (
                    <>
                      <DetailRow 
                        icon={<Shield size={16} />} 
                        label="Blindado" 
                        value="Sí" 
                      />
                      {vehicle.details.armor_level && (
                        <DetailRow 
                          icon={<Shield size={16} />} 
                          label="Nivel de Blindaje" 
                          value={vehicle.details.armor_level} 
                        />
                      )}
                    </>
                  )}
                </DetailSection>
                
                {vehicle.location && (
                  <DetailSection 
                    title="Ubicación" 
                    icon={<Compass size={18} className="text-gray-600" />}
                  >
                    {vehicle.location.coordinates && vehicle.location.coordinates.length >= 2 && (
                      <>
                        <DetailRow 
                          icon={<MapPin size={16} />} 
                          label="Coordenadas" 
                          value={
                            <div>
                              <p>Longitud: {vehicle.location.coordinates[0]}</p>
                              <p>Latitud: {vehicle.location.coordinates[1]}</p>
                            </div>
                          } 
                        />
                      </>
                    )}
                    {vehicle.availability_radius && (
                      <DetailRow 
                        icon={<Compass size={16} />} 
                        label="Radio de Disponibilidad" 
                        value={`${vehicle.availability_radius} km`} 
                      />
                    )}
                  </DetailSection>
                )}
              </div>
            </TabsContent>
            
            {/* Tab: Logística */}
            <TabsContent value="logistics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailSection 
                  title="Disponibilidad" 
                  icon={<MapPin size={18} className="text-gray-600" />}
                >
                  <DetailRow icon={<Tag size={16} />} label="Tipo Disponibilidad" value={renderAvailabilityTypes()} />
                  <DetailRow icon={<Info size={16} />} label="Detalles Disponibilidad" value={<p className="whitespace-pre-line">{vehicle.availabilityDetails}</p>} />
                </DetailSection>
                
                <DetailSection 
                  title="Conductores Asignados" 
                  icon={<Users size={18} className="text-gray-600" />}
                >
                  <DetailRow icon={<Users size={16} />} label="Chófer(es)" value={renderAssociatedDrivers()} />
                </DetailSection>
              </div>
              
              <DetailSection 
                title="Documentación y Mantenimiento" 
                icon={<FileText size={18} className="text-gray-600" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                  <DetailRow icon={<Shield size={16} />} label="Nº Póliza de Seguro" value={vehicle.insurancePolicyNumber} />
                  <DetailRow icon={<Calendar size={16} />} label="Último Mantenimiento" value={vehicle.lastMaintenanceDate ? new Date(vehicle.lastMaintenanceDate).toLocaleDateString() : '-'} />
                  <DetailRow icon={<Calendar size={16} />} label="Fin de Contrato" value={vehicle.contractEndDate ? new Date(vehicle.contractEndDate).toLocaleDateString() : 'N/A'} />
                </div>
              </DetailSection>
            </TabsContent>
            
            {/* Tab: Información Comercial */}
            <TabsContent value="business" className="space-y-6">
              {vehicle.pricing && (
                <DetailSection 
                  title="Información de Precios" 
                  icon={<DollarSign size={18} className="text-gray-600" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DetailRow 
                      icon={<DollarSign size={16} />} 
                      label="Tarifa Base" 
                      value={<span className="font-semibold">{vehicle.pricing.base_fare} {vehicle.pricing.currency}</span>} 
                    />
                    {vehicle.pricing.per_km && 
                      <DetailRow 
                        icon={<MapPin size={16} />} 
                        label="Por Km" 
                        value={`${vehicle.pricing.per_km} ${vehicle.pricing.currency}`} 
                      />
                    }
                    {vehicle.pricing.per_hour && 
                      <DetailRow 
                        icon={<Calendar size={16} />} 
                        label="Por Hora" 
                        value={`${vehicle.pricing.per_hour} ${vehicle.pricing.currency}`} 
                      />
                    }
                  </div>
                </DetailSection>
              )}
              
              {(vehicle.notes || vehicle.description) && (
                <DetailSection 
                  title="Notas Adicionales" 
                  icon={<FileText size={18} className="text-gray-600" />}
                >
                  <p className="text-gray-700 whitespace-pre-line p-2">
                    {vehicle.notes || vehicle.description}
                  </p>
                </DetailSection>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer con botón de cerrar */}
        <div className="p-5 border-t border-gray-200 bg-white flex justify-end sticky bottom-0">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsView; 