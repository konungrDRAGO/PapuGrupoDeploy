import axiosAuth from '../api/axiosAuth'; // Para las peticiones que necesiten token
import axiosPublic from '../api/axiosPublic'; // Para las peticiones que no necesiten token

export const obtenerMascota = async (idMascota) => {
    try {
      const response = await axiosAuth.get(`/api/pet/pet-info/${idMascota}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener la mascota:', error);
      throw error;
    }
};

export const obtenerMascotaQR = async (idMascota) => {
    
    try {
        const response = await axiosPublic.get(`/api/qr/pet/${idMascota}`
        );
        return response.data;
    } catch (error) {
        console.error('Error al obtener la mascota:', error);
        throw error;
    }
}

export const registrarMascotas = async (mascotas) => {
    try {
        const response = await axiosAuth.post(`/api/pet/pet-registration`, mascotas);
        return response.data;
    } catch (error) {
        console.error('Error al guardar mascotas:', error);
        throw error;
    }
}

export const obtenerListadoMascotas = async () => {
    try {
      const response = await axiosAuth.get(`/api/pet/mis-mascotas`);
  
      return response.data.mascotas;
    } catch (error) {
      console.error('Error al obtener el listado de mascotas:', error);
      throw error;
    }
}

export const reportarMascota = async (idMascota, latitud, longitud, nombreReportante, comentario) => {
    try {
        const response = await axiosAuth.post(
            `/api/qr/registrar-ubicacion`,
            {
                idMascota,
                latitud,
                longitud,
                nombreReportante: nombreReportante || "",
                comentario: comentario || ""
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al reportar ubicación de la mascota:', error);
        throw error;
    }
}

export const obtenerUbicacionesMascota = async (idMascota) => {
    try {
        const response = await axiosAuth.get(`/api/pet/pet-location/${idMascota}`);
        console.log('response', response.data);
        if (response.data.length === 0) {
            return response.data;
        }
        return response.data;
    } catch (error) {
        console.error('Error al obtener ubicaciones de la mascota:', error);
        throw error;
    }
}

export const actualizarMascota = async (idMascota, datosMascota) => {
    try {
      // Normalizar todos los campos string para que sean "" en lugar de null/undefined
      const datosNormalizados = {
        nombre: datosMascota.nombre || "",
        especie: datosMascota.especie || "",
        raza: datosMascota.raza || "",
        sexo: datosMascota.sexo || "",
        color: datosMascota.color || "",
        tamano: datosMascota.tamano || "",
        numeroMicrochip: datosMascota.numeroMicrochip || "",
        condicionesMedicas: datosMascota.condicionesMedicas || "",
        nombreVeterinario: datosMascota.nombreVeterinario || "",
        telefonoVeterinario: datosMascota.telefonoVeterinario || "",
        comportamiento: datosMascota.comportamiento || "",
        observaciones: datosMascota.observaciones || "",
        urlFoto: datosMascota.urlFoto || "",
        
        // Campos booleanos
        esterilizado: Boolean(datosMascota.esterilizado),
        vacunasAlDia: Boolean(datosMascota.vacunasAlDia),
        
        // Campos de fecha (convertir a string vacío si son null)
        fechaNacimiento: datosMascota.fechaNacimiento 
          ? new Date(datosMascota.fechaNacimiento).toISOString() 
          : "",
        fechaMicrochip: datosMascota.fechaMicrochip 
          ? new Date(datosMascota.fechaMicrochip).toISOString() 
          : "",
        fechaDesparasitacion: datosMascota.fechaDesparasitacion 
          ? new Date(datosMascota.fechaDesparasitacion).toISOString() 
          : ""
      };
  
      const response = await axiosAuth.put(
        `/api/pet/actualizar-mascota/${idMascota}`, 
        datosNormalizados,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al actualizar la mascota';
      console.error('Error en actualizarMascota:', errorMessage);
      throw new Error(errorMessage);
    }
  };