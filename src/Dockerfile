ARG RUST_VERSION=1.73.0

FROM rust:$RUST_VERSION

# Install Rust through Rustup
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Zig
RUN cargo install cargo-zigbuild

# Install Rust targets
RUN rustup target add \
    x86_64-unknown-linux-gnu \
    aarch64-unknown-linux-gnu

# create non root user and change allow execute command for non root user
RUN /sbin/useradd -u 1000 user && chmod 711 /

CMD [ "cargo zigbuild" ]
