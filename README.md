En este commit creamos la estructura del proyecto.
Armamos las carpetas y los archivos del backend, del frontend y de la documentacion, pero todos los archivos estan vacios por ahora.
Todavia no hay nada programado, solo esta la organizacion de las carpetas para empezar a trabajar.

En el commit anterior (77f7b3f) hicimos el schema.sql, que es el codigo que crea la base de datos. Primero borra las tablas si ya existen y despues las crea de nuevo.
Las tablas son:
usuarios: guarda los datos de cada usuario, como el nombre, el mail, la contraseña encriptada, la foto, la bio y las preferencias.
biblioteca: guarda las canciones que cada usuario agrega, con el titulo, el artista, el album, la portada, el genero y el año. Tambien guarda si la quiere escuchar, la esta escuchando o ya la escucho, si es favorita y la puntuacion de 1 a 5.
colecciones: guarda las playlists que crea cada usuario, con nombre y descripcion.
coleccion_canciones: une las playlists con las canciones de la biblioteca, para saber que canciones tiene cada playlist.
resenas: guarda la reseña que escribe un usuario sobre una cancion de su biblioteca. Hay una sola reseña por cancion.
actividad: guarda lo que va haciendo cada usuario en la app, por ejemplo agregar una cancion o crear una playlist.
Si se borra un usuario, se borra tambien todo lo suyo.
