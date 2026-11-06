DROP TABLE IF EXISTS actividad CASCADE;
DROP TABLE IF EXISTS resenas CASCADE;
DROP TABLE IF EXISTS coleccion_canciones CASCADE;
DROP TABLE IF EXISTS colecciones CASCADE;
DROP TABLE IF EXISTS biblioteca CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(30)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar        TEXT,
    bio           VARCHAR(300),
    preferencias  TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE biblioteca (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    track_id    BIGINT  NOT NULL,
    titulo      VARCHAR(255) NOT NULL,
    artista     VARCHAR(255) NOT NULL,
    album       VARCHAR(255),
    portada_url TEXT,
    genero      VARCHAR(100),
    anio        INTEGER,
    estado      VARCHAR(20) NOT NULL DEFAULT 'quiero_escuchar'
                CHECK (estado IN ('quiero_escuchar', 'escuchando', 'escuchado')),
    favorito    BOOLEAN NOT NULL DEFAULT FALSE,
    puntuacion  INTEGER CHECK (puntuacion BETWEEN 1 AND 5),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, track_id)
);

CREATE TABLE colecciones (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE coleccion_canciones (
    coleccion_id  INTEGER NOT NULL REFERENCES colecciones(id) ON DELETE CASCADE,
    biblioteca_id INTEGER NOT NULL REFERENCES biblioteca(id)  ON DELETE CASCADE,
    PRIMARY KEY (coleccion_id, biblioteca_id)
);

CREATE TABLE resenas (
    id            SERIAL PRIMARY KEY,
    usuario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    biblioteca_id INTEGER NOT NULL UNIQUE REFERENCES biblioteca(id) ON DELETE CASCADE,
    texto         TEXT NOT NULL CHECK (LENGTH(TRIM(texto)) > 0),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE actividad (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo        VARCHAR(50) NOT NULL,
    referencia  VARCHAR(255),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);