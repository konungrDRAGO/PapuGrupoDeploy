export function eliminarLlavesVacias(obj) {
    // Recorre el objeto y elimina propiedades con valores vacíos
    for (const key in obj) {
      if (obj[key] === '' || obj[key] === null || obj[key] === undefined || (Array.isArray(obj[key]) && obj[key].length === 0)) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Si el valor es un objeto, llama a la función recursivamente
        eliminarLlavesVacias(obj[key]);
      }
    }
  }