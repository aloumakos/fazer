FROM rust:latest

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libclang-dev

    RUN apt-get update \
      && apt-get install -y ssh \
        build-essential \
        gcc \
        clang \
        cmake \
        rsync \
      && apt-get clean
WORKDIR /build
COPY backend ./
RUN cargo install cargo-watch
RUN cargo build
EXPOSE 8080

CMD ["cargo", "watch", "-x", "run"]
#COPY target/release/backend /backend
#WORKDIR /backend
#RUN ./backend
