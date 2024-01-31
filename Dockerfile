# The correct AWS SAM build image based on the runtime of the function will be
# passed as build arg. The default allows to do `docker build .` when testing.
ARG IMAGE=public.ecr.aws/sam/build-provided.al2023
FROM $IMAGE

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH \
    RUST_VERSION=1.75.0

# Install Rust
RUN set -eux; \
    arch="$(arch)"; \
    case "${arch##*-}" in \
        x86_64) rustArch='x86_64-unknown-linux-gnu'; rustupSha256='0b2f6c8f85a3d02fde2efc0ced4657869d73fccfce59defb4e8d29233116e6db' ;; \
        aarch64) rustArch='aarch64-unknown-linux-gnu'; rustupSha256='673e336c81c65e6b16dcdede33f4cc9ed0f08bde1dbe7a935f113605292dc800' ;; \
        *) echo >&2 "unsupported architecture: ${arch}"; exit 1 ;; \
    esac; \
    url="https://static.rust-lang.org/rustup/archive/1.26.0/${rustArch}/rustup-init"; \
    curl "$url" -o "rustup-init"; \
    echo "${rustupSha256} *rustup-init" | sha256sum -c -; \
    chmod +x rustup-init; \
    ./rustup-init -y --no-modify-path --profile minimal --default-toolchain $RUST_VERSION --default-host ${rustArch}; \
    rm rustup-init; \
    chmod -R a+w $RUSTUP_HOME $CARGO_HOME;

# Install Rust tools and targets
RUN set -eux; \
    rustup toolchain install stable; \
    rustup target install x86_64-unknown-linux-gnu aarch64-unknown-linux-gnu;

RUN --mount=type=cache,target=/usr/local/cargo/registry
RUN mkdir /.cache; \
    chmod a+w /.cache;

# Install Zig
RUN set -eux; \
    pip3 install ziglang;

# Install Cargo-Zigbuild
RUN cargo install cargo-zigbuild

# Install Cross
RUN cargo install cross --git https://github.com/cross-rs/cross

RUN chmod -R a+w $RUSTUP_HOME $CARGO_HOME

CMD [ "cargo-zigbuild", "--version" ]
