// Adaptar el formato del vehículo del frontend al formato que espera la API
const adaptVehicleToApi = (frontendVehicle: any): any => {
  // Si viene de VehicleForm, tiene estructura propia
  if (frontendVehicle.details) {
    return {
      type: frontendVehicle.type,
      category: frontendVehicle.category,
      name: frontendVehicle.name || `${frontendVehicle.details.brand} ${frontendVehicle.details.model}`,
      description: frontendVehicle.description || frontendVehicle.notes || "",
      details: {
        brand: frontendVehicle.details.brand,
        model: frontendVehicle.details.model,
        year: parseInt(frontendVehicle.details.year),
        color: frontendVehicle.details.color,
        features: frontendVehicle.details.features || [],
        armored: frontendVehicle.details.armored || false,
        armor_level: frontendVehicle.details.armor_level || ""
      },
      capacity: {
        passengers: parseInt(frontendVehicle.capacity?.passengers.toString()),
        luggage: parseInt(frontendVehicle.capacity?.luggage.toString())
      },
      pricing: frontendVehicle.pricing,
      location: frontendVehicle.location || { 
        type: "Point", 
        coordinates: [-3.7038, 40.4168] 
      },
      availability_radius: frontendVehicle.availability_radius,
      available: frontendVehicle.available,
      image: frontendVehicle.image,
      licensePlate: frontendVehicle.licensePlate,
      ownerType: frontendVehicle.ownerType,
      ownerName: frontendVehicle.ownerName,
      ownerCountry: frontendVehicle.ownerCountry,
      availabilityType: frontendVehicle.availabilityType,
      availabilityDetails: frontendVehicle.availabilityDetails,
      associatedDrivers: frontendVehicle.associatedDrivers || [],
      insurancePolicyNumber: frontendVehicle.insurancePolicyNumber,
      lastMaintenanceDate: frontendVehicle.lastMaintenanceDate,
      contractEndDate: frontendVehicle.contractEndDate,
      notes: frontendVehicle.notes || frontendVehicle.description
    };
  }
  
  // Si viene de VehicleDetailsView, viene con formato plano
  return {
    type: frontendVehicle.type,
    category: frontendVehicle.category,
    name: `${frontendVehicle.brand} ${frontendVehicle.model}`,
    description: frontendVehicle.notes || "",
    details: {
      brand: frontendVehicle.brand,
      model: frontendVehicle.model,
      year: frontendVehicle.year,
      color: frontendVehicle.color,
      features: frontendVehicle.details?.features || [],
      armored: frontendVehicle.details?.armored || false,
      armor_level: frontendVehicle.details?.armor_level || ""
    },
    capacity: {
      passengers: frontendVehicle.seats,
      luggage: frontendVehicle.luggageCapacity
    },
    pricing: frontendVehicle.pricing,
    location: frontendVehicle.location,
    availability_radius: frontendVehicle.availability_radius,
    available: frontendVehicle.available,
    image: frontendVehicle.image,
    licensePlate: frontendVehicle.licensePlate,
    ownerType: frontendVehicle.ownerType,
    ownerName: frontendVehicle.ownerName,
    ownerCountry: frontendVehicle.ownerCountry,
    availabilityType: frontendVehicle.availabilityType,
    availabilityDetails: frontendVehicle.availabilityDetails,
    associatedDrivers: frontendVehicle.associatedDrivers,
    insurancePolicyNumber: frontendVehicle.insurancePolicyNumber,
    lastMaintenanceDate: frontendVehicle.lastMaintenanceDate,
    contractEndDate: frontendVehicle.contractEndDate,
    notes: frontendVehicle.notes
  };
}; 