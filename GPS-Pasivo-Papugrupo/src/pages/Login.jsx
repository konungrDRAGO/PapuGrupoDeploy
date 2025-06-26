import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../services/usuario.service';
//import Cookies from 'js-cookie'; 

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validación de correo electrónico
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validar correo en tiempo real
    if (name === 'correo') {
      if (value && !validateEmail(value)) {
        setEmailError('Correo electrónico inválido');
      } else {
        setEmailError('');
      }
    }

    // Limpiar errores al escribir
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos antes de enviar
    if (!formData.correo || !validateEmail(formData.correo)) {
      setEmailError('Ingrese un correo válido');
      return;
    }

    if (!formData.contrasena) {
      setLoginError('Ingrese una contraseña');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginUsuario({
        email: formData.correo,
        contrasena: formData.contrasena
      });
      
      if (response && response.token) {
        //localStorage.setItem('token', response.token);
        
        // Guardar el email también
        localStorage.setItem('userEmail', formData.correo);
        
        login({ email: formData.correo }, response.token); // Pasar el objeto user con email
        

        navigate('/mapa');
      } else {
        setLoginError('Respuesta del servidor inválida');
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setLoginError(
        error.response?.data?.message || 
        'Error al iniciar sesión. Verifique sus credenciales e intente nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handleRegisterRedirect = () => {
    navigate('/registro');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-darkNeutral text-center mb-6">Iniciar Sesión</h1>

      {loginError && (
        <div className="mb-4 p-2 bg-error text-white rounded text-center">
          {loginError}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-darkNeutral mb-2">Correo Electrónico</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              emailError ? 'border-error focus:ring-error' : 'focus:ring-primary'
            }`}
            placeholder="ejemplo@correo.com"
            disabled={isSubmitting}
          />
          {emailError && <p className="text-error text-sm mt-1">{emailError}</p>}
        </div>

        <div>
          <label className="block text-darkNeutral mb-2">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-darkNeutral hover:text-dark"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <span className="text-sm">Ocultar</span>
              ) : (
                <span className="text-sm">Mostrar</span>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full ${
            isSubmitting ? 'bg-gray-400' : 'bg-dark hover:bg-dark'
          } text-white py-2 rounded-lg font-semibold transition duration-200 cursor-pointer`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={handleRegisterRedirect}
          className="text-darkNeutral hover:text-[var(--color-dark)] font-medium cursor-pointer"
        >
          ¿No tienes cuenta? Regístrate aquí
        </button>
      </div>

    </div>
  );
};

export default Login;