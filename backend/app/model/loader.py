"""
Model loader — loads the MLPClassifier joblib file exactly once at application
startup via a FastAPI lifespan event and makes it available via get_model().
"""

from __future__ import annotations

import logging
from pathlib import Path

import joblib

logger = logging.getLogger(__name__)

# Resolved path to the model file relative to this loader module
_MODEL_PATH = Path(__file__).parent / "final_mlp_model.joblib"

# Module-level singleton — populated during startup lifespan
_model = None


def load_model() -> None:
    """Load the model from disk into the module-level singleton.

    Called once from the FastAPI lifespan startup handler.
    Raises FileNotFoundError if the model file is missing.
    """
    global _model  # noqa: PLW0603

    if not _MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found at {_MODEL_PATH}. "
            "Ensure final_mlp_model.joblib is placed in backend/app/model/."
        )

    logger.info("Loading MLPClassifier from %s …", _MODEL_PATH)
    _model = joblib.load(_MODEL_PATH)
    logger.info(
        "Model loaded successfully. Classes: %s, Features: %s",
        getattr(_model, "classes_", "unknown"),
        getattr(_model, "feature_names_in_", "unknown"),
    )


def get_model():
    """Return the loaded model singleton.

    Raises RuntimeError if called before load_model() has been invoked
    (i.e. before application startup completes).
    """
    if _model is None:
        raise RuntimeError(
            "Model has not been loaded yet. "
            "Ensure load_model() is called during application startup."
        )
    return _model
