# The correct AWS SAM build image based on the runtime of the function will be
# passed as build arg. The default allows to do `docker build .` when testing.
ARG IMAGE=public.ecr.aws/sam/build-provided.al2023
FROM $IMAGE

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH \
    RUST_VERSION=1.92.0

# Install Rust
RUN set -eux; \
    arch="$(arch)"; \
    case "${arch##*-}" in \
        x86_64) rustArch='x86_64-unknown-linux-gnu'; rustupSha256='20a06e644b0d9bd2fbdbfd52d42540bdde820ea7df86e92e533c073da0cdd43c' ;; \
        aarch64) rustArch='aarch64-unknown-linux-gnu'; rustupSha256='e3853c5a252fca15252d07cb23a1bdd9377a8c6f3efa01531109281ae47f841c' ;; \
        *) echo >&2 "unsupported architecture: ${arch}"; exit 1 ;; \
    esac; \
    url="https://static.rust-lang.org/rustup/archive/1.28.2/${rustArch}/rustup-init"; \
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
