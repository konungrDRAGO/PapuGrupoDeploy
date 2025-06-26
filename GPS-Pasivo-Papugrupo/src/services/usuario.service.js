import Cookies from 'js-cookie';
import axiosAuth from '../api/axiosAuth'; // Para las peticiones que necesiten token
import axiosPublic from '../api/axiosPublic'; // Para las peticiones que no necesiten token

export const registrarUsuario = async (usuario) => {
    try {
        console.log('usuario', usuario);
        const response = await axiosPublic.post(`/api/auth/user-registration`, usuario);
        return response.data;
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        throw error;
    }
}

export const loginUsuario = async (usuario) => {
    try {
        const response = await axiosPublic.post(`/api/auth/login`, usuario);
        const token = response.data.token;
        console.log('token', token);
        //Cookies.set('token', token, { expires: 1 });
        return response.data;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
}

export const obtenerUsuario = async (email) => {

    try {
        const response = await axiosAuth.get(`/api/user/${email}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        throw error;
    }
}

export const actualizarUsuario = async (usuario) => {

    try {
        const response = await axiosAuth.put(`api/user/${usuario.correo}`, usuario);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
}