"""
Prediction logic — takes a validated PredictRequest, assembles the feature
vector in the correct order, and returns a PredictResponse.

Feature ordering is derived from the model's feature_names_in_ attribute when
available, with a hardcoded fallback that matches the original dataset column
order (minus the target column "Class").
"""

from __future__ import annotations

import logging

import numpy as np

from .schemas import PredictRequest, PredictResponse

logger = logging.getLogger(__name__)

# Canonical feature order matching the Messidor dataset (target "Class" excluded)
FEATURE_ORDER = [
    "quality",
    "pre_screening",
    "ma1",
    "ma2",
    "ma3",
    "ma4",
    "ma5",
    "ma6",
    "exudate1",
    "exudate2",
    "exudate3",
    "exudate4",
    "exudate5",
    "exudate6",
    "exudate7",
    "exudate8",
    "macula_opticdisc_distance",
    "opticdisc_diameter",
]


def run_prediction(model, request: PredictRequest) -> PredictResponse:
    """Run inference and return a structured prediction response.

    Args:
        model: The loaded sklearn MLPClassifier instance.
        request: Validated input features from the API.

    Returns:
        PredictResponse containing prediction, confidence, and label.
    """
    # Resolve feature order from model metadata when available.
    # The target column "Class" is excluded if the model was accidentally
    # trained with it included in the DataFrame (common when loading CSVs
    # without dropping the target before fitting).
    if hasattr(model, "feature_names_in_"):
        feature_order = [f for f in model.feature_names_in_ if f != "Class"]
        logger.debug("Using model feature_names_in_ (Class excluded): %s", feature_order)
    else:
        feature_order = FEATURE_ORDER
        logger.debug("Using hardcoded FEATURE_ORDER (model has no feature_names_in_)")

    # Build the feature dict from the request
    request_data = request.model_dump()

    # Assemble the numpy array in the correct column order
    try:
        feature_vector = np.array(
            [[request_data[feat] for feat in feature_order]], dtype=float
        )
    except KeyError as exc:
        raise ValueError(
            f"Feature '{exc.args[0]}' expected by the model is missing from the request. "
            f"Expected features: {feature_order}"
        ) from exc

    # Run inference
    prediction_raw = int(model.predict(feature_vector)[0])
    proba = model.predict_proba(feature_vector)[0]

    # Confidence = probability of the predicted class
    # model.classes_ gives the class array (typically [0, 1])
    class_index = list(model.classes_).index(prediction_raw)
    confidence = float(proba[class_index])

    label = "High Risk" if prediction_raw == 1 else "Low Risk"

    logger.info(
        "Prediction: %s (%s), confidence: %.4f", prediction_raw, label, confidence
    )

    return PredictResponse(
        prediction=prediction_raw,
        confidence=round(confidence, 4),
        label=label,
    )
