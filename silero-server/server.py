"""
Silero TTS Server — Azerbaijani (aze_gamat, v5_cis_base)
=========================================================
Exposes a single POST /tts endpoint that accepts JSON:
  { "text": "Salam dünya!" }

Returns audio/wav binary — directly playable in the browser via Audio().

Run:
  python server.py

The frontend fetches http://localhost:8765/tts and plays the response.
"""

import io
import os
import torch
import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel

# ── Config ────────────────────────────────────────────────────────────────────
PORT        = 8765
SAMPLE_RATE = 24000       # 24 kHz — good quality, reasonable size
SPEAKER     = "aze_gamat" # only Azerbaijani speaker in v5_cis_base
MODEL_ID    = "v5_cis_base"
LANGUAGE    = "aze"
DEVICE      = torch.device("cpu")  # change to "cuda" if GPU available

# ── Load model once at startup ────────────────────────────────────────────────
MODEL_URL   = "https://models.silero.ai/models/tts/ru/v5_cis_base.pt"
MODEL_CACHE = os.path.expanduser("~/.cache/silero_edu/v5_cis_base.pt")

os.makedirs(os.path.dirname(MODEL_CACHE), exist_ok=True)

if not os.path.isfile(MODEL_CACHE):
    print(f"[Silero] Downloading model → {MODEL_CACHE}  (~120 MB, once only)...")
    torch.hub.download_url_to_file(MODEL_URL, MODEL_CACHE)
    print("[Silero] Download complete.")

print("[Silero] Loading model from cache...")
model = torch.package.PackageImporter(MODEL_CACHE).load_pickle("tts_models", "model")
model.to(DEVICE)
print(f"[Silero] ✅ Model ready. Speaker: {SPEAKER}, sample_rate: {SAMPLE_RATE}")

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="Silero TTS – Azerbaijani")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # frontend on localhost:3000
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class TTSRequest(BaseModel):
    text: str
    speaker: str = SPEAKER
    sample_rate: int = SAMPLE_RATE


@app.get("/health")
def health():
    return {"status": "ok", "language": LANGUAGE, "speaker": SPEAKER}


@app.post("/tts")
def synthesize(req: TTSRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is empty")
    if len(text) > 1000:
        raise HTTPException(status_code=400, detail="text too long (max 1000 chars)")

    sr = req.sample_rate if req.sample_rate in (8000, 24000, 48000) else SAMPLE_RATE

    try:
        # apply_tts returns a 1-D float tensor
        audio_tensor = model.apply_tts(
            text=text,
            speaker=req.speaker,
            sample_rate=sr,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {e}")

    # Convert tensor → WAV bytes in memory
    audio_np = audio_tensor.numpy()
    buf = io.BytesIO()
    sf.write(buf, audio_np, sr, format="WAV", subtype="PCM_16")
    buf.seek(0)

    return Response(
        content=buf.read(),
        media_type="audio/wav",
        headers={"X-Sample-Rate": str(sr)},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")
