const TEXTOS_ACTIVIDAD = {
  agregar_cancion: "Agregaste a tu biblioteca",
  quitar_cancion: "Quitaste de tu biblioteca",
  cambiar_estado: "Cambiaste el estado de",
  favorito: "Marcaste como favorita",
  puntuar: "Puntuaste",
  crear_playlist: "Creaste la playlist",
  editar_playlist: "Editaste la playlist",
  borrar_playlist: "Borraste la playlist",
  agregar_a_playlist: "Agregaste a una playlist",
  quitar_de_playlist: "Quitaste de una playlist",
  crear_resena: "Escribiste una reseña de",
  editar_resena: "Editaste la reseña de",
  borrar_resena: "Borraste la reseña de",
  editar_perfil: "Editaste tu perfil",
};

export function textoActividad(tipo) {
  return TEXTOS_ACTIVIDAD[tipo] ?? "Actividad en";
}
