CREATE TABLE images (
                        id SERIAL NOT NULL PRIMARY KEY,
                        name TEXT NOT NULL,
                        image BYTEA NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        embedding BYTEA,
                        threshold FLOAT,
                        path TEXT
);