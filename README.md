# Retinopathy Risk Assessment Tool

A full-stack web application for diabetic retinopathy risk screening, combining a **FastAPI** backend serving a pre-trained `sklearn` MLPClassifier with a **React + Vite** frontend.

---

## Project Structure

```
DR/
├── backend/
│   ├── app/
│   │   ├── model/
│   │   │   ├── loader.py          # Model singleton, loaded once at startup
│   │   │   └── final_mlp_model.joblib   ← place your model here
│   │   ├── main.py                # FastAPI app, CORS, /health, /predict
│   │   ├── predict.py             # Inference logic
│   │   └── schemas.py             # Pydantic request/response schemas
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/predict.js         # Fetch wrapper
    │   ├── components/
    │   │   ├── RiskForm.jsx
    │   │   └── ResultCard.jsx
    │   ├── styles/index.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

---

## Prerequisites

- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`
- The trained model file **`final_mlp_model.joblib`** placed at `backend/app/model/`

---

## 1 — Backend Setup

```bash
cd backend

# (Recommended) create a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and edit the env file (optional — defaults work for local dev)
copy .env.example .env

# Start the development server
uvicorn app.main:app --reload --port 8000
```

The API will be running at **http://localhost:8000**.

### Useful endpoints

| Method | Path       | Description                              |
|--------|------------|------------------------------------------|
| `GET`  | `/health`  | Returns `{"status": "ok"}`               |
| `POST` | `/predict` | Accepts 18 features, returns risk result |
| `GET`  | `/docs`    | Interactive Swagger UI                   |

---

## 2 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and edit the env file
copy .env.example .env
# Edit VITE_API_URL if your backend runs on a different address

# Start the dev server
npm run dev
```

The frontend will be available at **http://localhost:5173**.

### Environment variable

| Variable        | Default                    | Description                              |
|-----------------|----------------------------|------------------------------------------|
| `VITE_API_URL`  | `http://localhost:8000`    | Base URL of the FastAPI backend          |

---

## 3 — Model File

Place your pre-trained model at:

```
backend/app/model/final_mlp_model.joblib
```

A **dummy model** is included for local testing. Replace it with your real model before deploying.

The model must be an `sklearn.neural_network.MLPClassifier` with:
- 18 input features (in the order defined in `backend/app/predict.py`)
- Binary output classes `[0, 1]`
- `predict_proba()` support (enabled by default in sklearn)

---

## 4 — Deployment

### Backend — Render / Railway

1. Push the `backend/` directory (or the whole repo) to GitHub.
2. Create a new **Web Service** on Render/Railway pointing to the `backend/` directory.
3. Set the build command: `pip install -r requirements.txt`
4. Set the start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add the environment variable `ALLOWED_ORIGINS` with your frontend's production URL.

### Frontend — Vercel / Netlify

1. Set `VITE_API_URL` to your deployed backend URL (e.g. `https://your-api.onrender.com`).
2. Build command: `npm run build`
3. Publish directory: `dist`

---

## Running Both Locally (Quick Start)

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Then open http://localhost:5173 in your browser.
