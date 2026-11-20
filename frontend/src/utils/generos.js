export const GENEROS_DISPONIBLES = ["Pop", "Indie", "Rock alternativo", "Electrónica", "Hip hop", "Jazz"];

export function separarGeneros(preferencias) {
  return preferencias ? preferencias.split(",") : [];
}
