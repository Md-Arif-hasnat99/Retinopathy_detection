"""
FastAPI application entry point.

Endpoints:
  GET  /health   — uptime / readiness check
  POST /predict  — run the MLPClassifier and return risk assessment
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model.loader import get_model, load_model
from .predict import run_prediction
from .schemas import PredictRequest, PredictResponse

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the model on startup, release resources on shutdown."""
    logger.info("Starting up — loading MLPClassifier model …")
    load_model()
    logger.info("Model ready. Application is live.")
    yield
    logger.info("Shutting down.")


# ── Application ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Retinopathy Risk Assessment API",
    description=(
        "REST API serving predictions from a pre-trained MLPClassifier "
        "for diabetic retinopathy risk screening."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
# Read allowed origins from env; default to localhost dev URLs
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://localhost:4173",
)
allowed_origins = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

logger.info("CORS allowed origins: %s", allowed_origins)


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"], summary="Health / readiness check")
async def health():
    """Returns 200 OK when the application is up and the model is loaded."""
    return {"status": "ok", "model_loaded": True}


@app.post(
    "/predict",
    response_model=PredictResponse,
    tags=["Inference"],
    summary="Diabetic retinopathy risk prediction",
)
async def predict(request: PredictRequest) -> PredictResponse:
    """Accept 18 numeric retinal features and return a binary risk prediction.

    - **prediction**: 0 = Low Risk, 1 = High Risk
    - **confidence**: model's probability score for the predicted class
    - **label**: human-readable "Low Risk" / "High Risk"
    """
    try:
        model = get_model()
        return run_prediction(model, request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected error during prediction")
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred during inference. Please try again.",
        ) from exc
