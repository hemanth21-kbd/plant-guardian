# Plant Guardian - Architecture Documentation

## 1. Project Overview

**Project Name:** Plant Guardian  
**Type:** Full-stack Web/Mobile Application (Plant Disease Detection System)  
**Core Functionality:** AI-powered plant disease detection, user garden management, community features, and marketplace  
**Deployment:** Cloud-hosted backend (Render), Frontend built with Next.js + Capacitor for mobile

---

## 2. Technology Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | FastAPI (Python) |
| Database | SQLite (via SQLAlchemy ORM) |
| ML/AI | Google Gemini API, Hugging Face BLIP |
| Server | Uvicorn |
| Deployment | Render (cloud) |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (React 19) |
| UI | Tailwind CSS 4 |
| Mobile | Capacitor 8 (Android) |
| State | React hooks (useState, useEffect) |
| HTTP Client | Axios |
| Icons | Custom SVG + Lucide |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Home    │ │  Camera  │ │  Garden  │ │Community │ │  Market  │ │
│  │  Tab     │ │  Feed    │ │  Mgmt    │ │   Tab    │ │   Tab    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   DashboardUI (Shell)                        │  │
│  │  - Weather Widget (Open-Meteo API)                            │  │
│  │  - Navigation Bar                                             │  │
│  │  - Language Selector                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS (Render)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    API Endpoints                              │   │
│  │  - /predict        (Disease Detection)                        │   │
│  │  - /ask-google     (AI Chat Assistant)                       │   │
│  │  - /auth/*         (User Authentication)                      │   │
│  │  - /my-garden/*   (Garden Management)                        │   │
│  │  - /upload         (Image Upload)                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │
│  │ gemini_client   │  │   ml_engine    │  │   database.py       │   │
│  │ (AI Analysis)   │  │ (Keras Model)  │  │ (SQLAlchemy)        │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE (SQLite)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Plants  │ │ Diseases │ │Treatments│ │   Users   │ │UserPlants│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Component Details

### 4.1 Backend Components

#### `backend/main.py` (268 lines)
- FastAPI app initialization
- CORS middleware configuration
- **Endpoints:**
  - `GET /` - Health check
  - `POST /predict` - Plant disease prediction
  - `POST /ask-google` - AI chat streaming
  - `POST /auth/register` - User registration
  - `POST /auth/login` - User login
  - `POST /auth/request-otp` - OTP generation
  - `POST /auth/verify-otp` - OTP verification
  - `POST /my-garden/add` - Add plant to garden
  - `GET /my-garden/{user_id}` - Get user's garden
  - `DELETE /my-garden/{plant_id}` - Delete plant
  - `POST /my-garden/logs/add` - Add garden log
  - `GET /my-garden/logs/{plant_id}` - Get plant logs
  - `POST /upload` - Image upload

#### `backend/models.py` (64 lines)
- SQLAlchemy ORM models:
  - `Plant` - Base plant species
  - `Disease` - Disease information
  - `Treatment` - Treatment options
  - `User` - User accounts
  - `UserPlant` - User's personal plants
  - `GardenLog` - Activity logs for plants

#### `backend/schemas.py` (67 lines)
- Pydantic request/response models:
  - `TreatmentBase`, `DiseaseBase`, `PredictionResult`
  - `UserCreate`, `UserLogin`, `UserResponse`
  - `OTPRequest`, `OTPVerify`
  - `UserPlantCreate`, `UserPlantResponse`
  - `GardenLogCreate`, `GardenLogResponse`

#### `backend/database.py` (22 lines)
- SQLAlchemy engine and session configuration
- Supports SQLite (local) and external databases

#### `backend/gemini_client.py` (207 lines)
- **AI Analysis Pipeline:**
  1. Primary: Google Gemini API
  2. Fallback: Hugging Face BLIP
  3. Final: Mock result
- Functions:
  - `try_google_gemini()` - Primary analysis
  - `try_hugging_face()` - Backup analysis
  - `stream_gemini()` - Chat streaming
  - `translate_text()` - Multi-language support
  - `get_disease_info()` - Detailed disease info

#### `backend/ml_engine.py` (77 lines)
- Keras-based disease classifier
- Uses MobileNetV2 architecture
- Input: 160x160 images
- Supports confidence threshold (0.4)

#### `backend/init_db.py` (78 lines)
- Database seeding script
- Pre-populates sample plants/diseases

---

### 4.2 Frontend Components

#### `frontend/app/page.tsx` (177 lines)
- Main application entry
- State management for:
  - View switching (selection → main)
  - Plant selection
  - Disease prediction results
  - Loading/error states
  - Active tab navigation
- Integrates all major components

#### `frontend/components/DashboardUI.tsx` (484 lines)
- Application shell/layout
- Features:
  - Weather widget (Open-Meteo API)
  - Hourly forecast display
  - Language selector (i18n)
  - Bottom navigation
  - Dynamic content rendering based on active tab
  - Location permission handling

#### `frontend/components/Garden.tsx` (221 lines)
- User garden management
- Features:
  - User authentication flow
  - Add/delete plants
  - Plant history modal
  - Image placeholder fallback

#### `frontend/components/AuthForm.tsx` (123 lines)
- User registration form
- Input validation
- Error handling

#### Additional Components:
| Component | Purpose |
|-----------|---------|
| `CameraFeed.tsx` | Webcam capture |
| `ImageUpload.tsx` | File upload |
| `DiseaseInfo.tsx` | Display results |
| `GoogleAssist.tsx` | AI chat interface |
| `Community.tsx` | User community |
| `Market.tsx` | Marketplace |
| `Shops.tsx` | Shop listings |
| `Profile.tsx` | User profile |

---

## 5. Data Flow

### 5.1 Disease Prediction Flow
```
User Captures Image
        │
        ▼
CameraFeed/ImageUpload
        │
        ▼
Axios POST /predict (FormData)
        │
        ▼
Backend: gemini_client.try_google_gemini()
        │
        ├── Success ──► Return JSON
        │
        └── Failure ──► HuggingFace BLIP
                              │
                              └── Failure ──► Mock Result
        │
        ▼
Translation (if language ≠ 'en')
        │
        ▼
Response to Frontend
        │
        ▼
DiseaseInfo Display
```

### 5.2 User Authentication Flow
```
Registration Form
        │
        ▼
POST /auth/register
        │
        ▼
SQLAlchemy: Create User
        │
        ▼
Return user_id + token (localStorage)
        │
        ▼
Authenticate Garden Access
```

---

## 6. API Specification

### Base URL
- Production: `https://plant-guardian-backend.onrender.com`
- Local: `http://localhost:8000`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Disease detection |
| POST | `/ask-google` | AI chat (streaming) |
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| POST | `/auth/request-otp` | OTP generation |
| POST | `/auth/verify-otp` | OTP verification |
| POST | `/my-garden/add` | Add plant |
| GET | `/my-garden/{user_id}` | Get garden |
| DELETE | `/my-garden/{plant_id}` | Delete plant |
| POST | `/my-garden/logs/add` | Add log |
| GET | `/my-garden/logs/{plant_id}` | Get logs |

---

## 7. Database Schema

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   plants    │       │  diseases   │       │ treatments  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──────│ plant_id    │       │ disease_id  │
│ name        │       │ id          │◄──────│ id          │
│             │       │ name        │       │ type        │
│             │       │ severity    │       │ name        │
│             │       │ symptoms    │       │ description │
│             │       │ prevention  │       │ cost_approx │
└─────────────┘       └─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │ user_plants │       │ garden_logs │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──────│ user_id     │       │ user_plant  │
│ username    │       │ id          │◄──────│ id          │
│ email       │       │ plant_name  │       │ date        │
│ password    │       │ species     │       │ note        │
│ phone_num   │       │ date_planted│       │ status      │
└─────────────┘       │ image_url   │       │ image_url   │
                      └─────────────┘       └─────────────┘
```

---

## 8. Configuration

### Environment Variables (Backend)
```
DATABASE_URL=sqlite:///./plants.db
GOOGLE_API_KEY=<gemini-api-key>
GEMINI_API_KEY=<gemini-api-key>
HF_API_KEY=<huggingface-key>
PORT=8000
```

### Frontend Config (`frontend/config.ts`)
```typescript
export const API_BASE_URL = 'https://plant-guardian-backend.onrender.com';
```

---

## 9. External Integrations

| Service | Purpose | API |
|---------|---------|-----|
| Google Gemini | Plant disease analysis | gemini-flash-latest |
| Hugging Face | Image captioning (backup) | Salesforce/blip-image-captioning-large |
| Open-Meteo | Weather data | Weather API |
| GeoJS | IP-based location | geolocation |

---

## 10. Deployment

### Backend (Render)
- Dockerfile configured
- Requirements: `backend/requirements.txt`
- Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Next.js)
- Build: `npm run build`
- Output: `frontend/out/`
- Mobile: Capacitor for Android APK generation

---

## 11. Security Notes

- Password hashing: SHA-256
- CORS: Allowed all origins (for tunnel compatibility)
- API Keys: Environment variables only (no hardcoding)
- File Upload: Temporary storage with cleanup

---

## 12. Project Structure

```
plant-firtiizers-completed/
├── backend/
│   ├── __pycache__/
│   ├── uploads/              # Temporary image storage
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # DB config
│   ├── gemini_client.py     # AI integration
│   ├── ml_engine.py         # Keras model
│   ├── init_db.py           # DB seeder
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main entry
│   │   └── layout.tsx
│   ├── components/
│   │   ├── DashboardUI.tsx
│   │   ├── Garden.tsx
│   │   ├── AuthForm.tsx
│   │   ├── CameraFeed.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── DiseaseInfo.tsx
│   │   ├── GoogleAssist.tsx
│   │   └── ...
│   ├── contexts/
│   │   └── LanguageContext.tsx
│   ├── utils/
│   │   ├── translations.ts
│   │   └── imageUtils.ts
│   ├── config.ts
│   ├── package.json
│   └── public/
├── models/
│   ├── plant_disease_model.keras
│   └── class_indices.json
├── datasets/
│   └── raw/
├── .env
├── Dockerfile
├── render.yaml
└── README.md
```

---

*Generated on: 2026-04-16*
*Project: Plant Guardian - Plant Disease Detection System*