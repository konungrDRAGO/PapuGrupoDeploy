export const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
  
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    
    // Calcular diferencia en milisegundos
    const diffMs = hoy - nacimiento;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Si es menor a 1 día (por si acaso)
    if (diffDays < 1) {
      return 'menos de 1 día';
    }
    
    // Calcular años completos
    let anhos = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    // Ajustar si aún no ha pasado el mes de cumpleaños
    if (mesActual < mesNacimiento || 
        (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      anhos--;
    }
    
    // Si tiene al menos 1 año
    if (anhos > 0) {
      // Calcular meses adicionales
      let meses = hoy.getMonth() - nacimiento.getMonth();
      if (hoy.getDate() < nacimiento.getDate()) {
        meses--;
      }
      if (meses < 0) {
        meses += 12;
      }
      
      return `${anhos} ${anhos === 1 ? 'año' : 'años'}${meses > 0 ? ` ${meses} ${meses === 1 ? 'mes' : 'meses'}` : ''}`;
    }
    
    // Si es menor de 1 año, calcular meses y días
    let meses = hoy.getMonth() - nacimiento.getMonth();
    if (hoy.getDate() < nacimiento.getDate()) {
      meses--;
    }
    if (meses < 0) {
      meses += 12;
    }
    
    // Calcular días adicionales
    let dias = hoy.getDate() - nacimiento.getDate();
    if (dias < 0) {
      const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
      dias = ultimoDiaMesAnterior - nacimiento.getDate() + hoy.getDate();
    }
    
    // Si tiene al menos 1 mes
    if (meses > 0) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}${dias > 0 ? ` ${dias} ${dias === 1 ? 'día' : 'días'}` : ''}`;
    }
    
    // Si es menor de 1 mes
    return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  };