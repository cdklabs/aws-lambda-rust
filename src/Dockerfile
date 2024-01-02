ARG RUST_VERSION=1.74.0

FROM rust:$RUST_VERSION

# Install Zig
RUN cargo install cargo-zigbuild

# Install Cross
RUN cargo install cross --git https://github.com/cross-rs/cross

# Install Rust targets
RUN rustup target add \
    x86_64-unknown-linux-gnu \
    aarch64-unknown-linux-gnu

CMD [ "cargo-zigbuild", "--version" ]
