# Diabetic Retinopathy Risk Assessment Tool

A production-ready, full-stack web application for diabetic retinopathy risk screening powered by a pre-trained `sklearn` MLPClassifier. Built with **React + Vite** on the frontend and **FastAPI** on the backend.

🌐 **Live Demo:** [frontend-coral-six-y7di4jddl1.vercel.app](https://frontend-coral-six-y7di4jddl1.vercel.app)
⚙️ **API:** [retinopathy-api-1ze9.onrender.com](https://retinopathy-api-1ze9.onrender.com)
📖 **API Docs:** [retinopathy-api-1ze9.onrender.com/docs](https://retinopathy-api-1ze9.onrender.com/docs)

---

## Overview

This tool accepts 18 numeric retinal image features from the [Messidor dataset](https://www.adcis.net/en/third-party/messidor/) and returns a binary diabetic retinopathy risk prediction (Low Risk / High Risk) along with a model confidence score.

> **Screening aid only.** This tool is intended to assist trained medical professionals and does not constitute a medical diagnosis. Results should not replace examination by a qualified ophthalmologist.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Vanilla CSS |
| Backend | Python 3.11, FastAPI, Uvicorn |
| ML Model | scikit-learn MLPClassifier (joblib) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Features

- **18-feature input form** grouped into 4 clinical sections (Image Quality, Microaneurysm Detections, Exudate Detections, Anatomical Measurements)
- **Automatic backend wake-up** — polls `GET /health` on page load to pre-warm the Render backend before user interaction
- **Real-time status banner** — shows Starting / Ready / Unavailable state with retry logic (12 retries × 6 s)
- **Prediction result card** — displays Low/High Risk label, confidence percentage bar, and plain-language clinical explanation
- **Full form validation** — per-field validation with range checks matching the Messidor dataset domain
- **Responsive design** — works on mobile, tablet, and desktop
- **CORS-secured** — allowed origins configured via environment variable

---

## Project Structure

```
DR/
├── backend/
│   ├── app/
│   │   ├── model/
│   │   │   ├── loader.py                 # Model singleton loaded at startup
│   │   │   └── final_mlp_model.joblib    # Pre-trained MLPClassifier
│   │   ├── main.py                       # FastAPI app, CORS, /health, /predict
│   │   ├── predict.py                    # Inference logic & feature ordering
│   │   └── schemas.py                    # Pydantic request/response schemas
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── predict.js                # Fetch wrapper for /predict
│   │   ├── components/
│   │   │   ├── BackendStatusBanner.jsx   # Wake-up status banner
│   │   │   ├── RiskForm.jsx              # 18-field assessment form
│   │   │   └── ResultCard.jsx            # Prediction result display
│   │   ├── hooks/
│   │   │   └── useBackendHealth.js       # Health polling hook
│   │   ├── styles/
│   │   │   └── index.css                 # Global design system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json                       # SPA rewrite rule
│   └── .env.example
├── render.yaml                           # Render Blueprint config
└── .gitignore
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Readiness check — `{"status":"ok","model_loaded":true}` |
| `POST` | `/predict` | Accepts 18 features, returns risk prediction |
| `GET` | `/docs` | Interactive Swagger UI |
| `GET` | `/redoc` | ReDoc API documentation |

### POST `/predict` — Request Body

```json
{
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
  "opticdisc_diameter": 0.1
}
```

### Response

```json
{
  "prediction": 0,
  "confidence": 0.8731,
  "label": "Low Risk"
}
```

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file (defaults work for local dev)
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux

# Start the dev server
uvicorn app.main:app --reload --port 8000
```

API available at **http://localhost:8000**

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux

# Start the dev server
npm run dev
```

Frontend available at **http://localhost:5173**

### Quick Start (both together)

```bash
# Terminal 1
cd backend && uvicorn app.main:app --reload

# Terminal 2
cd frontend && npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | Comma-separated list of allowed CORS origins |
| `PORT` | `8000` | Server port (Render injects this automatically) |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Base URL of the FastAPI backend — no trailing slash |

---

## Deployment

### Backend → Render

1. **New Web Service** → connect `Md-Arif-hasnat99/Retinopathy_detection`
2. **Root Directory:** `backend`
3. **Language:** Python or Docker (Dockerfile is included)
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Health Check Path:** `/health`
7. **Environment Variables:**
   - `ALLOWED_ORIGINS` = `https://your-project.vercel.app`

> **Note:** Render free tier spins down after 15 minutes of inactivity. The frontend automatically wakes it up on first visit via the `/health` polling hook.

### Frontend → Vercel

1. **New Project** → connect the same repo
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite (auto-detected)
4. **Environment Variables:**
   - `VITE_API_URL` = `https://your-backend.onrender.com`
5. Click **Deploy**

### After Both Are Deployed

Update `ALLOWED_ORIGINS` on Render to include your Vercel URL:
```
http://localhost:5173,https://your-project.vercel.app
```

---

## Model

The MLPClassifier is trained on the [Messidor dataset](https://www.adcis.net/en/third-party/messidor/) for diabetic retinopathy grading. It is loaded once at application startup via a FastAPI lifespan event and served exclusively through the `/predict` API endpoint.

**Model file location:** `backend/app/model/final_mlp_model.joblib`

The model is never exposed directly — only the JSON prediction result is returned to the client.

---

## Authors

| Name | GitHub |
|---|---|
| Md Arif Hasnat | [@Md-Arif-hasnat99](https://github.com/Md-Arif-hasnat99) |
| Sujit Kumar Sarkar | [@sujitKrS04](https://github.com/sujitKrS04) |

---

## License

This project is licensed under the **Apache License 2.0**.

```
Copyright 2026 Md Arif Hasnat, Sujit Kumar Sarkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

See the full [LICENSE](LICENSE) file for details.
