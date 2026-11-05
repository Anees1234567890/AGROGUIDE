# 🌾 AgroGuide — Smart Farming. Better Decisions.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy%202.0-D71F00.svg?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **"Your digital companion for smarter, more informed farming."**

AgroGuide is a professional, responsive full-stack agricultural advisory platform designed to centralize and localize farming guidance in one easy-to-use dashboard. It bridges the gap between scattered agronomic science and daily field decision-making for smallholder, commercial, and progressive farmers.

---

## 📑 Table of Contents

1. [Problem Statement & AgroGuide Solution](#1-problem-statement--agroguide-solution)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Architecture & 500+ Crops Database](#5-database-architecture--500-crops-database)
6. [Quick Start & Local Running Guide](#6-quick-start--local-running-guide)
7. [Demo Accounts & Demo Mode](#7-demo-accounts--demo-mode)
8. [API Documentation](#8-api-documentation)
9. [Multilingual Support (i18n)](#9-multilingual-support-i18n)
10. [Automated Testing](#10-automated-testing)
11. [Production Deployment Guide](#11-production-deployment-guide)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Problem Statement & AgroGuide Solution

### 🚨 Challenges Identified
* **Fragmented Information:** Farmers struggle to find consolidated information across separate portals for crops, weather, soil tests, and mandi prices.
* **Inaccessible Experts:** Agricultural specialists, agronomists, and extension officers may not be easily reachable in rural areas.
* **Lack of Localization:** Generalized agronomic guidance fails to account for regional micro-climates, soil pH, and local seasons.
* **Language Barriers:** English-only applications hinder digital adoption for vernacular farmers.

### 💡 The AgroGuide Platform Response
AgroGuide integrates these essential services into one unified platform:
$$\text{Farmer Login} \longrightarrow \text{Farm/Field Details} \longrightarrow \text{Analyze Soil/Season} \longrightarrow \text{Receive Personalized Insights} \longrightarrow \text{Take Informed Action}$$

---

## 2. Key Features

- **🌱 Smart Crop Recommendation Engine:** Rule-based weighted scoring algorithm matching soil type, soil pH, season, water/irrigation, previous crop rotation, and NPK values.
- **📚 500+ Structured Crop Library:** Over 500 comprehensive crop records (cereals, pulses, vegetables, fruits, spices, oilseeds, plantation crops, tubers, medicinal plants, flowers, fodder crops, nuts) with local Malayalam/Hindi names, botanical names, sowing/harvest calendars, and market trading units.
- **🌤️ Hyper-Local Weather & Forecasts:** 5-day weather outlooks, 24-hr hourly temperature timelines, rainfall probability, and field spray advisories with OpenWeatherMap integration and rich offline demo fallback.
- **📈 Live APMC Mandi Market Prices:** Daily commodity prices, modal rates, and price trend indicators ($\uparrow$ Green for rising, $\downarrow$ Red for falling, $-$ for stable).
- **🛡️ Pest & Disease Diagnosis Guide:** Symptom identification, cultural prevention, eco-friendly biological management, and certified consultation guidance.
- **🤖 24/7 AgroGuide AI Assistant:** Conversational agricultural knowledge chatbot with intelligent offline capabilities answering queries in English, Malayalam, and Hindi.
- **👨‍🌾 Farmer Community Forum:** Discussion boards by category (Crop, Soil, Pest, Weather, Market), like buttons, and comment threads.
- **🎓 Agricultural Professional Support:** Directory of verified agronomists, soil chemists, and Krishi Bhavan officers with direct inquiry submission.
- **🚜 My Farm & Soil Profile:** Maintain farm size, soil type, tested pH, irrigation facility, and crop history.
- **🔔 Farm Alert Notification Center:** Timely notifications on weather warnings, market surges, and crop advice.
- **👑 Admin Management Console:** Platform metric cards, user role & activation controls, and crop CRUD tools.

---

## 3. Technology Stack

### Frontend
- **Framework:** React.js (v18) + Vite (v5)
- **Routing:** React Router DOM (v6)
- **HTTP Client:** Axios (with automatic JWT Bearer interceptor)
- **Icons:** Lucide React
- **Internationalization:** Custom zero-dependency translation context (`en.json`, `ml.json`, `hi.json`)
- **Typography:** Plus Jakarta Sans, Noto Sans Malayalam, Noto Sans Devanagari

### Backend
- **Framework:** Python 3.10+ / FastAPI (REST API architecture)
- **ORM & Database:** SQLAlchemy 2.0 (Dual support for MySQL & zero-config SQLite)
- **Authentication:** JWT (JSON Web Tokens) with Passlib & BCrypt password hashing
- **Data Validation:** Pydantic v2 & Pydantic-Settings
- **Documentation:** Interactive Swagger UI (`/docs`) & ReDoc (`/redoc`)
- **Testing:** Pytest & FastAPI TestClient

---

## 4. Project Structure

```
aguro/
├── backend/
│   ├── app/
│   │   ├── auth/            # JWT authentication & role dependencies
│   │   ├── database/        # SQLAlchemy engine and session
│   │   ├── models/          # Relational DB models (User, Crop, Farm, Market, etc.)
│   │   ├── routes/          # REST API endpoints (/auth, /crops, /weather, etc.)
│   │   ├── schemas/         # Pydantic request/response validation schemas
│   │   ├── services/        # Business logic (Recommendation, Weather, Market, AI)
│   │   ├── config.py        # Environment settings
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/
│   │   └── test_api.py      # Automated backend pytest test suite
│   ├── requirements.txt
│   └── .env.example
├── database/
│   ├── schema.sql           # Production MySQL DDL schema definition
│   └── seed_crops.py        # Automated seeder with 105+ crops & demo data
├── frontend/
│   ├── public/              # Favicon and static assets
│   ├── src/
│   │   ├── components/      # Common, Dashboard, Crops, and Chat UI components
│   │   ├── context/         # AuthContext & LanguageContext
│   │   ├── layouts/         # MainLayout and DashboardLayout
│   │   ├── pages/           # 16 Major responsive web pages
│   │   ├── services/        # Axios API client functions
│   │   ├── styles/          # Custom responsive CSS design system
│   │   ├── translations/    # en.json, ml.json, hi.json
│   │   ├── App.jsx          # React Router route registry
│   │   └── main.jsx         # React DOM root
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── README.md
└── .gitignore
```

---

## 5. Database Architecture & 500+ Crops Database

AgroGuide includes a database seed script (`database/seed_crops.py`) that populates **500+ fully structured crops**:
- **Cereals & Millets (35):** Rice (Paddy), Wheat, Maize, Ragi, Bajra, Sorghum, Barley, Foxtail Millet, Little Millet, Kodo Millet, Barnyard Millet, Proso Millet, Oats, Buckwheat, Amaranth Grain, Quinoa, Teff, Wild Rice, Spelt, Rye, Triticale, Fonio, Job's Tears, etc.
- **Pulses & Legumes (40):** Chickpea (Bengal Gram), Pigeon Pea (Toor Dal), Green Gram (Moong), Black Gram (Urad), Cowpea (Lobia), Lentil (Masoor), Field Pea, Horse Gram (Muthira), Kidney Beans (Rajma), Moth Bean, Soybean, Broad Bean, Winged Bean, Hyacinth Bean (Lablab), Cluster Bean (Guar), Velvet Bean, Bambara Groundnut, Jack Bean, Sword Bean, Lima Bean, etc.
- **Vegetables (110):** Tomato, Brinjal, Chilli, Okra, Gourds (Bitter, Snake, Bottle, Ridge, Ash), Pumpkin, Cucumber, Onion, Shallot, Potato, Garlic, Cabbage, Cauliflower, Broccoli, Spinach, Drumstick, Agathi, Carrot, Radish, Beetroot, Sweet Potato, Turnip, Capsicum, Kale, Bok Choy, Lettuce, Zucchini, etc.
- **Fruits (110):** Mango, Banana (Nendran, Robusta, Poovan), Coconut, Pineapple, Papaya, Guava, Jackfruit, Sapota, Mangosteen, Rambutan, Durian, Dragonfruit, Passion Fruit, Avocado, Pomegranate, Fig, Custard Apple, Soursop, Breadfruit, Star Fruit, Rose Apple, Amla, Ber, Strawberry, Apple, Pear, Citrus fruits, etc.
- **Spices & Condiments (55):** Black Pepper, Small Cardamom, Large Cardamom, Ginger, Turmeric, Clove, Nutmeg & Mace, Cinnamon, Cassia, Allspice, Vanilla, Star Anise, Cumin, Coriander, Fennel, Fenugreek, Ajwain, Black Cumin, Mustard, Saffron, Kokum, Kudampuli, Bay Leaf, Long Pepper, Galangal, etc.
- **Plantation & Commercial (35):** Natural Rubber, Tea, Coffee (Arabica/Robusta), Cocoa, Arecanut, Oil Palm, Cashew Nut, Sugarcane, Sugarbeet, Cotton, Jute, Mesta, Sunnhemp, Sisal, Bamboo, Mulberry, Tobacco, Betel Vine, Coir, etc.
- **Oilseeds (30):** Groundnut, Sesame, Sunflower, Safflower, Mustard, Rapeseed, Castor, Niger Seed, Linseed, Soybean, Oil Palm, Rice Bran, Neem, Sal, Jatropha, Chia, etc.
- **Tubers & Root Crops (25):** Tapioca (Cassava/Kappa), Elephant Foot Yam (Chenai), Taro (Colocasia/Chembu), Chinese Potato (Koorka), Sweet Potato, Greater Yam, Lesser Yam, Arrowroot, Potato, Radish, Carrot, Beetroot, Turnip, Yam Bean, Lotus Root, Water Chestnut, etc.
- **Medicinal & Aromatic Plants (45):** Ashwagandha, Brahmi, Gotu Kola, Shatavari, Tulsi, Neem, Aloe Vera, Sarpagandha, Kalmegh, Giloy, Adathoda, Vayambu, Bhringraj, Lemongrass, Citronella, Palmarosa, Patchouli, Vetiver, Lavender, Stevia, Senna, Isabgol, Henna, Safed Musli, etc.
- **Flowers & Ornamental (35):** Jasmine (Mulla, Pitchi), Ixora (Chethi), Marigold, Rose, Crossandra, Tube Rose, Chrysanthemum, Anthurium, Orchid, Lotus, Water Lily, Gladiolus, Gerbera, Carnation, Aster, Dahlia, Hibiscus, Bougainvillea, Heliconia, etc.
- **Fodder & Forage Crops (25):** Hybrid Napier Grass (CO-5), Guinea Grass, Para Grass, Congo Signal Grass, Lucerne, Berseem, Cowpea Fodder, Sorghum Fodder, Maize Fodder, Oats Fodder, Stylo, Subabul, Rhodes Grass, Azolla, etc.
- **Nuts & Beverages (20):** Cashew Nut, Almond, Walnut, Pistachio, Pecan Nut, Macadamia Nut, Hazelnut, Chestnut, Betel Nut, Coconut, Coffee (Arabica/Robusta), Tea, Cocoa, Yerba Maté, Chicory, etc.

---

## 6. Quick Start & Local Running Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10, v3.11, v3.12 or v3.13)
- **Git**

---

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/agroguide.git
cd agroguide
```

---

### Step 2: Backend Setup & Execution

#### On Windows (PowerShell / Command Prompt):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### On macOS / Linux:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### Initialize Database & Seed 105+ Crops:
```bash
# Run from repository root with backend virtual environment active:
python database/seed_crops.py
```

#### Start FastAPI Backend Server:
```bash
# Inside the backend directory:
uvicorn app.main:app --reload --port 8000
```
Backend will be running at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/docs`

---

### Step 3: Frontend Setup & Execution

Open a **new terminal** window:

```bash
cd frontend
npm install
npm run dev
```
Frontend development server will be running at: `http://localhost:5173`

---

## 7. Demo Accounts & Demo Mode

AgroGuide comes pre-seeded with ready-to-use accounts for evaluation:

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@agroguide.com` | `farmer123` | Farm dashboard, crop recommendations, weather, mandi prices, community forum, assistant |
| **Expert** | `expert@agroguide.com` | `expert123` | Professional profile, advisory inquiry manager |
| **Admin** | `admin@agroguide.com` | `admin123` | Full admin console, user role manager, crop database CRUD |

### 🛡️ Demo Mode (`DEMO_MODE=true`)
When running without external API keys, AgroGuide automatically runs in **Demo Mode**:
- Weather forecasts simulate realistic atmospheric metrics for Indian/Kerala districts.
- APMC mandi commodity prices provide realistic modal benchmarks.
- AgroGuide AI Chatbot activates an intelligent offline agricultural knowledge engine.
- When an API key (e.g. `WEATHER_API_KEY`) is added to `backend/.env`, AgroGuide seamlessly switches to real-time live APIs.

---

## 8. API Documentation

FastAPI provides automated interactive API documentation:
* **Interactive Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Specification:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new Farmer, Expert or Admin |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT Bearer token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/crops` | Search 100+ crops with category/season/soil filters |
| `GET` | `/api/crops/{id}` | Detailed crop cultivation guide |
| `POST` | `/api/recommendations` | Execute rule-based crop suitability algorithm |
| `GET` | `/api/weather` | Fetch 5-day weather forecast and alerts |
| `GET` | `/api/market-prices` | List APMC mandi commodity prices with trends |
| `GET` | `/api/pests` & `/api/diseases` | Search pest & disease diagnostic guide |
| `POST` | `/api/chat` | AgroGuide Assistant conversational endpoint |
| `GET` | `/api/community/posts` | List farmer discussion forum posts |
| `POST` | `/api/support-requests` | Submit advisory inquiry to agricultural expert |
| `GET` | `/api/admin/stats` | Platform overview statistics (Admin only) |

---

## 9. Multilingual Support (i18n)

AgroGuide supports dynamic multilingual switching with localStorage persistence:
1. **English (`en.json`)**
2. **മലയാളം (`ml.json`)**
3. **हिन्दी (`hi.json`)**

Switch languages instantly using the globe selector in the navigation bar.

---

## 10. Automated Testing

Run the automated backend test suite using `pytest`:

```bash
# Inside the backend directory with venv activated:
pytest tests/test_api.py -v
```

All 8 core test suites (auth, crops, recommendations, weather, market, pests, and chat) will execute and validate API functionality.

---

## 11. Production Deployment Guide

```mermaid
graph TD
    Client["Frontend: Vercel / Netlify"]
    API["Backend: Render / Railway (FastAPI)"]
    DB[("Database: Managed MySQL (Aiven / PlanetScale)")]
    External["APIs: OpenWeatherMap / Gemini"]

    Client -->|HTTPS / REST API| API
    API --> DB
    API --> External
```

### Production Build Steps:
1. **Frontend Build:**
   ```bash
   cd frontend
   npm run build
   ```
   Outputs optimized production bundle in `frontend/dist/`.
2. **Deploy Frontend:** Host `dist/` on Vercel or Netlify. Set `VITE_API_URL` to your production backend URL.
3. **Deploy Backend:** Deploy `backend/` on Render, Railway, or AWS EC2 with command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. **Database:** Create a managed MySQL database and configure `DATABASE_URL=mysql+pymysql://user:password@host:3306/agroguide` in backend environment variables.

---

## 12. Troubleshooting

* **Issue:** `email-validator is not installed`
  * **Solution:** Run `pip install email-validator` in the backend virtual environment.
* **Issue:** `Port 8000 or 5173 already in use`
  * **Solution:** Start backend on another port (`uvicorn app.main:app --port 8001`) and update frontend `vite.config.js` proxy.
* **Issue:** `SQLite database locked or permission error`
  * **Solution:** Ensure write permissions in the `backend/` folder or specify full absolute path in `DATABASE_URL`.

---

## 👨‍🌾 AgroGuide — Built for Smarter, Sustainable Agriculture.
Developed with ❤️ for farmers, agricultural students, and agronomic researchers.
