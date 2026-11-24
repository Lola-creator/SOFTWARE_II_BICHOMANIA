export const claveReact = (elemento) => {
  const propiedad = Object.keys(elemento).find((nombre) => nombre.startsWith("__reactFiber$"));
  return elemento[propiedad].key;
};

export const claveDelContenedor = (elemento) => claveReact(elemento.parentElement);
