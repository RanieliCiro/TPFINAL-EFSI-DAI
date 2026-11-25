- 1. Información general

Nombre del proyecto: SoundShelf

Descripción breve de la aplicación: biblioteca musical personal. Cada usuario busca canciones en iTunes, las guarda en su biblioteca, les cambia el estado (quiero escuchar, escuchando, escuchado), las marca como favoritas, las puntúa de 1 a 5, les escribe reseñas, las organiza en playlists y ve estadísticas de su colección. Lema: «Tu música. Tu colección. Tu historia». No reproduce audio, no tiene funciones sociales ni usa IA.

Objetivo principal: cumplir la consigna MY COLLECTION de EFSI & DAI 2026 con una aplicación full stack (React + Express + PostgreSQL) que consume una API externa, con autenticación propia y datos separados por usuario.

Temática elegida: Música

- 2. Integrantes y responsabilidades

Al principio cada uno tomó una parte; después fuimos mezclando y corrigiendo cosas de los demás. Esto es a grandes rasgos lo que hizo cada uno.

Integrante 1: Ciro Ranieli (rama Ranieli)
Responsabilidades: base de datos (schema.sql) y estructura inicial del proyecto; maquetado de login y registro según el Figma; Home (canciones recientes, actividad, contadores, playlists y destacados de iTunes) con su barra lateral, logo y discos; endpoint de estadísticas en el backend; depuración general antes de la entrega.

Integrante 2: Ignacio "Nacho" Eskenazi (rama Eskenazi)
Responsabilidades: autenticación completa en back y front (registro, login, /auth/me, JWT, middleware de auth, contraseñas con bcrypt), configuración de Axios con interceptores, AuthContext y ProtectedRoute; pantalla 404; integración de PRs a dev.

Integrante 3: Fede Ajami (rama Ajami)
Responsabilidades: biblioteca musical (backend y pantalla: estados, favoritos, puntuación con estrellas, filtros y búsqueda); perfil y modal para editar perfil (avatar, bio y géneros favoritos); pantalla de estadísticas.

Integrante 4: Lucas Dorin (rama Dorin)
Responsabilidades: pantallas de estado reutilizables (carga, error y vacío), aviso de sesión vencida y página 404; navegación mobile con barra inferior; retoques visuales (modal de nueva playlist, chips de géneros en Explorar, saludo en Home y contador en Biblioteca).

Integrante 5: Lior Tanel (rama Tanel)
Responsabilidades: Explorar (búsqueda en iTunes con filtro por género y orden); detalle de canción con guardar, puntuar y reseñar; reseñas en el backend; playlists completas (backend, listado y detalle); datos del seed alineados con el backend.

- 3. Arquitectura del proyecto

Frontend:
Tecnologías utilizadas: React 19, Vite 8, React Router 7, Axios y CSS propio con variables (estética de vinilo: marrón oscuro con acento naranja). Los gráficos de estadísticas son barras hechas con CSS.
Organización general: carpeta /frontend/src con:
  - context/AuthContext.jsx: usuario activo, login, registro y logout.
  - services/: api.js (instancia de Axios con interceptores de token y de 401) y un servicio por recurso (auth, music, library, collections, reviews, profile, activity, stats).
  - components/: piezas reutilizables (Navbar, ProtectedRoute, SongCard, StarRating, Loader, ErrorMessage, EmptyState, Avatar, Disco, Logo, AuthLayout, EditProfileModal).
  - pages/: Login, Register, Home, Explore, SongDetail, Library, Playlists, PlaylistDetail, Profile, Stats y NotFound.
  - utils/: funciones chicas compartidas (textos de actividad, géneros, tiempo relativo).
  Cada componente y página tiene su .css al lado y la paleta está en variables de index.css.

Backend:
Tecnologías utilizadas: Node.js, Express 5, pg (sin ORM), bcryptjs, jsonwebtoken, cors y dotenv.
Organización general: carpeta /backend con:
  - src/index.js: arma el servidor, configura CORS y JSON y monta las rutas bajo /api.
  - src/db.js: pool de conexiones a PostgreSQL.
  - src/middlewares/auth.js: verifica el JWT de cada pedido privado.
  - src/routes/ y src/controllers/: un archivo por recurso (auth, music, library, collections, reviews, profile, activity, stats). Cada controller tiene su try/catch y devuelve el código HTTP que corresponde.
  - src/utils/: actividad.js (registra cada acción del usuario) y parsearId.js (valida ids).
  - db/schema.sql (crea las tablas) y db/seed.js (carga la cuenta demo).

Base de datos:
Motor utilizado: PostgreSQL 16 (administrado con pgAdmin).
Cómo se conecta con el backend: con la librería pg, a través de un Pool que toma la dirección de la variable DATABASE_URL. Todas las consultas son parametrizadas ($1, $2...) y filtran por el usuario_id que viene en el token.

Comunicación entre frontend, backend y API externa: el frontend solo habla con el backend, mediante Axios y en JSON, mandando el token en el header Authorization: Bearer. El backend es el único que consulta la API de iTunes (con fetch), la transforma a un formato propio y se la devuelve al frontend. Para guardar una canción, el frontend manda el track_id con los datos que ya tiene y el backend no vuelve a consultar iTunes.

- 4. Instalación local

Requisitos previos para instalar el proyecto: Node.js 22 o superior (probado con Node 24), npm, PostgreSQL 16 con pgAdmin y Git.

Cómo clonar el repositorio:
  git clone https://github.com/RanieliCiro/TPFINAL-EFSI-DAI.git
  Después abrir la carpeta TPFINAL-EFSI-DAI en VS Code.

Cómo instalar las dependencias del frontend:
  cd frontend
  npm install

Cómo instalar las dependencias del backend:
  cd backend
  npm install

Cómo configurar la base de datos:
  1. Abrir pgAdmin y conectarse al servidor PostgreSQL 16.
  2. Clic derecho en Databases > Create > Database, con el nombre schema.
  3. Revisar que la contraseña de PostgreSQL coincida con la de DATABASE_URL en backend/.env (por defecto, root).
  4. Dentro de /backend, correr npm run seed. Crea las tablas y carga la cuenta demo, así que no hace falta correr SQL a mano.

Pasos adicionales para dejar el proyecto funcionando:
  1. Levantar el backend en una terminal: cd backend y npm run dev. Tiene que aparecer "Servidor escuchando en el puerto 3000".
  2. Levantar el frontend en otra terminal: cd frontend y npm run dev.
  3. Abrir http://localhost:5173 y entrar con la cuenta demo (las credenciales están en DEMO_EMAIL y DEMO_PASSWORD de backend/.env).

- 5. Variables de entorno

Variables necesarias para el frontend (frontend/.env):
  - VITE_API_URL: dirección base de la API del backend (http://localhost:3000/api).

Variables necesarias para el backend (backend/.env):
  - PORT
  - DATABASE_URL
  - JWT_SECRET
  - FRONTEND_URL
  - DEMO_EMAIL
  - DEMO_PASSWORD

Dirección de conexión a PostgreSQL: DATABASE_URL, con el formato postgresql://usuario:contraseña@localhost:5432/nombre_de_la_base.

Puerto del servidor: PORT (3000).

Otras variables necesarias:
  - JWT_SECRET: clave con la que se firman y verifican los tokens.
  - FRONTEND_URL: origen permitido por CORS (http://localhost:5173).
  - DEMO_EMAIL y DEMO_PASSWORD: datos de la cuenta demo que crea el seed.

Aclaración sobre la configuración y protección de datos sensibles: los valores nunca se escriben en el código, siempre se leen de las variables de entorno con dotenv, y las contraseñas de los usuarios se guardan hasheadas. Como el proyecto solo se ejecuta en local, en una computadora del colegio, decidimos incluir los archivos .env en el repositorio para que funcione apenas se clona. Los .env.example muestran qué variables hacen falta. En un entorno real, los .env quedarían fuera del repositorio (están en .gitignore) y JWT_SECRET sería una clave distinta y privada.

- 6. Comandos para ejecutar el proyecto

Comando para iniciar el frontend: dentro de /frontend, npm run dev.

Comando para iniciar el backend: dentro de /backend, npm run dev (se reinicia solo al guardar cambios) o npm start.

Comando para ejecutar migraciones o scripts SQL: dentro de /backend, npm run seed. Ejecuta db/schema.sql, que borra y vuelve a crear las tablas, y carga la cuenta demo. Ojo: borra todos los datos que hubiera.

Otros comandos necesarios: dentro de /frontend, npm run build compila la versión de producción y npm run preview la sirve para revisarla.

- 7. API externa

Nombre de la API utilizada: iTunes Search API (Apple).

Enlace a su documentación: https://performance-partners.apple.com/search-api

Qué información proporciona: canciones con id (trackId), título, artista, álbum, portada, género, fecha de lanzamiento y duración. No trae una descripción de las canciones, por eso la app la muestra solo si existe.

Cómo se utiliza dentro de la aplicación: el backend expone GET /api/music/search, que llama a https://itunes.apple.com/search, y GET /api/music/:id, que llama a https://itunes.apple.com/lookup. Los resultados se transforman a un formato propio (track_id, titulo, artista, album, portada_url, genero, anio, duracion_ms) y la portada se pide en 300x300 para que no se vea pixelada. El frontend nunca llama a iTunes directamente.

Qué funcionalidades dependen de ella:
  - La búsqueda de Explorar, con su filtro por género y su orden.
  - Los destacados de Home, buscados según el género favorito del usuario.
  - El detalle de canción.
  - Los datos con los que se guarda una canción en la biblioteca.

- 8. Endpoints del backend

Todos van bajo /api y, salvo register y login, requieren el header Authorization: Bearer <token>. Sin token, o con un token inválido o vencido, responden 401. Los errores se devuelven como { "error": "mensaje" }. Entre paréntesis figura dónde se usa cada uno: pantalla de React y servicio.

Autenticación:
Método: POST
Ruta: /api/auth/register
Funcionalidad: crea un usuario con username, email, password y confirmPassword. Devuelve el token y el usuario (201); 400 si faltan datos o no son válidos; 409 si el usuario o el email ya existen. (Register / services/auth.js)
Método: POST
Ruta: /api/auth/login
Funcionalidad: inicia sesión con email y password. Devuelve el token y el usuario; 401 si los datos son incorrectos. (Login / services/auth.js)
Método: GET
Ruta: /api/auth/me
Funcionalidad: devuelve el usuario del token. Se usa al abrir la app para recuperar la sesión. (AuthContext / services/auth.js)

Perfil:
Método: GET
Ruta: /api/profile
Funcionalidad: devuelve los datos del usuario, sus favoritos y su actividad reciente. (Profile / services/profile.js)
Método: PUT
Ruta: /api/profile
Funcionalidad: edita username, bio, preferencias (géneros) y avatar (JPG o PNG de hasta 2 MB). 400 si un dato no es válido; 409 si el nombre ya está en uso. (EditProfileModal en Profile / services/profile.js)

Biblioteca:
Método: GET
Ruta: /api/library
Funcionalidad: lista las canciones guardadas del usuario con su reseña. (Home, Library y PlaylistDetail / services/library.js)
Método: POST
Ruta: /api/library
Funcionalidad: guarda una canción con track_id y sus datos (titulo, artista, album, portada_url, genero, anio). 201 si se guardó; 409 si ya estaba. (SongDetail / services/library.js)
Método: PATCH
Ruta: /api/library/:id
Funcionalidad: cambia el estado, el favorito o la puntuación. 404 si la canción no es del usuario. (Library y SongDetail / services/library.js)
Método: DELETE
Ruta: /api/library/:id
Funcionalidad: quita la canción. Por la cascada se borran también su reseña y sus lugares en playlists. (Library y SongDetail / services/library.js)
Método: GET
Ruta: /api/music/search?term=texto
Funcionalidad: busca canciones en iTunes. (Explore y Home / services/music.js)
Método: GET
Ruta: /api/music/:id
Funcionalidad: detalle de una canción de iTunes, más lo que el usuario tiene guardado de ella (si está en su biblioteca, su reseña y sus playlists). (SongDetail / services/music.js)

Favoritos:
Método: PATCH
Ruta: /api/library/:id
Funcionalidad: con { "favorito": true } o { "favorito": false } marca o desmarca la canción. Las favoritas se ven en el filtro Favoritos de Biblioteca, en Perfil y en Estadísticas. (Library y SongDetail / services/library.js)

Colecciones:
Método: GET
Ruta: /api/collections
Funcionalidad: lista las playlists del usuario con la cantidad de canciones de cada una. (Home, Playlists y SongDetail / services/collections.js)
Método: POST
Ruta: /api/collections
Funcionalidad: crea una playlist con nombre y descripción opcional. (Playlists / services/collections.js)
Método: GET
Ruta: /api/collections/:id
Funcionalidad: devuelve una playlist con sus canciones. (PlaylistDetail / services/collections.js)
Método: PATCH
Ruta: /api/collections/:id
Funcionalidad: edita el nombre o la descripción. (PlaylistDetail / services/collections.js)
Método: DELETE
Ruta: /api/collections/:id
Funcionalidad: borra la playlist. Las canciones siguen en la biblioteca. (PlaylistDetail / services/collections.js)
Método: POST
Ruta: /api/collections/:id/items
Funcionalidad: agrega una canción de la biblioteca a la playlist, con { "biblioteca_id": n }. 409 si ya estaba. (PlaylistDetail y SongDetail / services/collections.js)
Método: DELETE
Ruta: /api/collections/:id/items/:itemId
Funcionalidad: quita la canción de la playlist. (PlaylistDetail y SongDetail / services/collections.js)

Puntuaciones y reseñas:
Método: PATCH
Ruta: /api/library/:id
Funcionalidad: con { "puntuacion": 1 a 5 } puntúa la canción, y con null borra la puntuación. (Library y SongDetail / services/library.js)
Método: GET
Ruta: /api/reviews
Funcionalidad: lista las reseñas del usuario con los datos de cada canción. Está disponible en services/reviews.js, pero hoy ninguna pantalla lo usa.
Método: POST
Ruta: /api/reviews
Funcionalidad: crea una reseña con { "biblioteca_id": n, "texto": "..." }. La canción tiene que ser del usuario; 409 si ya tiene reseña. (SongDetail / services/reviews.js)
Método: PATCH
Ruta: /api/reviews/:id
Funcionalidad: edita el texto de la reseña. (SongDetail / services/reviews.js)
Método: DELETE
Ruta: /api/reviews/:id
Funcionalidad: borra la reseña. (SongDetail / services/reviews.js)

Actividad y estadísticas:
Método: GET
Ruta: /api/activity
Funcionalidad: últimas 20 acciones del usuario (tipo, referencia y fecha). (Home / services/activity.js)
Método: GET
Ruta: /api/stats
Funcionalidad: estadísticas calculadas con SQL en cada pedido: total guardadas, favoritas, escuchadas, promedio de puntuación, playlists, distribución por género, top 5 artistas, mejor puntuadas y actividad por mes. (Home y Stats / services/stats.js)

- 9. Modelo de datos

Nombre de la base de datos: schema (es la base local; si se usa otro nombre, hay que cambiarlo en DATABASE_URL).

Tablas utilizadas: usuarios, biblioteca, colecciones, coleccion_canciones, resenas y actividad.

Descripción de cada tabla:
  - usuarios: id, username y email únicos, password_hash, avatar, bio, preferencias (géneros separados por coma) y created_at.
  - biblioteca: canciones guardadas por cada usuario. Tiene track_id de iTunes, titulo, artista, album, portada_url, genero, anio, estado (quiero_escuchar, escuchando o escuchado), favorito, puntuacion (1 a 5 o vacía) y created_at.
  - colecciones: playlists de cada usuario, con nombre, descripcion y created_at.
  - coleccion_canciones: une cada playlist con las canciones de la biblioteca que tiene.
  - resenas: una reseña por canción guardada, con texto (no puede estar vacío), created_at y updated_at.
  - actividad: registro de lo que hace cada usuario, con tipo (agregar_cancion, quitar_cancion, cambiar_estado, favorito, puntuar, crear_playlist, editar_playlist, borrar_playlist, agregar_a_playlist, quitar_de_playlist, crear_resena, editar_resena, borrar_resena o editar_perfil), referencia (texto legible: título de la canción o nombre de la playlist) y created_at.

Relaciones entre las tablas:
  - Un usuario tiene muchas canciones en biblioteca, muchas playlists, muchas reseñas y muchas filas de actividad.
  - Una playlist tiene muchas canciones y una canción puede estar en muchas playlists. Es una relación muchos a muchos, resuelta con coleccion_canciones.
  - Cada canción de la biblioteca tiene como máximo una reseña.
  - Todas las claves foráneas tienen ON DELETE CASCADE: si se borra un usuario se borra todo lo suyo; si se quita una canción se borran su reseña y sus lugares en playlists; si se borra una playlist se borran sus filas en coleccion_canciones.

Claves primarias y foráneas:
  - usuarios: PK id.
  - biblioteca: PK id; FK usuario_id → usuarios; UNIQUE(usuario_id, track_id) para no guardar dos veces la misma canción.
  - colecciones: PK id; FK usuario_id → usuarios.
  - coleccion_canciones: PK compuesta (coleccion_id, biblioteca_id); FK coleccion_id → colecciones y FK biblioteca_id → biblioteca.
  - resenas: PK id; FK usuario_id → usuarios; FK biblioteca_id → biblioteca, con UNIQUE.
  - actividad: PK id; FK usuario_id → usuarios.

Scripts SQL o migraciones para crear la estructura: backend/db/schema.sql. Primero borra las tablas si existen y después las crea con sus restricciones (CHECK de estado, puntuación entre 1 y 5 y texto de reseña no vacío).

Forma de cargar los datos de demostración: npm run seed dentro de /backend. Ejecuta schema.sql y crea la cuenta demo con avatar, bio y preferencias, 11 canciones en los tres estados, 6 favoritas, 7 puntuadas, 3 reseñas, 3 playlists con canciones y actividad repartida en distintas fechas. La contraseña se guarda hasheada con bcryptjs.

- 10. Estrategia de autenticación

Cómo funciona el registro: el usuario completa username, email, contraseña y confirmación. Se valida en el frontend y otra vez en el backend: username de 3 a 30 caracteres, email válido, contraseña de al menos 6 caracteres e igual a la confirmación. Si el username o el email ya existen, responde 409. Si todo está bien, crea el usuario y devuelve el token, así queda con la sesión iniciada.

Cómo funciona el inicio de sesión: el backend busca el usuario por email y compara la contraseña con bcrypt.compare. Si coincide, devuelve el token y los datos del usuario, nunca el password_hash. Si no coincide, responde 401 con "Email o contraseña incorrectos", sin decir cuál de los dos falló.

Cómo se almacenan las contraseñas: hasheadas con bcryptjs, con 10 rondas de sal. La contraseña original no se guarda en ningún lado.

Cómo se generan y validan los JWT: se generan con jsonwebtoken (jwt.sign), con el id del usuario y firmados con JWT_SECRET. El middleware verificarToken lee el header Authorization: Bearer <token> y lo valida con jwt.verify, que controla la firma y la fecha de vencimiento. Si es válido, guarda el id en req.usuario y todas las consultas filtran por ese id.

Duración del token: 7 días.

Cómo se protegen las rutas privadas:
  - En el backend, todas las rutas salvo register y login pasan por el middleware de auth. Además, cada consulta filtra por el usuario_id del token, así que un usuario no puede ver ni modificar datos de otro (recibe 404).
  - En el frontend, el componente ProtectedRoute redirige a /login si no hay usuario activo.

Cómo funciona el cierre de sesión: logout borra el token de localStorage y vacía el usuario del AuthContext, así que las rutas privadas quedan bloqueadas. Si el backend responde 401 porque el token venció, el interceptor de api.js hace lo mismo y lleva a /login con el aviso "sesión vencida".

Cómo se mantiene la sesión al recargar la página: el token se guarda en localStorage. Al abrir la app, AuthContext lo encuentra y llama a GET /api/auth/me para recuperar el usuario. Si el token ya no sirve, lo borra.
Por qué localStorage: es la opción más simple para una app que solo se usa en el navegador, permite que la sesión sobreviva al recargar o cerrar la pestaña y se manda fácil en cada pedido con el interceptor de Axios. Para limitar el riesgo, el token vence a los 7 días y en localStorage se guarda solo el token: los datos del usuario (biblioteca, favoritos, reseñas y playlists) siempre se piden al servidor.

- 11. Despliegue

Enlace público al frontend: no aplica. El deploy no es obligatorio (lo confirmó el profe) y el proyecto se ejecuta en local.
Enlace al backend: no aplica (local, en http://localhost:3000/api).
Servicio utilizado para desplegar el frontend: ninguno; se usa el servidor de desarrollo de Vite.
Servicio utilizado para desplegar el backend: ninguno; se ejecuta con Node.js en local.
Servicio utilizado para alojar PostgreSQL: ninguno; PostgreSQL 16 instalado en la computadora.
Configuración de producción: no aplica. Para compilar el frontend existe npm run build.

- 12. Organización y seguimiento del trabajo

Enlace al repositorio de GitHub: https://github.com/RanieliCiro/TPFINAL-EFSI-DAI

Enlace al tablero de Trello: [COMPLETAR]

Organización de las ramas:
  - main: versión final.
  - dev: rama de integración.
  - Una rama por integrante: Ranieli (Ciro), Eskenazi (Nacho), Ajami (Fede), Dorin (Lucas) y Tanel (Lior).

Metodología de trabajo con Pull Requests: cada integrante trabaja en su rama y, antes de empezar, trae lo último de dev (git pull origin dev). Cuando termina una tarea abre un Pull Request de su rama a dev, con una descripción breve de los cambios, y se mergea desde GitHub. Nunca se mergea a dev de forma local. Si hay conflictos, se resuelven en la rama del integrante antes del PR. Al final, dev se pasa a main.

Distribución de tareas entre integrantes: cada tarea es una tarjeta en Trello con su responsable y sus fechas, y pasa por las columnas Pendiente, En desarrollo, En revisión y Finalizada. El reparto general está en la sección 2.
