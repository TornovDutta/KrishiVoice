# KrishiVoice (কৃষিবয়েস) 🌾
### An AI Farming Assistant that Speaks the Farmer's Language

![KrishiVoice Banner](https://images.openai.com/static-rsc-4/-C_cCPHsy2idfXhZRqhdMoeHopbYiFbHhXuGc6wq_gFEq6X59kLypsqN5kBZDjeHqZBk3YFufwu1fmbWpn4bYwDYAM3cujcnhZssAhrIWWWvyHtrGR6SdF_1ly3SHmrUaRzRUp8Oh8GcHRltC62kRGyiGOIRh22TIwSrYZUFmBZvIjshvarH0GftHFiEcEzc?purpose=inline)

KrishiVoice is a **voice-first AI agricultural assistant** that empowers farmers to get actionable, reliable farming guidance simply by speaking naturally in their preferred mother tongue (Bengali `bn-IN`, Hindi `hi-IN`, English `en-IN`) instead of struggling with complex text apps.

**No mock or demo data**: All data pipelines operate on **real data**:
- **Real-Time Weather Feed**: Live meteorological readings and satellite radar directly from Open-Meteo for Indian districts (temperature, humidity, precipitation, wind speed, WMO codes).
- **Authentic Farm Onboarding**: Real farmers register and manage their own authentic farm profile, acreage, soil characteristics, and active crops.
- **Dynamic Agronomic Reminders**: Generated dynamically based on the farmer's real sowing/transplanting dates logged via voice.
- **Authentic Mandi Rates & Official MSP**: Supports local mandi price recording and queries with official Government of India Minimum Support Prices (MSP 2026).
- **Verified Agricultural Knowledge**: Grounded in ICAR (National Rice Research Institute) and IRRI disease factsheets.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   Farmer (Voice In)    │
                                  └───────────┬────────────┘
                                              │ Spoken Query (e.g. Bengali)
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     React Native Mobile & Web App (Port 5173)                   │
│  • Large touch acoustic mic button & wave visualizer                            │
│  • Real spoken audio capture via Web Speech API & Gnani STT                     │
│  • Spoken answer audio playback via SpeechSynthesis & Timbre TTS                │
│  • Language switcher: বাংলা (bn-IN), हिन्दी (hi-IN), English (en-IN)             │
│  • 6 Accessible Modules: Crop Doctor, Weather, Mandi, Diary, Expert, Memory     │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │ REST API / WebSocket
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Backend (Port 8000)                           │
│  • Live Open-Meteo Weather Integration (no mock data)                           │
│  • Grounded Agricultural RAG (ICAR-NRRI, IRRI, BCKV, CPRI manuals)              │
│  • Real Mandi Recording & Official MSP Benchmarks                               │
│  • Dynamic Crop Calendar Reminder Engine                                        │
│  • Real Farmer Profile & Memory Storage                                         │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │ Async Motor Driver
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MongoDB Database (Port 27017)                           │
│  • `farmers`: Real registered farmer profiles                                   │
│  • `conversations`: Authentic voice query logs and diagnoses                    │
│  • `reminders`: Dynamically computed crop calendar tasks                        │
│  • `mandi_prices`: Real-time market arrival records                             │
│  • `expert_cases`: Real escalated referral cases for extension specialists      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Running the Project

### 1. Backend (FastAPI)
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs available at: **http://127.0.0.1:8000/docs**

### 2. Frontend (React Native Web)
```bash
cd frontend
npm run dev
```
Open in browser at: **http://localhost:5173/**
