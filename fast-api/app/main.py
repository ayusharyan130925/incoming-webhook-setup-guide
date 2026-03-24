from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.config.env import config

app = FastAPI(title="Incoming Webhook Service")
PUBLIC_DIR = Path(__file__).resolve().parents[1] / "public"

app.mount("/public", StaticFiles(directory=PUBLIC_DIR), name="public")
app.include_router(router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    first_error = exc.errors()[0] if exc.errors() else None
    if first_error and first_error.get("loc", [None])[0] == "body":
        message = first_error.get("msg", "Invalid request payload.")
    else:
        message = "Invalid request."

    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "message": message,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    if exc.status_code in {400, 401}:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.detail,
            },
        )

    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": "Internal server error."},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    print("Unhandled server error:", exc)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error.",
        },
    )


if config.webhook_auth_mode == "bearer" and not config.expected_bearer_token:
    raise RuntimeError(
        "Invalid configuration: WEBHOOK_AUTH_MODE=bearer requires WEBHOOK_AUTH_TOKEN."
    )


def run() -> None:
    uvicorn.run("app.main:app", host="0.0.0.0", port=config.port)


if __name__ == "__main__":
    run()
