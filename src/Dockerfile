ARG RUST_VERSION=1.74.0

FROM rust:$RUST_VERSION

# Install Rust tools and targets
RUN set -eux; \
    rustup toolchain install stable; \
    rustup target install x86_64-unknown-linux-gnu aarch64-unknown-linux-gnu;

RUN --mount=type=cache,target=/usr/local/cargo/registry

RUN mkdir /.cache; \
    chmod a+w /.cache;

# Install Zig
ARG ZIG_VERSION=0.10.1
RUN set -eux; \
    dpkgArch="$(dpkg --print-architecture)"; \
    case "${dpkgArch##*-}" in \
    amd64) zigArch='x86_64';; \
    arm64) zigArch='aarch64';; \
    i386) zigArch='i386';; \
    esac; \
    url="https://ziglang.org/download/${ZIG_VERSION}/zig-linux-${zigArch}-${ZIG_VERSION}.tar.xz"; \
    wget "$url"; \
    tar xf "zig-linux-${zigArch}-${ZIG_VERSION}.tar.xz"; \
    mv zig-linux-${zigArch}-${ZIG_VERSION} zig; \
    rm "zig-linux-${zigArch}-${ZIG_VERSION}.tar.xz";

ENV PATH=$PATH:/zig

# Install Cargo-Zigbuild
RUN cargo install cargo-zigbuild

# Install Cross
RUN cargo install cross --git https://github.com/cross-rs/cross

RUN chmod -R a+w $RUSTUP_HOME $CARGO_HOME;

CMD [ "cargo-zigbuild", "--version" ]
