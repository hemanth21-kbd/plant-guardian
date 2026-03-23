# 🌱 Plant Guardian: AI-Powered Agricultural Assistant

**Plant Guardian** (formerly *AgroShield*) is a comprehensive mobile and web application designed to empower farmers with cutting-edge AI technology. It provides real-time crop health monitoring, disease diagnosis, and data-driven market insights to improve harvest yields and farmer livelihoods.

## 🚀 Key Features

*   **AI Disease Diagnosis**: Instant identification of crop diseases using Google Gemini Vision AI. Users can capture a photo or upload an image to receive detailed diagnosis and treatment recommendations.
*   **One-Time Farmer Registration**: Simplified onboarding with a permanent registration process, ensuring that agricultural history and settings are preserved on the device.
*   **Market Price Monitoring**: Live price updates and location data for over 60 agricultural products, including vegetables, fruits, and flowers.
*   **Digital Garden Management**: Track the growth of individual crops, maintain a history of diseases encountered, and manage care schedules.
*   **Community Forums**: A platform for farmers to share knowledge, ask questions, and connect with local agricultural suppliers.
*   **Multilingual Support**: Available in multiple regional languages to cater to diverse farming communities.

## 🛠️ Technology Stack

*   **Frontend**: React (Next.js), Tailwind CSS, Capacitor (Android/iOS)
*   **Backend**: Python, FastAPI
*   **AI Model**: Google Gemini Pro Vision
*   **Database**: SQLite (SQLAlchemy)
*   **Deployment**: Vercel (Frontend), Hugging Face Spaces (Backend)

## 📦 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)
*   Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Set your `GOOGLE_API_KEY` in the `.env` file.
4. Run the server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Configure the `API_BASE_URL` in `config.ts`.
4. Run the development server: `npm run dev`

---
Made with ❤️ for the farming community.
