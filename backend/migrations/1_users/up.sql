CREATE TABLE users (
                       id SERIAL NOT NULL PRIMARY KEY,
                       first_name TEXT NOT NULL,
                       last_name TEXT NOT NULL,
                       email TEXT NOT NULL,
                       password TEXT NOT NULL,
                       username TEXT NOT NULL,
                       enabled BOOLEAN NOT NULL DEFAULT FALSE,
                       failed_attempts INT NOT NULL DEFAULT 0,
                       locked BOOLEAN NOT NULL DEFAULT FALSE,
                       locked_date TIMESTAMP,
                       authority TEXT NOT NULL DEFAULT 'ROLE_USER'
);