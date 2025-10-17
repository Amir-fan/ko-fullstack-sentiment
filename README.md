# KO Fullstack Sentiment (MVP)

Basit bir sohbet uygulaması: kullanıcı mesaj gönderir, her mesaj için anlık duygu analizi (positive/neutral/negative) görünür. Web (React), mobil (React Native CLI), backend (.NET + SQLite), AI servisi (Python, Hugging Face Spaces). Tüm servisler ücretsiz katmanlarda yayınlanır.

## Klasör Yapısı
- `frontend/`: React web (Vercel)
- `backend/`: .NET Core Web API + SQLite (Render)
- `ai-service/`: Python (Gradio tabanlı API) – Hugging Face Spaces
- `mobile/` (opsiyonel): React Native CLI

## Canlı Linkler (doldurulacak)
- Web (Vercel): <eklenecek>
- Backend API (Render): <eklenecek>
- AI Service (Hugging Face Spaces): <eklenecek>
- Mobile (APK/build): <eklenecek>

## Kurulum (Özet)
### ai-service (Hugging Face Spaces)
- Gereksinimler: `ai-service/requirements.txt`
- Lokal: `python ai-service/app.py`
- Deploy: Hugging Face Spaces → public erişim, Gradio API `/api/predict`

### backend (Render)
- .NET 8 Minimal API + SQLite
- Ortam değişkenleri:
  - `ConnectionStrings__Default` = `Data Source=app.db`
  - `AI_PREDICT_URL` = `https://<space>.hf.space/api/predict`
  - `CORS_ORIGINS` = `http://localhost:5173,https://<vercel-app>.vercel.app`
- Lokal: `cd backend && dotnet run`

### frontend (Vercel)
- Ortam: `.env` → `VITE_API_BASE_URL` (örn. `http://localhost:5000` veya Render URL)
- Lokal: `cd frontend && npm i && npm run dev`

### mobile (React Native CLI)
- Ortam: `API_BASE_URL`
- Çalıştırma: RN CLI standart komutları (Android/iOS)

## API Sözleşmesi
- `POST /register` → body: `{ nickname }` → `{ userId, nickname }`
- `POST /message` → body: `{ userId, text }` → kayıt + AI çağrısı → `{ id, userId, text, sentiment: { label, score }, createdAt }`
- `GET /messages?userId=...` → mesaj listesi (opsiyonel filtre)

Not: Backend, HF Spaces Gradio endpoint’ine `{ data: [text] }` gönderir; yanıttan `{label, score}` çıkarılır.

## 3 Günlük Plan (brife uygun)
1. Gün: GitHub repo + HF Spaces duygu analizi + .NET mesaj kayıt API
2. Gün: React web chat ekranı + backend/AI entegrasyonu + Vercel deploy
3. Gün: RN CLI mobil ekran + entegrasyon + README ve kod açıklamaları

## AI Araçları ve Sahiplik
- Kullanılan AI/model ve Space linki README’de belirtilecektir.
- AI ile desteklenen kısımlar işaretlenecek.
- En az bir çekirdek akış (ör. DB sorgusu/API çağrısı) manuel yazılmıştır.

## Dosya Açıklamaları (özet)
- `ai-service/app.py`: Gradio tabanlı analiz endpoint’i
- `backend/Program.cs`: Minimal API, SQLite, endpointler, AI çağrısı
- `frontend/src/App.jsx`: Chat arayüzü ve backend entegrasyonu

## Doğrulama
- Web: mesaj gönder → anlık sentiment görünür
- Mobil: aynı akış
- Backend: kullanıcı ve mesajlar SQLite’ta, her mesajda AI çağrısı
- AI: HF Spaces positive/neutral/negative döndürür
- Tüm canlı linkler çalışır; README gereklilikleri tamamdır
