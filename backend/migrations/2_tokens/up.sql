CREATE TABLE tokens (
                       id SERIAL NOT NULL PRIMARY KEY,
                       token VARCHAR(255) NOT NULL,
                       user_id INTEGER NOT NULL,
                       created_at TIMESTAMP NOT NULL,
                       expires_at TIMESTAMP NOT NULL,
                       FOREIGN KEY (user_id) REFERENCES users(id),
                       UNIQUE (token),
                       CHECK (expires_at > created_at),
                       CHECK (expires_at > now()),
                       CHECK (created_at < now())
);