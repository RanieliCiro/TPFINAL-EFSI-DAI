import "dotenv/config";
import bcrypt from "bcryptjs";
import pool from "../src/db.js";

const USUARIO_DEMO = {
  username: "demo",
  email: "demo@soundshelf.com",
  password: "123456",
  bio: "Fan de los vinilos y de las playlists para cada momento.",
};
const RONDAS_HASH = 10;

const CANCIONES = [
  {
    track_id: 1640157165,
    titulo: "golden hour",
    artista: "JVKE",
    album: "this is what ____ feels like (Vol. 1-4)",
    portada_url: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8d/1a/7b/8d1a7b44-316f-7c7f-4380-935673fb697a/5056167175650.jpg/100x100bb.jpg",
    genero: "Pop",
    anio: 2022,
    estado: "escuchando",
    favorito: true,
    puntuacion: 5,
    dias: 0,
  },
  {
    track_id: 1122776156,
    titulo: "Clocks",
    artista: "Coldplay",
    album: "A Rush of Blood to the Head",
    portada_url: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b9/b4/2a/b9b42ad1-1e25-5096-da43-497a247e69a3/190295978051.jpg/100x100bb.jpg",
    genero: "Alternative",
    anio: 2002,
    estado: "escuchado",
    favorito: false,
    puntuacion: 4,
    dias: 1,
  },
  {
    track_id: 1508562516,
    titulo: "Heat Waves",
    artista: "Glass Animals",
    album: "Dreamland",
    portada_url: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/da/8b/77/da8b7731-6f4f-eacf-5e74-8b23389eefa1/20UMGIM03371.rgb.jpg/100x100bb.jpg",
    genero: "Alternative",
    anio: 2020,
    estado: "quiero_escuchar",
    favorito: false,
    puntuacion: null,
    dias: 3,
  },
  {
    track_id: 1538003843,
    titulo: "Levitating",
    artista: "Dua Lipa",
    album: "Future Nostalgia",
    portada_url: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/100x100bb.jpg",
    genero: "Pop",
    anio: 2020,
    estado: "escuchado",
    favorito: true,
    puntuacion: 4,
    dias: 12,
  },
  {
    track_id: 617154366,
    titulo: "Get Lucky",
    artista: "Daft Punk, Pharrell Williams & Nile Rodgers",
    album: "Random Access Memories",
    portada_url: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e8/43/5f/e8435ffa-b6b9-b171-40ab-4ff3959ab661/886443919266.jpg/100x100bb.jpg",
    genero: "Pop",
    anio: 2013,
    estado: "escuchado",
    favorito: false,
    puntuacion: 3,
    dias: 20,
  },
  {
    track_id: 663097965,
    titulo: "Do I Wanna Know?",
    artista: "Arctic Monkeys",
    album: "AM",
    portada_url: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/69/9c/b5/699cb5d6-115c-ff73-9d26-e57ea4350d72/887828031795.png/100x100bb.jpg",
    genero: "Alternative",
    anio: 2013,
    estado: "escuchado",
    favorito: true,
    puntuacion: 5,
    dias: 40,
  },
  {
    track_id: 6781024437,
    titulo: "Bohemian Rhapsody",
    artista: "Queen",
    album: "A Night At The Opera (Deluxe Edition)",
    portada_url: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8b/0a/ea/8b0aea60-6f4a-195b-5958-cdf459c2333b/602527644271.jpg/100x100bb.jpg",
    genero: "Rock",
    anio: 1975,
    estado: "escuchado",
    favorito: true,
    puntuacion: 5,
    dias: 70,
  },
  {
    track_id: 1542842761,
    titulo: "Blinding Lights (Remix)",
    artista: "The Weeknd & ROSALÍA",
    album: "Blinding Lights (Remix) - Single",
    portada_url: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/61/e7/3f/61e73f94-018d-5f50-50ec-8521952bc72e/20UM1IM11629.rgb.jpg/100x100bb.jpg",
    genero: "R&B/Soul",
    anio: 2020,
    estado: "quiero_escuchar",
    favorito: false,
    puntuacion: null,
    dias: 100,
  },
];

const PLAYLISTS = [
  {
    nombre: "Para estudiar",
    descripcion: "Música tranquila para concentrarse.",
    canciones: [1122776156, 1508562516, 1640157165],
    dias: 2,
  },
  {
    nombre: "Viajes",
    descripcion: "Para cantar en la ruta.",
    canciones: [617154366, 1538003843],
    dias: 15,
  },
  {
    nombre: "Domingos",
    descripcion: null,
    canciones: [6781024437, 663097965, 1542842761],
    dias: 45,
  },
];

const RESENA = {
  track_id: 6781024437,
  texto: "Un clásico que no pasa de moda. Cada parte suena como una canción distinta.",
  dias: 65,
};

async function registrarActividad(usuarioId, tipo, referencia, dias) {
  await pool.query(
    `INSERT INTO actividad (usuario_id, tipo, referencia, created_at)
     VALUES ($1, $2, $3, NOW() - make_interval(days => $4))`,
    [usuarioId, tipo, referencia, dias]
  );
}

async function seed() {
  await pool.query("DELETE FROM usuarios WHERE email = $1", [USUARIO_DEMO.email]);

  const passwordHash = await bcrypt.hash(USUARIO_DEMO.password, RONDAS_HASH);
  const usuario = await pool.query(
    `INSERT INTO usuarios (username, email, password_hash, bio)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [USUARIO_DEMO.username, USUARIO_DEMO.email, passwordHash, USUARIO_DEMO.bio]
  );
  const usuarioId = usuario.rows[0].id;

  const idsBiblioteca = {};

  for (const cancion of CANCIONES) {
    const resultado = await pool.query(
      `INSERT INTO biblioteca (usuario_id, track_id, titulo, artista, album, portada_url, genero, anio,
                               estado, favorito, puntuacion, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() - make_interval(days => $12))
       RETURNING id`,
      [
        usuarioId,
        cancion.track_id,
        cancion.titulo,
        cancion.artista,
        cancion.album,
        cancion.portada_url,
        cancion.genero,
        cancion.anio,
        cancion.estado,
        cancion.favorito,
        cancion.puntuacion,
        cancion.dias,
      ]
    );
    idsBiblioteca[cancion.track_id] = resultado.rows[0].id;

    await registrarActividad(usuarioId, "agregar_cancion", cancion.titulo, cancion.dias);

    if (cancion.puntuacion) {
      await registrarActividad(
        usuarioId,
        "puntuar",
        cancion.titulo,
        cancion.dias
      );
    }
  }

  for (const playlist of PLAYLISTS) {
    const resultado = await pool.query(
      `INSERT INTO colecciones (usuario_id, nombre, descripcion, created_at)
       VALUES ($1, $2, $3, NOW() - make_interval(days => $4))
       RETURNING id`,
      [usuarioId, playlist.nombre, playlist.descripcion, playlist.dias]
    );
    const coleccionId = resultado.rows[0].id;

    for (const trackId of playlist.canciones) {
      await pool.query("INSERT INTO coleccion_canciones (coleccion_id, biblioteca_id) VALUES ($1, $2)", [
        coleccionId,
        idsBiblioteca[trackId],
      ]);
    }

    await registrarActividad(usuarioId, "crear_playlist", playlist.nombre, playlist.dias);
  }

  const cancionResenada = CANCIONES.find((cancion) => cancion.track_id === RESENA.track_id);

  await pool.query(
    `INSERT INTO resenas (usuario_id, biblioteca_id, texto, created_at, updated_at)
     VALUES ($1, $2, $3, NOW() - make_interval(days => $4), NOW() - make_interval(days => $4))`,
    [usuarioId, idsBiblioteca[RESENA.track_id], RESENA.texto, RESENA.dias]
  );
  await registrarActividad(usuarioId, "crear_resena", cancionResenada.titulo, RESENA.dias);

  console.log(`Seed listo. Usuario: ${USUARIO_DEMO.email} / ${USUARIO_DEMO.password}`);
}

try {
  await seed();
} catch (error) {
  console.error("Error al cargar el seed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
