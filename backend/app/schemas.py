"""
Pydantic schemas for the /predict endpoint.

Feature ordering follows the original dataset column order (minus the target
column "Class"). Validators enforce sensible numeric ranges based on the
Messidor dataset domain knowledge.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    """18 numeric features expected by the MLPClassifier.

    All values are floats. Ranges are enforced where meaningful to catch
    obvious input errors before reaching the model.
    """

    # ── Image Quality ──────────────────────────────────────────────────────
    quality: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Binary quality assessment result (0 = low quality, 1 = sufficient quality)",
    )
    pre_screening: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Binary pre-screening result for severe retinal abnormality",
    )

    # ── Microaneurysm Detections ───────────────────────────────────────────
    ma1: float = Field(
        ..., ge=0.0, description="MA detections at confidence threshold 1"
    )
    ma2: float = Field(
        ..., ge=0.0, description="MA detections at confidence threshold 2"
    )
    ma3: float = Field(
        ..., ge=0.0, description="MA detections at confidence threshold 3"
    )
    ma4: float = Field(
        ..., ge=0.0, description="MA detections at confidence threshold 4"
    )
    ma5: float = Field(
        ..., ge=0.0, description="MA detections at confidence threshold 5"
    )
    ma6: float = Field(
        ..., ge=0.0, description="MA detections at confidence threshold 6"
    )

    # ── Exudate Detections ─────────────────────────────────────────────────
    exudate1: float = Field(
        ..., ge=0.0, description="Exudate detections at confidence threshold 1"
    )
    exudate2: float = Field(
        ..., ge=0.0, description="Exudate detections at confidence threshold 2"
    )
    exudate3: float = Field(
        ..., ge=0.0, description="Exudate detections at confidence threshold 3"
    )
    exudate4: float = Field(
        ..., ge=0.0, description="Exudate detections at confidence threshold 4"
    )
    exudate5: float = Field(
        ..., ge=0.0, description="Exudate detections at confidence threshold 5"
    )
    exudate6: float = Field(
        ..., ge=0.0, description="Exudate detections at confidence threshold 6"
    )
    exudate7: float = Field(
        ..., ge=0.0, description="Exudate detections at confidence threshold 7"
    )
    exudate8: float = Field(
        ..., ge=0.0, description="Exudate detections at confidence threshold 8"
    )

    # ── Anatomical Measurements ────────────────────────────────────────────
    macula_opticdisc_distance: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Euclidean distance of the macula from the optic disc (normalised)",
    )
    opticdisc_diameter: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Diameter of the optic disc (normalised)",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "quality": 1.0,
                "pre_screening": 1.0,
                "ma1": 22.0,
                "ma2": 22.0,
                "ma3": 22.0,
                "ma4": 22.0,
                "ma5": 19.0,
                "ma6": 18.0,
                "exudate1": 0.0,
                "exudate2": 0.0,
                "exudate3": 0.0,
                "exudate4": 0.0,
                "exudate5": 0.0,
                "exudate6": 0.0,
                "exudate7": 0.0,
                "exudate8": 0.0,
                "macula_opticdisc_distance": 0.6,
                "opticdisc_diameter": 0.1,
            }
        }
    }


class PredictResponse(BaseModel):
    """Prediction result returned to the client."""

    prediction: int = Field(..., description="Predicted class: 0 = Low Risk, 1 = High Risk")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Model confidence for the predicted class"
    )
    label: str = Field(..., description="Human-readable risk label")
