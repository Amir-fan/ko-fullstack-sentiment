import time
from typing import Dict

import gradio as gr
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline


_sentiment = None


def _load_model():
    global _sentiment
    if _sentiment is None:
        start = time.time()
        _sentiment = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
        print(f"model_loaded latency_ms={(time.time()-start)*1000:.0f}")
    return _sentiment


def _normalize_label(raw_label: str) -> str:
    if not raw_label:
        return "neutral"
    up = raw_label.upper()
    if up in {"POSITIVE", "NEGATIVE", "NEUTRAL"}:
        return up.lower()
    if up.startswith("LABEL_"):
        # Common mapping for cardiffnlp twitter-roberta: 0=negative, 1=neutral, 2=positive
        try:
            idx = int(up.split("_")[-1])
            return ["negative", "neutral", "positive"][idx]
        except Exception:
            return "neutral"
    return raw_label.lower() if raw_label.lower() in {"positive", "neutral", "negative"} else "neutral"


def analyze(text: str) -> Dict[str, object]:
    if not isinstance(text, str) or not text.strip():
        return {"label": "neutral", "score": 0.0}
    model = _load_model()
    start = time.time()
    result = model(text)[0]
    label = _normalize_label(str(result.get("label", "neutral")))
    score = float(result.get("score", 0.0))
    latency_ms = int((time.time() - start) * 1000)
    print(f"predict len={len(text)} label={label} score={score:.3f} latency_ms={latency_ms}")
    return {"label": label, "score": score}


# Gradio UI for manual checks (optional)
demo = gr.Interface(
    fn=analyze,
    inputs=gr.Textbox(label="text"),
    outputs=gr.JSON(label="result"),
    title="Sentiment Analyze",
    description="Return positive/neutral/negative with score.",
)


# FastAPI app exposing a clean JSON endpoint /analyze
app = FastAPI()


class AnalyzeRequest(BaseModel):
    text: str


@app.post("/analyze")
def analyze_route(req: AnalyzeRequest):
    return analyze(req.text)


# Mount Gradio UI at / (or /ui)
app = gr.mount_gradio_app(app, demo, path="/")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)


