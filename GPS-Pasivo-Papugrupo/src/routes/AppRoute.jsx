// AppRoute.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrarUsuario from '../pages/RegistrarUsuario';
import MapaMascota from '../pages/MapaMascota';
import PruebaQR from '../pages/PruebaQR';
import { PrivateRoute } from '../routes/PrivateRoute';
import Landing from '../pages/Landing.jsx';
import RegistrarMascota from '../pages/RegistrarMascota.jsx';
import Layout from '../components/Layout';
import RegistrarUbicacion from '../pages/ReportarMascota.jsx';
import Perfil from '../pages/Perfil.jsx';
export default function AppRoute() {
  return (
    <Router>
      <Routes>
        <Route path="/registro" element={<RegistrarUsuario />} />
        <Route path="/pruebaQR" element={<PruebaQR />} />
        <Route path="/" element={<Landing />} />
        <Route path="/registrar-ubicacion/:uuid" element={<RegistrarUbicacion />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route
            path="/mapa"
            element={
                <MapaMascota />
            }
          />
          <Route
            path="/registro-mascota"
            element={
                <RegistrarMascota />
            }
          />
          <Route
            path="/"
            element={
                <MapaMascota />
            }
          />
          <Route
            path="/perfil"
            element={
                <Perfil />
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}
