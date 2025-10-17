# KO Fullstack Sentiment (MVP)

Basit bir sohbet uygulaması: kullanıcı mesaj gönderir, her mesaj için anlık duygu analizi (positive/neutral/negative) görünür. Web (React), mobil (React Native CLI), backend (.NET + SQLite), AI servisi (Python, Hugging Face Spaces). Tüm servisler ücretsiz katmanlarda yayınlanır.

## Klasör Yapısı
- `frontend/`: React web (Vercel)
- `backend/`: .NET Core Web API + SQLite (Render)
- `ai-service/`: Python (Gradio/FastAPI) – Hugging Face Spaces
- `mobile/`: React Native CLI

## Canlı Linkler
- Web (Vercel): https://ko-fullstack-sentiment.vercel.app
- Backend API (Render): https://ko-fullstack-sentiment-1.onrender.com
- AI Service (Hugging Face Spaces): https://amir7871-ko-sentiment-ai-service.hf.space/analyze
- Mobile (APK/build): https://drive.google.com/file/d/13pE_S3V0sw56eyTCWFFuAm_6fUWKrd22/view?usp=sharing

## Kurulum (Özet)
### ai-service (Hugging Face Spaces)
- Gereksinimler: `ai-service/requirements.txt`
- Lokal: `python ai-service/app.py`
- Deploy: Hugging Face Spaces → SDK: FastAPI → public `/analyze`

### backend (Render)
- .NET 8 Minimal API + SQLite
- Ortam değişkenleri:
  - `ConnectionStrings__Default` = `Data Source=app.db`
  - `AI_PREDICT_URL` = `https://amir7871-ko-sentiment-ai-service.hf.space/analyze`
  - `CORS_ORIGINS` = `http://localhost:5173,https://ko-fullstack-sentiment.vercel.app`
- Lokal: `cd backend && dotnet run`

### frontend (Vercel)
- Ortam: `.env` → `VITE_API_BASE_URL` (örn. `https://ko-fullstack-sentiment-1.onrender.com`)
- Lokal: `cd frontend && npm i && npm run dev`

### mobile (React Native CLI)
- Ortam: `API_BASE_URL` = `https://ko-fullstack-sentiment-1.onrender.com`
- Çalıştırma: RN CLI standart komutları (Android/iOS)

## API Sözleşmesi
- `POST /register` → body: `{ nickname }` → `{ userId, nickname }`
- `POST /message` → body: `{ userId, text }` → kayıt + AI çağrısı → `{ id, userId, text, sentiment: { label, score }, createdAt }`
- `GET /messages?userId=...` → mesaj listesi (opsiyonel filtre)

Not: Backend, HF Spaces endpoint’ine `{ text }` ile POST eder; yanıttan `{label, score}` döner.

## 3 Günlük Plan (brife uygun)
1. Gün: GitHub repo + HF Spaces duygu analizi + .NET mesaj kayıt API
2. Gün: React web chat ekranı + backend/AI entegrasyonu + Vercel deploy
3. Gün: RN CLI mobil ekran + entegrasyon + README ve kod açıklamaları

## AI Araçları ve Sahiplik
- Kullanılan AI/model: HF Spaces + `cardiffnlp/twitter-roberta-base-sentiment-latest`
- AI ile desteklenen kısımlar: boilerplate düzenlemeler
- Manuel yazılan kritik akış: backend’de mesaj kaydı + AI çağrısı + yanıtın kaydedilmesi

## Dosya Açıklamaları (özet)
- `ai-service/app.py`: FastAPI `/analyze` JSON (label/score) + Gradio UI
- `backend/Program.cs`: Minimal API, SQLite, `/register` `/message` `/messages`, AI çağrısı
- `frontend/src/App.jsx`: Web chat (rumuz, liste, mesaj gönder, sentiment etiketi)
- `mobile/App.js`: RN CLI chat ekranı (FlatList + TextInput + Button)

## Doğrulama
- Web: mesaj gönder → anlık sentiment görünür
- Mobil: aynı akış
- Backend: kullanıcı ve mesajlar SQLite’ta, her mesajda AI çağrısı
- AI: HF Spaces positive/neutral/negative döndürür
- Tüm canlı linkler çalışır; README gereklilikleri tamamdır

## Sorun Giderme (Troubleshooting)
- Render Free soğuk başlangıç: İlk istek 20–90 sn sürebilir; nadiren zaman aşımı olabilir. Tekrar deneyin veya servisi yeniden deploy ederek “uyandırın”. `GET /health` ile durum kontrolü yapabilirsiniz.
- CORS hataları: `CORS_ORIGINS` yalnızca geçerli origin’leri içermelidir (Vercel domain + `http://localhost:5173`). Önizleme domain’leri kullanıyorsanız onları da ekleyin.
- HF Spaces soğuk başlangıç: İlk `/analyze` çağrısı yavaş olabilir; backend HttpClient zaman aşımı 10 sn. UI bu durumda hatayı nazikçe gösterir; tekrar deneyin.
- Model dili: Secilen model Ingilizce metinlerde daha iyi sonuc verir. Turkce calisir ancak Ingilizce girdiler daha tutarlidir.
