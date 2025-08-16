import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Search,
  X,
  Trash2,
  Edit,
  Save,
  RefreshCw,
  FileText,
  Mail,
  MapPin,
  User,
  Car,
  Building,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/config/axios";
import { isAxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";

// Definir el tipo para los colaboradores
export interface Collaborator {
  id: string;
  name: string;
  logo: string;
  type: "company" | "individual";
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  taxId: string; // CIF/NIF
  country: string;
  city: string;
  address: string;
  postalCode: string;
  startDate: string; // Fecha de inicio de colaboración
  status: "active" | "inactive" | "pending";
  commissionRate: number; // Porcentaje de comisión
  paymentTerms: string; // Términos de pago
  bankAccount?: string;
  serviceAreas: string[]; // Zonas donde operan
  specialties: string[]; // Especialidades (bodas, eventos, etc.)
  certifications: string[]; // Certificaciones y permisos
  notes?: string;
  rating: number; // Valoración de calidad
  associatedDrivers: string[]; // IDs de los chóferes asociados
  associatedVehicles: string[]; // IDs de los vehículos asociados
}

// Interfaces para los datos de vehículos y choferes
interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  specialty?: string;
  city?: string;
  photo?: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  type: string;
  category: string;
  image?: string;
  available: boolean;
  year?: number;
  color?: string;
}

const CollaboratorsSection = () => {
  // Estados para la gestión de colaboradores
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [editingCollaborator, setEditingCollaborator] =
    useState<Collaborator | null>(null);
  const [selectedCollaboratorForDetails, setSelectedCollaboratorForDetails] =
    useState<Collaborator | null>(null);
  const [isCollaboratorDetailsViewOpen, setIsCollaboratorDetailsViewOpen] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();

  // Estados para datos asociados
  const [associatedDrivers, setAssociatedDrivers] = useState<Driver[]>([]);
  const [associatedVehicles, setAssociatedVehicles] = useState<Vehicle[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Función para obtener token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  // Cargar colaboradores cuando cambian los filtros
  useEffect(() => {
    fetchCollaborators();
  }, [typeFilter, statusFilter, searchQuery]);

  // Extraer la función fetchCollaborators
  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setError("No hay sesión activa. Por favor inicie sesión");
        setLoading(false);
        return;
      }

      const response = await api.get("/api/admin/collaborators/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          type: typeFilter !== "all" ? typeFilter : "",
          status: statusFilter !== "all" ? statusFilter : "",
          search: searchQuery,
        },
      });

      if (response.data.status === "success") {
        setCollaborators(response.data.collaborators);
        setError(null);
      } else {
        setError("Error al cargar los colaboradores: " + response.data.message);
      }
    } catch (err: any) {
      console.error("Error al obtener colaboradores:", err);
      if (err.response?.status === 403) {
        setError("No tiene permisos de administrador para ver esta página");
      } else {
        setError("Error al cargar los colaboradores. Intente nuevamente");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar los choferes asociados a un colaborador
  const fetchAssociatedDrivers = async (collaboratorId: string) => {
    try {
      setLoadingDrivers(true);
      const token = getAuthToken();

      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive",
        });
        return;
      }

      const response = await api.get(
        `/api/admin/drivers/by-collaborator/${collaboratorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.drivers) {
        setAssociatedDrivers(response.data.drivers);
      } else {
        setAssociatedDrivers([]);
      }
    } catch (err: any) {
      console.error("Error al cargar choferes asociados:", err);
      setAssociatedDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  };

  // Cargar los vehículos asociados a un colaborador
  const fetchAssociatedVehicles = async (collaboratorId: string) => {
    try {
      setLoadingVehicles(true);
      const token = getAuthToken();

      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive",
        });
        return;
      }

      const response = await api.get(
        `/api/admin/vehicles/by-collaborator/${collaboratorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.vehicles) {
        setAssociatedVehicles(response.data.vehicles);
      } else {
        setAssociatedVehicles([]);
      }
    } catch (err: any) {
      console.error("Error al cargar vehículos asociados:", err);
      setAssociatedVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Funciones para la gestión de colaboradores
  const handleCollaboratorSubmit = async (collaboratorData: any) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive",
        });
        return;
      }

      if (editingCollaborator) {
        // Actualizar un colaborador existente
        const response = await api.put(
          `/api/admin/collaborators/update/${editingCollaborator.id}`,
          collaboratorData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.status === "success") {
          // Actualizar la lista de colaboradores
          setCollaborators((prev) =>
            prev.map((c) =>
              c.id === editingCollaborator.id ? response.data.collaborator : c,
            ),
          );

          toast({
            title: "Colaborador actualizado",
            description: "El colaborador se ha actualizado correctamente",
          });
        } else {
          toast({
            title: "Error",
            description:
              response.data.message || "Error al actualizar el colaborador",
            variant: "destructive",
          });
        }
      } else {
        // Crear un nuevo colaborador
        const response = await api.post(
          "/admin/collaborators/add",
          collaboratorData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.status === "success") {
          // Añadir el nuevo colaborador a la lista
          setCollaborators((prev) => [...prev, response.data.collaborator]);

          toast({
            title: "Colaborador creado",
            description: "El colaborador se ha creado correctamente",
          });
        } else {
          toast({
            title: "Error",
            description:
              response.data.message || "Error al crear el colaborador",
            variant: "destructive",
          });
        }
      }

      // Cerrar el formulario
      setShowCollaboratorForm(false);
      setEditingCollaborator(null);
    } catch (err: any) {
      console.error("Error al guardar el colaborador:", err);
      toast({
        title: "Error",
        description:
          isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "Error al procesar la solicitud. Intente nuevamente",
        variant: "destructive",
      });
    }
  };

  const handleViewCollaboratorDetails = async (collaborator: Collaborator) => {
    setSelectedCollaboratorForDetails(collaborator);
    setIsCollaboratorDetailsViewOpen(true);
    setIsEditing(false);

    // Cargar los datos asociados
    fetchAssociatedDrivers(collaborator.id);
    fetchAssociatedVehicles(collaborator.id);
  };

  const handleCloseCollaboratorDetails = () => {
    setIsCollaboratorDetailsViewOpen(false);
    setSelectedCollaboratorForDetails(null);
    setIsEditing(false);
    // Limpiar datos asociados
    setAssociatedDrivers([]);
    setAssociatedVehicles([]);
  };

  const handleDeleteCollaborator = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Evitar que se abra el detalle al hacer clic aquí

    try {
      const token = getAuthToken();

      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive",
        });
        return;
      }

      const confirmar = window.confirm(
        "¿Está seguro que desea eliminar este colaborador? Esta acción no se puede deshacer.",
      );

      if (!confirmar) return;

      const response = await api.delete(
        `/api/admin/collaborators/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.status === "success") {
        // Eliminar el colaborador de la lista
        setCollaborators((prev) => prev.filter((c) => c.id !== id));

        toast({
          title: "Colaborador eliminado",
          description: "El colaborador se ha eliminado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description:
            response.data.message || "Error al eliminar el colaborador",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error al eliminar el colaborador:", err);
      toast({
        title: "Error",
        description:
          isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "Error al procesar la solicitud. Intente nuevamente",
        variant: "destructive",
      });
    }
  };

  const handleStartEditing = () => {
    if (!selectedCollaboratorForDetails) return;

    // Preparar datos iniciales para el formulario
    setFormData({
      ...selectedCollaboratorForDetails,
    });

    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!selectedCollaboratorForDetails) return;
    setIsSaving(true);

    try {
      const token = getAuthToken();

      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const response = await api.put(
        `/api/admin/collaborators/update/${selectedCollaboratorForDetails.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.status === "success") {
        // Actualizar la lista de colaboradores
        setCollaborators((prev) =>
          prev.map((c) =>
            c.id === selectedCollaboratorForDetails.id
              ? response.data.collaborator
              : c,
          ),
        );

        // Actualizar el colaborador seleccionado
        setSelectedCollaboratorForDetails(response.data.collaborator);

        toast({
          title: "Colaborador actualizado",
          description: "El colaborador se ha actualizado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description:
            response.data.message || "Error al actualizar el colaborador",
          variant: "destructive",
        });
      }

      setIsEditing(false);
    } catch (err: any) {
      console.error("Error al actualizar el colaborador:", err);
      toast({
        title: "Error",
        description:
          isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "Error al procesar la solicitud. Intente nuevamente",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Manejar la búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Manejar cambios en los filtros
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Renderizar la vista de detalles o la tabla
  if (isCollaboratorDetailsViewOpen && selectedCollaboratorForDetails) {
    return (
      <div className="space-y-6" data-oid="1b--a7x">
        {/* Cabecera mejorada */}
        <div
          className="bg-white border-b shadow-md py-5 px-6 sticky top-0 z-10"
          data-oid="13e_y42"
        >
          <div className="flex justify-between items-center" data-oid="w74mvpp">
            <div className="flex items-center space-x-4" data-oid="53m69l6">
              <div
                className="h-14 w-14 rounded-full overflow-hidden shadow-md border-2 border-gray-100"
                data-oid="85y_48r"
              >
                <img
                  src={selectedCollaboratorForDetails.logo}
                  alt={selectedCollaboratorForDetails.name}
                  className="h-full w-full object-cover"
                  data-oid="3kbzco1"
                />
              </div>
              <div className="flex flex-col" data-oid="azxrywf">
                <h2
                  className="text-2xl font-bold text-gray-800"
                  data-oid="2mi.y6q"
                >
                  {selectedCollaboratorForDetails.name}
                  <span
                    className="ml-3 text-sm font-medium px-3 py-1 rounded-full bg-gray-200 text-blue-700 inline-flex items-center"
                    data-oid="w1vqiro"
                  >
                    {selectedCollaboratorForDetails.type === "company"
                      ? "Empresa"
                      : "Particular"}
                  </span>
                </h2>
                <p className="text-gray-500 text-sm" data-oid="8arw947">
                  ID: {selectedCollaboratorForDetails.id}
                </p>
              </div>
            </div>
            <div className="flex space-x-2" data-oid="p-6-b2g">
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={handleStartEditing}
                  className="flex items-center hover:bg-gray-100 transition-colors border-gray-300"
                  data-oid="xbrecnk"
                >
                  <Edit className="h-4 w-4 mr-2" data-oid="n_5:5y3" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex items-center hover:bg-gray-100 transition-colors border-gray-300"
                    data-oid="akxw7i5"
                  >
                    <X className="h-4 w-4 mr-2" data-oid="x:byym0" />
                    Cancelar
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex items-center bg-black hover:bg-gray-800 transition-colors"
                    data-oid="96jrid0"
                  >
                    {isSaving ? (
                      <RefreshCw
                        className="h-4 w-4 mr-2 animate-spin"
                        data-oid="p0q3rzk"
                      />
                    ) : (
                      <Save className="h-4 w-4 mr-2" data-oid="tge09y6" />
                    )}
                    Guardar
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseCollaboratorDetails}
                className="hover:bg-gray-100 transition-colors"
                data-oid="uj17zq9"
              >
                <X className="h-5 w-5" data-oid="dyvn.5x" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="px-6 space-y-8" data-oid="vqpjnu2">
          {/* Información del colaborador */}
          <Card
            className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden border-0 rounded-xl"
            data-oid="tg5g5mc"
          >
            <CardHeader
              className="bg-gradient-to-r from-gray-50 to-gray-100 border-b py-5"
              data-oid="j33b-f3"
            >
              <CardTitle
                className="text-lg text-gray-800 flex items-center"
                data-oid="6b47c9q"
              >
                <span
                  className="bg-gray-200 p-1.5 rounded-md text-gray-700 mr-3"
                  data-oid="9awv5td"
                >
                  <FileText className="h-5 w-5" data-oid="74sf43." />
                </span>
                Información del Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0" data-oid="nt5aot_">
              <div
                className="flex flex-col md:flex-row md:space-x-6 p-6"
                data-oid="ify6:-o"
              >
                <div
                  className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0"
                  data-oid="sjvq056"
                >
                  <div className="relative mb-5" data-oid="us:rqpo">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-red-50 to-amber-50 rounded-full blur-md opacity-50"
                      data-oid="0shdc6b"
                    ></div>
                    <img
                      src={selectedCollaboratorForDetails.logo}
                      alt={selectedCollaboratorForDetails.name}
                      className="h-36 w-36 rounded-full object-cover border-4 border-white shadow-md relative z-10"
                      data-oid="4f5sp50"
                    />
                  </div>

                  {!isEditing ? (
                    <>
                      <h3
                        className="text-xl font-semibold text-center mb-2"
                        data-oid=":6vp:p."
                      >
                        {selectedCollaboratorForDetails.name}
                      </h3>
                      <div
                        className="flex items-center mt-1 text-amber-500 mb-3"
                        data-oid="m-0slc-"
                      >
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i <
                              Math.round(selectedCollaboratorForDetails.rating)
                                ? ""
                                : "text-gray-300"
                            }
                            data-oid="3u_j-.-"
                          >
                            ★
                          </span>
                        ))}
                        <span
                          className="ml-1 text-gray-600 text-sm"
                          data-oid="bnzqmgt"
                        >
                          ({selectedCollaboratorForDetails.rating.toFixed(1)})
                        </span>
                      </div>
                      <span
                        className={`mb-3 px-4 py-1.5 text-sm font-medium rounded-full shadow-sm ${
                          selectedCollaboratorForDetails.status === "active"
                            ? "bg-gray-200 text-green-800 border border-green-200"
                            : selectedCollaboratorForDetails.status ===
                                "inactive"
                              ? "bg-gray-100 text-gray-800 border border-gray-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                        data-oid="8b-of2b"
                      >
                        <span
                          className={`inline-block h-2 w-2 rounded-full mr-2 ${
                            selectedCollaboratorForDetails.status === "active"
                              ? "bg-gray-600"
                              : selectedCollaboratorForDetails.status ===
                                  "inactive"
                                ? "bg-gray-500"
                                : "bg-amber-500"
                          }`}
                          data-oid="qf2o4:m"
                        ></span>
                        {selectedCollaboratorForDetails.status === "active"
                          ? "Activo"
                          : selectedCollaboratorForDetails.status === "inactive"
                            ? "Inactivo"
                            : "Pendiente"}
                      </span>
                      <div
                        className="mt-4 px-4 py-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm w-full"
                        data-oid="xm4exn7"
                      >
                        <div
                          className="text-sm font-medium text-gray-600 mb-2"
                          data-oid="oxd18uf"
                        >
                          Tipo de colaborador
                        </div>
                        <div
                          className="text-lg font-medium text-center"
                          data-oid="-fe_zz0"
                        >
                          {selectedCollaboratorForDetails.type === "company"
                            ? "Empresa"
                            : "Particular"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full space-y-4" data-oid="ogk530a">
                      <div data-oid="h_2hey6">
                        <label
                          className="text-sm font-medium text-gray-500"
                          data-oid="t.t6.0k"
                        >
                          Nombre
                        </label>
                        <Input
                          name="name"
                          value={formData.name || ""}
                          onChange={handleInputChange}
                          className="mt-1"
                          data-oid="iqb-bpy"
                        />
                      </div>
                      <div data-oid="-814wh3">
                        <label
                          className="text-sm font-medium text-gray-500"
                          data-oid="ttzbk:y"
                        >
                          Estado
                        </label>
                        <Select
                          value={formData.status || "active"}
                          onValueChange={(value) =>
                            setFormData({ ...formData, status: value })
                          }
                          data-oid="lmrmtmo"
                        >
                          <SelectTrigger className="w-full" data-oid="jwde06.">
                            <SelectValue
                              placeholder="Seleccionar estado"
                              data-oid="pdkgqk1"
                            />
                          </SelectTrigger>
                          <SelectContent data-oid="k0g.795">
                            <SelectItem value="active" data-oid="ub8zaa6">
                              Activo
                            </SelectItem>
                            <SelectItem value="inactive" data-oid=".imzakj">
                              Inactivo
                            </SelectItem>
                            <SelectItem value="pending" data-oid="d9u4r_1">
                              Pendiente
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div data-oid="yis21du">
                        <label
                          className="text-sm font-medium text-gray-500"
                          data-oid="ij_0m85"
                        >
                          Tipo
                        </label>
                        <Select
                          value={formData.type || "company"}
                          onValueChange={(value) =>
                            setFormData({ ...formData, type: value })
                          }
                          data-oid="shaguv0"
                        >
                          <SelectTrigger className="w-full" data-oid="62aec.9">
                            <SelectValue
                              placeholder="Seleccionar tipo"
                              data-oid="_9-8cxt"
                            />
                          </SelectTrigger>
                          <SelectContent data-oid="8zpicir">
                            <SelectItem value="company" data-oid="-8_th4z">
                              Empresa
                            </SelectItem>
                            <SelectItem value="individual" data-oid="ce-q2uy">
                              Particular
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:w-2/3" data-oid="5mb3lot">
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    data-oid="611o7.h"
                  >
                    <div
                      className="bg-white rounded-lg border border-gray-100 shadow-sm p-5"
                      data-oid="yme5fzi"
                    >
                      <h4
                        className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center"
                        data-oid="3cigvgh"
                      >
                        <Mail
                          className="h-4 w-4 mr-2 text-black"
                          data-oid="atbl3u9"
                        />
                        Información de contacto
                      </h4>
                      {!isEditing ? (
                        <div className="space-y-3" data-oid="uo5xtuc">
                          <div className="flex items-center" data-oid="f:r12xs">
                            <div
                              className="w-28 text-sm text-gray-500"
                              data-oid="jfnufsg"
                            >
                              Contacto:
                            </div>
                            <div className="font-medium" data-oid="i93n737">
                              {selectedCollaboratorForDetails.contactName}
                            </div>
                          </div>
                          <div className="flex items-center" data-oid="qoeztr-">
                            <div
                              className="w-28 text-sm text-gray-500"
                              data-oid="p21h.ze"
                            >
                              Email:
                            </div>
                            <div
                              className="font-medium text-gray-600"
                              data-oid="fa2lzgm"
                            >
                              {selectedCollaboratorForDetails.contactEmail}
                            </div>
                          </div>
                          <div className="flex items-center" data-oid="0b99.0q">
                            <div
                              className="w-28 text-sm text-gray-500"
                              data-oid="z8mnann"
                            >
                              Teléfono:
                            </div>
                            <div className="font-medium" data-oid="ec1qeta">
                              {selectedCollaboratorForDetails.contactPhone}
                            </div>
                          </div>
                          <div className="flex" data-oid="856v44p">
                            <div
                              className="w-28 text-sm text-gray-500"
                              data-oid="32f8xyy"
                            >
                              Dirección:
                            </div>
                            <div className="font-medium" data-oid="ee1u1yv">
                              {selectedCollaboratorForDetails.address},{" "}
                              {selectedCollaboratorForDetails.postalCode}
                            </div>
                          </div>
                          <div className="flex items-center" data-oid="atfglz7">
                            <div
                              className="w-28 text-sm text-gray-500"
                              data-oid="__zs.6n"
                            >
                              Ubicación:
                            </div>
                            <div className="font-medium" data-oid="twkh:_h">
                              {selectedCollaboratorForDetails.city},{" "}
                              {selectedCollaboratorForDetails.country}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3" data-oid="s:cv-c_">
                          <div data-oid="sp03ghr">
                            <label
                              className="text-sm text-gray-500"
                              data-oid="bb.30pr"
                            >
                              Contacto
                            </label>
                            <Input
                              name="contactName"
                              value={formData.contactName || ""}
                              onChange={handleInputChange}
                              className="mt-1"
                              data-oid="o8vtjp5"
                            />
                          </div>
                          <div data-oid="7z_rp7b">
                            <label
                              className="text-sm text-gray-500"
                              data-oid="s6q.jyd"
                            >
                              Email
                            </label>
                            <Input
                              name="contactEmail"
                              value={formData.contactEmail || ""}
                              onChange={handleInputChange}
                              className="mt-1"
                              data-oid="l.oz3i8"
                            />
                          </div>
                          <div data-oid="pox-dij">
                            <label
                              className="text-sm text-gray-500"
                              data-oid="675-l12"
                            >
                              Teléfono
                            </label>
                            <Input
                              name="contactPhone"
                              value={formData.contactPhone || ""}
                              onChange={handleInputChange}
                              className="mt-1"
                              data-oid=":fzvvgl"
                            />
                          </div>
                          <div data-oid="rigusqq">
                            <label
                              className="text-sm text-gray-500"
                              data-oid="z_x1zjh"
                            >
                              Dirección
                            </label>
                            <Input
                              name="address"
                              value={formData.address || ""}
                              onChange={handleInputChange}
                              className="mt-1"
                              data-oid="m3o43mx"
                            />
                          </div>
                          <div
                            className="grid grid-cols-2 gap-2"
                            data-oid="hjjq:.0"
                          >
                            <div data-oid="prlokgj">
                              <label
                                className="text-sm text-gray-500"
                                data-oid="wc50z2u"
                              >
                                Código Postal
                              </label>
                              <Input
                                name="postalCode"
                                value={formData.postalCode || ""}
                                onChange={handleInputChange}
                                className="mt-1"
                                data-oid="t7hv_yp"
                              />
                            </div>
                            <div data-oid="r8w734x">
                              <label
                                className="text-sm text-gray-500"
                                data-oid="8pwrj35"
                              >
                                Ciudad
                              </label>
                              <Input
                                name="city"
                                value={formData.city || ""}
                                onChange={handleInputChange}
                                className="mt-1"
                                data-oid="zb_0aq_"
                              />
                            </div>
                          </div>
                          <div data-oid="fa.up0y">
                            <label
                              className="text-sm text-gray-500"
                              data-oid="kvpdj2f"
                            >
                              País
                            </label>
                            <Input
                              name="country"
                              value={formData.country || ""}
                              onChange={handleInputChange}
                              className="mt-1"
                              data-oid="ubgi8n1"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className="bg-white rounded-lg border border-gray-100 shadow-sm p-5"
                      data-oid="0xcuztw"
                    >
                      <h4
                        className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center"
                        data-oid="pt.6md:"
                      >
                        <FileText
                          className="h-4 w-4 mr-2 text-black"
                          data-oid="fg3bgkz"
                        />
                        Información fiscal
                      </h4>
                      {!isEditing ? (
                        <div className="space-y-3" data-oid="bds-c:v">
                          <div className="flex items-center" data-oid="r.b5:n3">
                            <div
                              className="w-28 text-sm text-gray-500"
                              data-oid="a.od6g:"
                            >
                              CIF/NIF:
                            </div>
                            <div className="font-medium" data-oid="l_k65im">
                              {selectedCollaboratorForDetails.taxId}
                            </div>
                          </div>
                          <div className="flex items-center" data-oid="fn7unen">
                            <div
                              className="w-28 text-sm text-gray-500"
                              data-oid="bldx:kl"
                            >
                              Fecha inicio:
                            </div>
                            <div className="font-medium" data-oid="s0nhzou">
                              {new Date(
                                selectedCollaboratorForDetails.startDate,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center" data-oid="7ra6cdq">
                            <div
                              className="w-28 text-sm text-gray-500"
                              data-oid="wlf2q4a"
                            >
                              Comisión:
                            </div>
                            <div
                              className="font-medium text-green-600"
                              data-oid="u5q8xle"
                            >
                              {selectedCollaboratorForDetails.commissionRate}%
                            </div>
                          </div>
                          <div className="flex items-center" data-oid="ik9hv15">
                            <div
                              className="w-28 text-sm text-gray-500"
                              data-oid="77w26yc"
                            >
                              Pago:
                            </div>
                            <div className="font-medium" data-oid="hvrru8a">
                              {selectedCollaboratorForDetails.paymentTerms}
                            </div>
                          </div>
                          {selectedCollaboratorForDetails.bankAccount && (
                            <div
                              className="flex items-center"
                              data-oid="d7_.bvy"
                            >
                              <div
                                className="w-28 text-sm text-gray-500"
                                data-oid="r7pzeyd"
                              >
                                Cuenta:
                              </div>
                              <div
                                className="font-medium text-gray-700 font-mono text-sm tracking-wide"
                                data-oid="kb.vssm"
                              >
                                {selectedCollaboratorForDetails.bankAccount}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3" data-oid="dgz.xpq">
                          <div data-oid="4jj49:.">
                            <label
                              className="text-sm text-gray-500"
                              data-oid="vhm1afd"
                            >
                              CIF/NIF
                            </label>
                            <Input
                              name="taxId"
                              value={formData.taxId || ""}
                              onChange={handleInputChange}
                              className="mt-1"
                              data-oid="jhnwaom"
                            />
                          </div>
                          <div data-oid=":4hmru0">
                            <label
                              className="text-sm text-gray-500"
                              data-oid="c6ryr-q"
                            >
                              Fecha de inicio
                            </label>
                            <Input
                              type="date"
                              name="startDate"
                              value={formData.startDate || ""}
                              onChange={handleInputChange}
                              className="mt-1"
                              data-oid="d-k9nkn"
                            />
                          </div>
                          <div data-oid="a-kkujs">
                            <label
                              className="text-sm text-gray-500"
                              data-oid="7_jbgz."
                            >
                              Comisión (%)
                            </label>
                            <Input
                              type="number"
                              name="commissionRate"
                              value={formData.commissionRate || ""}
                              onChange={handleInputChange}
                              className="mt-1"
                              data-oid="lma:e37"
                            />
                          </div>
                          <div data-oid="mkmeg:h">
                            <label
                              className="text-sm text-gray-500"
                              data-oid="mkh3-bs"
                            >
                              Términos de pago
                            </label>
                            <Input
                              name="paymentTerms"
                              value={formData.paymentTerms || ""}
                              onChange={handleInputChange}
                              className="mt-1"
                              data-oid="a2.3.:k"
                            />
                          </div>
                          <div data-oid="-:n6.uh">
                            <label
                              className="text-sm text-gray-500"
                              data-oid="jiaez.g"
                            >
                              Cuenta bancaria
                            </label>
                            <Input
                              name="bankAccount"
                              value={formData.bankAccount || ""}
                              onChange={handleInputChange}
                              className="mt-1"
                              data-oid="697zk1j"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="mt-6 bg-white rounded-lg border border-gray-100 shadow-sm p-5"
                    data-oid="vm5.k8y"
                  >
                    <h4
                      className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center"
                      data-oid="h3r6kx3"
                    >
                      <MapPin
                        className="h-4 w-4 mr-2 text-black"
                        data-oid="rty0u5_"
                      />
                      Zonas y Especialidades
                    </h4>
                    {!isEditing ? (
                      <>
                        <div className="mb-4" data-oid="lxnyh5i">
                          <p
                            className="text-sm font-medium mb-2 text-gray-600"
                            data-oid="vp2d5hw"
                          >
                            Zonas de servicio:
                          </p>
                          <div
                            className="flex flex-wrap gap-2"
                            data-oid="hoizst."
                          >
                            {selectedCollaboratorForDetails.serviceAreas.map(
                              (area) => (
                                <span
                                  key={area}
                                  className="px-3 py-1 bg-gray-100 text-blue-700 border border-blue-100 text-sm rounded-full shadow-sm"
                                  data-oid="f79fckt"
                                >
                                  {area}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                        <div className="mb-4" data-oid="5ilk7l5">
                          <p
                            className="text-sm font-medium mb-2 text-gray-600"
                            data-oid="-q5xg1t"
                          >
                            Especialidades:
                          </p>
                          <div
                            className="flex flex-wrap gap-2"
                            data-oid="r-16w.k"
                          >
                            {selectedCollaboratorForDetails.specialties.map(
                              (specialty) => (
                                <span
                                  key={specialty}
                                  className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 text-sm rounded-full shadow-sm"
                                  data-oid="423f5ef"
                                >
                                  {specialty}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                        <div data-oid="_5e8-gv">
                          <p
                            className="text-sm font-medium mb-2 text-gray-600"
                            data-oid="248_.5d"
                          >
                            Certificaciones:
                          </p>
                          <div
                            className="flex flex-wrap gap-2"
                            data-oid="99840y-"
                          >
                            {selectedCollaboratorForDetails.certifications.map(
                              (cert) => (
                                <span
                                  key={cert}
                                  className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 text-sm rounded-full shadow-sm"
                                  data-oid="69x043."
                                >
                                  {cert}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4" data-oid="jasne7s">
                        <div data-oid="vog4dso">
                          <label
                            className="text-sm text-gray-500"
                            data-oid="as8xq3f"
                          >
                            Zonas de servicio (separadas por comas)
                          </label>
                          <Input
                            name="serviceAreas"
                            value={
                              Array.isArray(formData.serviceAreas)
                                ? formData.serviceAreas.join(", ")
                                : ""
                            }
                            onChange={(e) => {
                              const areas = e.target.value
                                .split(",")
                                .map((area) => area.trim())
                                .filter(Boolean);
                              setFormData({ ...formData, serviceAreas: areas });
                            }}
                            className="mt-1"
                            data-oid=":o:wryc"
                          />
                        </div>
                        <div data-oid="045y24u">
                          <label
                            className="text-sm text-gray-500"
                            data-oid="wl:.px9"
                          >
                            Especialidades (separadas por comas)
                          </label>
                          <Input
                            name="specialties"
                            value={
                              Array.isArray(formData.specialties)
                                ? formData.specialties.join(", ")
                                : ""
                            }
                            onChange={(e) => {
                              const specialties = e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              setFormData({
                                ...formData,
                                specialties: specialties,
                              });
                            }}
                            className="mt-1"
                            data-oid="36f2bmf"
                          />
                        </div>
                        <div data-oid="19umitk">
                          <label
                            className="text-sm text-gray-500"
                            data-oid="4n17egk"
                          >
                            Certificaciones (separadas por comas)
                          </label>
                          <Input
                            name="certifications"
                            value={
                              Array.isArray(formData.certifications)
                                ? formData.certifications.join(", ")
                                : ""
                            }
                            onChange={(e) => {
                              const certifications = e.target.value
                                .split(",")
                                .map((c) => c.trim())
                                .filter(Boolean);
                              setFormData({
                                ...formData,
                                certifications: certifications,
                              });
                            }}
                            className="mt-1"
                            data-oid="s32i6_q"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-0"
                  data-oid="49syo31"
                >
                  <div
                    className="bg-white rounded-lg border border-gray-100 shadow-sm p-5"
                    data-oid="xe29-ze"
                  >
                    <h4
                      className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center"
                      data-oid="1yfrx13"
                    >
                      <User
                        className="h-4 w-4 mr-2 text-black"
                        data-oid="94pxwz9"
                      />
                      Chóferes asociados
                    </h4>
                    {selectedCollaboratorForDetails.associatedDrivers.length >
                    0 ? (
                      <div
                        className="grid grid-cols-1 gap-2"
                        data-oid="794y-mx"
                      >
                        {loadingDrivers ? (
                          <div
                            className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center"
                            data-oid="5erjo::"
                          >
                            <p
                              className="text-sm text-gray-500"
                              data-oid="zdq_umg"
                            >
                              Cargando chóferes...
                            </p>
                          </div>
                        ) : associatedDrivers.length > 0 ? (
                          associatedDrivers.map((driver) => (
                            <div
                              key={driver.id}
                              className="flex items-center p-2 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                              data-oid="x5wbg74"
                            >
                              <div
                                className="w-10 h-10 flex-shrink-0 mr-3"
                                data-oid="lai93z9"
                              >
                                {driver.photo ? (
                                  <img
                                    src={driver.photo}
                                    alt={driver.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                    data-oid="u.-709o"
                                  />
                                ) : (
                                  <div
                                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium"
                                    data-oid="vruusz4"
                                  >
                                    <User
                                      className="h-5 w-5"
                                      data-oid="if-rafc"
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1" data-oid="558-z4a">
                                <p
                                  className="text-sm font-medium"
                                  data-oid="g4riwyj"
                                >
                                  {driver.name}
                                </p>
                                <div
                                  className="flex flex-wrap gap-2 mt-1"
                                  data-oid="ijmyqzg"
                                >
                                  {driver.email && (
                                    <p
                                      className="text-xs text-gray-500"
                                      data-oid="tk49k_."
                                    >
                                      {driver.email}
                                    </p>
                                  )}
                                  {driver.phone && (
                                    <p
                                      className="text-xs text-gray-500"
                                      data-oid="7u2exg."
                                    >
                                      {driver.phone}
                                    </p>
                                  )}
                                </div>
                                <div
                                  className="flex items-center gap-2 mt-1"
                                  data-oid="li4w17x"
                                >
                                  {driver.specialty && (
                                    <span
                                      className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full"
                                      data-oid="-sp3-im"
                                    >
                                      {driver.specialty}
                                    </span>
                                  )}
                                  {driver.city && (
                                    <span
                                      className="px-2 py-0.5 bg-gray-100 text-blue-700 text-xs rounded-full"
                                      data-oid="h_6gych"
                                    >
                                      {driver.city}
                                    </span>
                                  )}
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      driver.status === "active"
                                        ? "bg-green-50 text-green-700"
                                        : driver.status === "inactive"
                                          ? "bg-gray-50 text-gray-700"
                                          : "bg-amber-50 text-amber-700"
                                    }`}
                                    data-oid="oa:v04o"
                                  >
                                    {driver.status === "active"
                                      ? "Activo"
                                      : driver.status === "inactive"
                                        ? "Inactivo"
                                        : "Pendiente"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center"
                            data-oid="hqt_:bu"
                          >
                            <p
                              className="text-sm text-gray-500"
                              data-oid="8z0ci5u"
                            >
                              No se encontraron datos de los chóferes
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center"
                        data-oid="24dithx"
                      >
                        <p className="text-sm text-gray-500" data-oid="ovvz27o">
                          No hay chóferes asociados
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    className="bg-white rounded-lg border border-gray-100 shadow-sm p-5"
                    data-oid="4v5ete1"
                  >
                    <h4
                      className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center"
                      data-oid="vn2r7z-"
                    >
                      <Car
                        className="h-4 w-4 mr-2 text-black"
                        data-oid="qj6zdxr"
                      />
                      Vehículos asociados
                    </h4>
                    {selectedCollaboratorForDetails.associatedVehicles.length >
                    0 ? (
                      <div
                        className="grid grid-cols-1 gap-2"
                        data-oid="9f0oejw"
                      >
                        {loadingVehicles ? (
                          <div
                            className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center"
                            data-oid="wf:feli"
                          >
                            <p
                              className="text-sm text-gray-500"
                              data-oid="ihpnn.0"
                            >
                              Cargando vehículos...
                            </p>
                          </div>
                        ) : associatedVehicles.length > 0 ? (
                          associatedVehicles.map((vehicle) => (
                            <div
                              key={vehicle.id}
                              className="flex items-center p-2 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                              data-oid="0eu2b-3"
                            >
                              <div
                                className="w-12 h-12 flex-shrink-0 mr-3"
                                data-oid="h9_6l7r"
                              >
                                {vehicle.image ? (
                                  <img
                                    src={vehicle.image}
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    className="w-12 h-12 rounded-md object-cover"
                                    data-oid="ct-68y."
                                  />
                                ) : (
                                  <div
                                    className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-600"
                                    data-oid="trun1:g"
                                  >
                                    <Car
                                      className="h-6 w-6"
                                      data-oid="nqdi6p2"
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1" data-oid="qrq2a.8">
                                <p
                                  className="text-sm font-medium"
                                  data-oid="g60p:ek"
                                >
                                  {vehicle.brand} {vehicle.model}
                                </p>
                                <div
                                  className="flex flex-wrap gap-2 mt-1"
                                  data-oid="6w0682x"
                                >
                                  <p
                                    className="text-xs text-gray-500"
                                    data-oid="oetnnv2"
                                  >
                                    {vehicle.licensePlate}
                                  </p>
                                  {vehicle.year && (
                                    <p
                                      className="text-xs text-gray-500"
                                      data-oid="hnbgbgo"
                                    >
                                      {vehicle.year}
                                    </p>
                                  )}
                                  {vehicle.color && (
                                    <p
                                      className="text-xs text-gray-500"
                                      data-oid="vgzy5fs"
                                    >
                                      {vehicle.color}
                                    </p>
                                  )}
                                </div>
                                <div
                                  className="flex items-center gap-2 mt-1"
                                  data-oid="qk:s65o"
                                >
                                  <span
                                    className="px-2 py-0.5 bg-gray-100 text-blue-700 text-xs rounded-full"
                                    data-oid="9jkg-ac"
                                  >
                                    {vehicle.type.charAt(0).toUpperCase() +
                                      vehicle.type.slice(1)}
                                  </span>
                                  <span
                                    className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full"
                                    data-oid="45k5b2q"
                                  >
                                    {vehicle.category.charAt(0).toUpperCase() +
                                      vehicle.category
                                        .slice(1)
                                        .replace("_", " ")}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      vehicle.available
                                        ? "bg-green-50 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                    data-oid="jg9_odr"
                                  >
                                    {vehicle.available
                                      ? "Disponible"
                                      : "No disponible"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center"
                            data-oid="2dvgmb2"
                          >
                            <p
                              className="text-sm text-gray-500"
                              data-oid="0:.mncx"
                            >
                              No se encontraron datos de los vehículos
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center"
                        data-oid="c.y-0oo"
                      >
                        <p className="text-sm text-gray-500" data-oid="4vq7jhe">
                          No hay vehículos asociados
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6 pt-0" data-oid="lp_-u9i">
                <div
                  className="bg-white rounded-lg border border-gray-100 shadow-sm p-5"
                  data-oid="a09725g"
                >
                  <h4
                    className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center"
                    data-oid="rbphcps"
                  >
                    <FileText
                      className="h-4 w-4 mr-2 text-black"
                      data-oid="::b048:"
                    />
                    Notas
                  </h4>
                  {!isEditing ? (
                    <div
                      className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                      data-oid="tp5c63k"
                    >
                      <p className="text-sm" data-oid="if38ej7">
                        {selectedCollaboratorForDetails.notes || "Sin notas"}
                      </p>
                    </div>
                  ) : (
                    <Textarea
                      name="notes"
                      value={formData.notes || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                      rows={4}
                      data-oid="vkr4n1_"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista de la tabla (cuando no se está viendo un colaborador específico)
  return (
    <div className="space-y-6" data-oid="upw44kd">
      <div className="flex justify-between items-center" data-oid="bfcc4wn">
        <h1 className="text-2xl font-bold text-gray-800" data-oid="98:kaqn">
          Gestión de Colaboradores
        </h1>
        {!showCollaboratorForm && (
          <Button
            onClick={() => {
              setEditingCollaborator(null);
              setShowCollaboratorForm(true);
            }}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            data-oid="nj5:2rm"
          >
            <PlusCircle size={18} className="mr-2" data-oid="fd3dac5" />
            Añadir Colaborador
          </Button>
        )}
      </div>

      {showCollaboratorForm ? (
        <Card className="shadow-md" data-oid="ll.mucp">
          <CardHeader className="border-b bg-gray-50" data-oid="v3zvh4z">
            <CardTitle data-oid="vkr04mf">
              {editingCollaborator ? "Editar" : "Añadir"} Colaborador
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6" data-oid="nfd:ug8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Recoger todos los datos del formulario
                const formData = new FormData(e.currentTarget);
                const data: any = {};

                // Convertir campos de texto en arrays
                const serviceAreas =
                  formData.get("serviceAreas")?.toString() || "";
                const specialties =
                  formData.get("specialties")?.toString() || "";
                const certifications =
                  formData.get("certifications")?.toString() || "";

                // Preparar los datos para enviar
                for (const [key, value] of formData.entries()) {
                  if (
                    key !== "serviceAreas" &&
                    key !== "specialties" &&
                    key !== "certifications"
                  ) {
                    data[key] = value;
                  }
                }

                // Convertir strings a arrays
                data.serviceAreas = serviceAreas
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean);
                data.specialties = specialties
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean);
                data.certifications = certifications
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean);

                // Forzar conversión de campos numéricos
                data.commissionRate = parseFloat(data.commissionRate) || 0;

                // Añadir campos necesarios que puedan faltar y tengan valores por defecto
                data.rating = editingCollaborator?.rating || 0;
                data.associatedDrivers =
                  editingCollaborator?.associatedDrivers || [];
                data.associatedVehicles =
                  editingCollaborator?.associatedVehicles || [];

                // Crear o actualizar colaborador
                handleCollaboratorSubmit(data);
              }}
              className="space-y-6"
              data-oid="m8zpjfe"
            >
              {/* Información básica */}
              <div data-oid="xqpsa4q">
                <h3
                  className="text-lg font-medium border-b pb-2 mb-4"
                  data-oid="ss.e1y5"
                >
                  Información básica
                </h3>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  data-oid="el2ii8f"
                >
                  <div data-oid="iswwn3h">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="0ld0xxr"
                    >
                      Nombre del colaborador*
                    </label>
                    <Input
                      name="name"
                      defaultValue={editingCollaborator?.name || ""}
                      required
                      data-oid="sb9dgs5"
                    />
                  </div>
                  <div data-oid="ne2.uoz">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="pl_gabh"
                    >
                      URL del Logo
                    </label>
                    <Input
                      name="logo"
                      defaultValue={editingCollaborator?.logo || ""}
                      placeholder="https://example.com/logo.jpg"
                      data-oid="ca.vqj7"
                    />
                  </div>
                  <div data-oid="z70fq4:">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="6cuwz5-"
                    >
                      Tipo de colaborador*
                    </label>
                    <Select
                      name="type"
                      defaultValue={editingCollaborator?.type || "company"}
                      data-oid="scpyad5"
                    >
                      <SelectTrigger data-oid="6jhp:::">
                        <SelectValue
                          placeholder="Seleccionar tipo"
                          data-oid="vvldzpr"
                        />
                      </SelectTrigger>
                      <SelectContent data-oid="uqyu7s2">
                        <SelectItem value="company" data-oid="dahitph">
                          Empresa
                        </SelectItem>
                        <SelectItem value="individual" data-oid="4.d2m-6">
                          Particular
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div data-oid="n460i81">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="p1:7uj5"
                    >
                      Estado*
                    </label>
                    <Select
                      name="status"
                      defaultValue={editingCollaborator?.status || "active"}
                      data-oid="jpvk_m:"
                    >
                      <SelectTrigger data-oid="b_.gyz8">
                        <SelectValue
                          placeholder="Seleccionar estado"
                          data-oid="h32rafd"
                        />
                      </SelectTrigger>
                      <SelectContent data-oid="ja9wnba">
                        <SelectItem value="active" data-oid="::32c_h">
                          Activo
                        </SelectItem>
                        <SelectItem value="inactive" data-oid="pds--00">
                          Inactivo
                        </SelectItem>
                        <SelectItem value="pending" data-oid="a.ruxgh">
                          Pendiente
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div data-oid="im94lt_">
                <h3
                  className="text-lg font-medium border-b pb-2 mb-4"
                  data-oid="6u3lp86"
                >
                  Información de contacto
                </h3>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  data-oid="b4bsfyu"
                >
                  <div data-oid="d9070ni">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="8ulo28h"
                    >
                      Nombre de contacto*
                    </label>
                    <Input
                      name="contactName"
                      defaultValue={editingCollaborator?.contactName || ""}
                      required
                      data-oid=".zv_644"
                    />
                  </div>
                  <div data-oid="8qe6qif">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="r427-wi"
                    >
                      Email de contacto*
                    </label>
                    <Input
                      type="email"
                      name="contactEmail"
                      defaultValue={editingCollaborator?.contactEmail || ""}
                      required
                      data-oid="jtv8zon"
                    />
                  </div>
                  <div data-oid="_:-.xda">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="rb7rh7s"
                    >
                      Teléfono de contacto*
                    </label>
                    <Input
                      name="contactPhone"
                      defaultValue={editingCollaborator?.contactPhone || ""}
                      required
                      data-oid="enrnh.w"
                    />
                  </div>
                  <div className="md:col-span-2" data-oid="t43je2j">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="vhsbfa."
                    >
                      Dirección
                    </label>
                    <Input
                      name="address"
                      defaultValue={editingCollaborator?.address || ""}
                      data-oid="t20:y5n"
                    />
                  </div>
                  <div data-oid="g-mdmtd">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="fza5.a4"
                    >
                      Código Postal
                    </label>
                    <Input
                      name="postalCode"
                      defaultValue={editingCollaborator?.postalCode || ""}
                      data-oid="sa73o3p"
                    />
                  </div>
                  <div data-oid="tvupjx8">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="xjua:15"
                    >
                      Ciudad
                    </label>
                    <Input
                      name="city"
                      defaultValue={editingCollaborator?.city || ""}
                      data-oid="uurw0de"
                    />
                  </div>
                  <div data-oid="tjmd2t_">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="95wp.m5"
                    >
                      País
                    </label>
                    <Input
                      name="country"
                      defaultValue={editingCollaborator?.country || ""}
                      data-oid="jyb9.8m"
                    />
                  </div>
                </div>
              </div>

              {/* Información fiscal y contractual */}
              <div data-oid="wu-rjxx">
                <h3
                  className="text-lg font-medium border-b pb-2 mb-4"
                  data-oid="u4s:pfv"
                >
                  Información fiscal y contractual
                </h3>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  data-oid="zpm7ag6"
                >
                  <div data-oid="phpub4x">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="0v6ga_:"
                    >
                      CIF/NIF*
                    </label>
                    <Input
                      name="taxId"
                      defaultValue={editingCollaborator?.taxId || ""}
                      required
                      data-oid="ey6qkz9"
                    />
                  </div>
                  <div data-oid="v1qa9-u">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="gpq2ov7"
                    >
                      Fecha de inicio*
                    </label>
                    <Input
                      type="date"
                      name="startDate"
                      defaultValue={
                        editingCollaborator?.startDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      required
                      data-oid="9mcx-do"
                    />
                  </div>
                  <div data-oid="7:vr1aa">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="lnfl75z"
                    >
                      Comisión (%)*
                    </label>
                    <Input
                      type="number"
                      name="commissionRate"
                      defaultValue={editingCollaborator?.commissionRate || 10}
                      required
                      data-oid="7kmtker"
                    />
                  </div>
                  <div data-oid="r4.orvd">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="1:vh28s"
                    >
                      Términos de pago
                    </label>
                    <Input
                      name="paymentTerms"
                      defaultValue={editingCollaborator?.paymentTerms || ""}
                      placeholder="Ej: Pago mensual, 30 días"
                      data-oid="lpsf0:a"
                    />
                  </div>
                  <div className="md:col-span-2" data-oid="ivwcwu9">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="fc2nn6b"
                    >
                      Cuenta bancaria
                    </label>
                    <Input
                      name="bankAccount"
                      defaultValue={editingCollaborator?.bankAccount || ""}
                      placeholder="ES12 1234 5678 9012 3456 7890"
                      data-oid="h::9mxl"
                    />
                  </div>
                </div>
              </div>

              {/* Zonas, especialidades y certificaciones */}
              <div data-oid="9:buxu9">
                <h3
                  className="text-lg font-medium border-b pb-2 mb-4"
                  data-oid=":i2gv_p"
                >
                  Zonas y especialidades
                </h3>
                <div className="grid grid-cols-1 gap-4" data-oid="vlsst:.">
                  <div data-oid="fna82px">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="n91sl-e"
                    >
                      Zonas de servicio (separadas por comas)
                    </label>
                    <Input
                      name="serviceAreas"
                      defaultValue={
                        editingCollaborator?.serviceAreas
                          ? editingCollaborator.serviceAreas.join(", ")
                          : ""
                      }
                      placeholder="Madrid, Barcelona, Sevilla"
                      data-oid="-xr1hdr"
                    />

                    <p
                      className="text-xs text-gray-500 mt-1"
                      data-oid="r5y_t-m"
                    >
                      Indica las zonas geográficas donde opera el colaborador
                    </p>
                  </div>
                  <div data-oid="9fwp9p0">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="z9li66f"
                    >
                      Especialidades (separadas por comas)
                    </label>
                    <Input
                      name="specialties"
                      defaultValue={
                        editingCollaborator?.specialties
                          ? editingCollaborator.specialties.join(", ")
                          : ""
                      }
                      placeholder="Bodas, Eventos corporativos, Traslados aeropuerto"
                      data-oid="st-v2a4"
                    />

                    <p
                      className="text-xs text-gray-500 mt-1"
                      data-oid="7:40ern"
                    >
                      Tipo de servicios que ofrece el colaborador
                    </p>
                  </div>
                  <div data-oid="w3l9-q9">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="f.-ioaf"
                    >
                      Certificaciones (separadas por comas)
                    </label>
                    <Input
                      name="certifications"
                      defaultValue={
                        editingCollaborator?.certifications
                          ? editingCollaborator.certifications.join(", ")
                          : ""
                      }
                      placeholder="ISO 9001, Licencia VTC"
                      data-oid="te6m8dn"
                    />

                    <p
                      className="text-xs text-gray-500 mt-1"
                      data-oid="8bqctjl"
                    >
                      Permisos y certificaciones que posee el colaborador
                    </p>
                  </div>
                </div>
              </div>

              {/* Notas adicionales */}
              <div data-oid="ix2yjid">
                <h3
                  className="text-lg font-medium border-b pb-2 mb-4"
                  data-oid="3gxj395"
                >
                  Información adicional
                </h3>
                <div data-oid="zn7v.ur">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    data-oid=".20_ut."
                  >
                    Notas
                  </label>
                  <Textarea
                    name="notes"
                    defaultValue={editingCollaborator?.notes || ""}
                    placeholder="Información adicional sobre el colaborador"
                    rows={4}
                    data-oid="j-kom3h"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div
                className="flex justify-end mt-6 space-x-3"
                data-oid="3z:ql.:"
              >
                <Button
                  type="button"
                  onClick={() => {
                    setShowCollaboratorForm(false);
                    setEditingCollaborator(null);
                  }}
                  variant="outline"
                  data-oid="dcvusr:"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-black hover:bg-gray-800"
                  data-oid="2f5.ezh"
                >
                  {editingCollaborator ? "Actualizar" : "Crear"} Colaborador
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filtros y búsqueda */}
          <Card data-oid="ok-yblo">
            <CardContent className="pt-6" data-oid="rfkp5st">
              <div
                className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4"
                data-oid="za2pj2n"
              >
                <div className="flex-1" data-oid="shvvm4n">
                  <div className="relative" data-oid="ozakw:i">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                      data-oid="khq7ce-"
                    />

                    <input
                      type="text"
                      placeholder="Buscar colaboradores..."
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 pl-10 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      data-oid="5h50xa2"
                    />
                  </div>
                </div>
                <div
                  className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4"
                  data-oid="0m1sx-b"
                >
                  <Select
                    defaultValue="all"
                    value={typeFilter}
                    onValueChange={handleTypeFilterChange}
                    data-oid="6hrzb0t"
                  >
                    <SelectTrigger
                      className="w-full md:w-[150px]"
                      data-oid="9z5_9jq"
                    >
                      <SelectValue
                        placeholder="Tipo de colaborador"
                        data-oid="8:257ub"
                      />
                    </SelectTrigger>
                    <SelectContent data-oid="k-orl4g">
                      <SelectItem value="all" data-oid="sbu39pq">
                        Todos los tipos
                      </SelectItem>
                      <SelectItem value="company" data-oid="2wxu.15">
                        Empresas
                      </SelectItem>
                      <SelectItem value="individual" data-oid="s7puln_">
                        Particulares
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    defaultValue="all"
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                    data-oid=".oddjhh"
                  >
                    <SelectTrigger
                      className="w-full md:w-[150px]"
                      data-oid="wdw7-q9"
                    >
                      <SelectValue placeholder="Estado" data-oid="3891wka" />
                    </SelectTrigger>
                    <SelectContent data-oid="jvvvmzc">
                      <SelectItem value="all" data-oid="k:mz2tj">
                        Todos los estados
                      </SelectItem>
                      <SelectItem value="active" data-oid="8q1-xws">
                        Activos
                      </SelectItem>
                      <SelectItem value="inactive" data-oid="wdz0l9l">
                        Inactivos
                      </SelectItem>
                      <SelectItem value="pending" data-oid="e3.sm.y">
                        Pendientes
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de colaboradores */}
          <Card data-oid="ovjj3_z">
            <CardContent className="p-0" data-oid="qggfw.o">
              <div className="overflow-x-auto" data-oid="oufq7s.">
                <table className="w-full" data-oid="1xtdtxy">
                  <thead data-oid="nd-19z0">
                    <tr className="bg-gray-50 border-b" data-oid="57.oycm">
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        data-oid="9c5y4xc"
                      >
                        Colaborador
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        data-oid="xjqnzg0"
                      >
                        Contacto
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        data-oid="z:-wspn"
                      >
                        Ubicación
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        data-oid="h-ot5vg"
                      >
                        Comisión
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        data-oid="xfpddch"
                      >
                        Estado
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        data-oid=".z_2q3x"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="bg-white divide-y divide-gray-200"
                    data-oid="7t1h587"
                  >
                    {collaborators.map((collaborator) => (
                      <tr
                        key={collaborator.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          handleViewCollaboratorDetails(collaborator)
                        }
                        data-oid="12q8kl0"
                      >
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          data-oid="n4-7cw:"
                        >
                          <div className="flex items-center" data-oid="uf45h-m">
                            <div
                              className="flex-shrink-0 h-10 w-10 relative"
                              data-oid="44wo6db"
                            >
                              <img
                                className="h-10 w-10 rounded-full object-cover border-2 border-gray-100"
                                src={collaborator.logo}
                                alt={collaborator.name}
                                data-oid="67zk1_y"
                              />

                              <div
                                className={`absolute -bottom-1 -right-1 p-1 rounded-full ${
                                  collaborator.type === "company"
                                    ? "bg-gray-200 text-gray-600 border border-blue-200"
                                    : "bg-amber-100 text-amber-600 border border-amber-200"
                                }`}
                                data-oid="z_.4xyd"
                              >
                                {collaborator.type === "company" ? (
                                  <Building
                                    className="h-3.5 w-3.5"
                                    data-oid="w5b5rn2"
                                  />
                                ) : (
                                  <Briefcase
                                    className="h-3.5 w-3.5"
                                    data-oid=".xvpnkk"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="ml-4" data-oid="w6egyga">
                              <div
                                className="text-sm font-medium text-gray-900"
                                data-oid="iiag9pl"
                              >
                                {collaborator.name}
                              </div>
                              <div
                                className="text-xs text-gray-500 mt-1 flex items-center"
                                data-oid="-bakovl"
                              >
                                <span
                                  className={`px-2 py-0.5 rounded-sm text-xs font-medium inline-flex items-center ${
                                    collaborator.type === "company"
                                      ? "bg-gray-100 text-blue-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}
                                  data-oid="cnn1k3g"
                                >
                                  {collaborator.type === "company"
                                    ? "Empresa"
                                    : "Particular"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          data-oid="68z30yy"
                        >
                          <div
                            className="text-sm text-gray-900"
                            data-oid="qncjw8p"
                          >
                            {collaborator.contactName}
                          </div>
                          <div
                            className="text-sm text-gray-500"
                            data-oid="nww4yqy"
                          >
                            {collaborator.contactEmail}
                          </div>
                          <div
                            className="text-sm text-gray-500"
                            data-oid="cad94l0"
                          >
                            {collaborator.contactPhone}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          data-oid="2q-ifo4"
                        >
                          <div
                            className="text-sm text-gray-900"
                            data-oid="a8wy8d2"
                          >
                            {collaborator.city}
                          </div>
                          <div
                            className="text-sm text-gray-500"
                            data-oid="fb.06pr"
                          >
                            {collaborator.country}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          data-oid="s2qoxoj"
                        >
                          <div
                            className="text-sm text-gray-900"
                            data-oid="27b7ln8"
                          >
                            {collaborator.commissionRate}%
                          </div>
                          <div
                            className="text-sm text-gray-500"
                            data-oid="w497344"
                          >
                            {collaborator.paymentTerms}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          data-oid="n5e:v6r"
                        >
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              collaborator.status === "active"
                                ? "bg-gray-200 text-green-800"
                                : collaborator.status === "inactive"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-gray-200 text-yellow-800"
                            }`}
                            data-oid=":_vngqk"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full mr-1.5 mt-0.5 ${
                                collaborator.status === "active"
                                  ? "bg-black"
                                  : collaborator.status === "inactive"
                                    ? "bg-gray-600"
                                    : "bg-yellow-600"
                              }`}
                              data-oid="knffp.h"
                            ></span>
                            {collaborator.status === "active"
                              ? "Activo"
                              : collaborator.status === "inactive"
                                ? "Inactivo"
                                : "Pendiente"}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                          data-oid="4hh.2eq"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) =>
                              handleDeleteCollaborator(e, collaborator.id)
                            }
                            className="text-gray-600 border-gray-200 hover:bg-gray-100"
                            data-oid="h9vupcn"
                          >
                            <Trash2 size={16} data-oid="cl6buqq" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {collaborators.length === 0 && (
                  <div className="py-10 text-center" data-oid="vkulsl2">
                    <p className="text-gray-500" data-oid="foe2s8w">
                      No se encontraron colaboradores
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CollaboratorsSection;
