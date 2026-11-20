const MS_POR_MINUTO = 60000;
const MINUTOS_POR_HORA = 60;
const HORAS_POR_DIA = 24;

export function tiempoRelativo(fecha) {
  const minutos = Math.floor((Date.now() - new Date(fecha)) / MS_POR_MINUTO);
  const horas = Math.floor(minutos / MINUTOS_POR_HORA);
  const dias = Math.floor(horas / HORAS_POR_DIA);

  if (minutos < 1) {
    return "Recién";
  }

  if (minutos < MINUTOS_POR_HORA) {
    return `Hace ${minutos} min`;
  }

  if (horas < HORAS_POR_DIA) {
    return horas === 1 ? "Hace 1 hora" : `Hace ${horas} horas`;
  }

  if (dias === 1) {
    return "Ayer";
  }

  return `Hace ${dias} días`;
}
