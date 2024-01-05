// src/main.rs

use lambda_http::{run, service_fn, Body, Error, Request, RequestExt, Response};
use lambda_http::http::StatusCode;

async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    let resp = Response::builder()
            .status(StatusCode::OK)
            .body("OK2".into())
            .map_err(Box::new)?;

    Ok(resp)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .without_time()
        .init();
    run(service_fn(function_handler)).await
}
