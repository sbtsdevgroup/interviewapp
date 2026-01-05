from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os
from pathlib import Path

app = FastAPI(title="Whisper Transcription API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model (base model for faster processing)
# You can change to 'small', 'medium', or 'large' for better accuracy
model = whisper.load_model("base")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "whisper"}

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """
    Transcribe audio file to text using Whisper
    """
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_file:
            content = await audio.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        try:
            # Transcribe audio
            result = model.transcribe(tmp_file_path, language="en")
            transcript = result["text"]
            
            # Get segments with timestamps
            segments = [
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": segment["text"]
                }
                for segment in result.get("segments", [])
            ]

            return {
                "transcript": transcript,
                "segments": segments,
                "language": result.get("language", "en")
            }
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

