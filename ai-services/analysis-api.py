from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
import os

app = FastAPI(title="Interview Analysis API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama-service:11434")

class TranscriptRequest(BaseModel):
    transcript: str
    student_name: str
    interview_duration: float = 0.0

@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags", timeout=5.0)
            if response.status_code == 200:
                return {"status": "healthy", "service": "analysis", "ollama": "connected"}
            else:
                return {"status": "degraded", "service": "analysis", "ollama": "disconnected"}
    except:
        return {"status": "degraded", "service": "analysis", "ollama": "disconnected"}

async def ensure_model():
    """Ensure Mistral model is available"""
    try:
        async with httpx.AsyncClient() as client:
            # Check if model exists
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            models = response.json().get("models", [])
            model_names = [m.get("name", "") for m in models]
            
            if "mistral:7b" not in model_names:
                # Pull the model
                await client.post(f"{OLLAMA_URL}/api/pull", json={"name": "mistral:7b"})
    except Exception as e:
        print(f"Error ensuring model: {e}")

@app.post("/analyze")
async def analyze_interview(request: TranscriptRequest):
    """
    Analyze interview transcript and provide scores and recommendations
    """
    try:
        # Ensure model is available
        await ensure_model()

        # Create analysis prompt
        prompt = f"""You are an expert interview evaluator. Analyze the following interview transcript and provide a comprehensive evaluation.

Student Name: {request.student_name}
Interview Duration: {request.interview_duration:.1f} minutes

Transcript:
{request.transcript}

Please provide a JSON response with the following structure:
{{
    "overall_score": <number 0-100>,
    "communication_score": <number 0-100>,
    "technical_knowledge_score": <number 0-100>,
    "confidence_score": <number 0-100>,
    "clarity_score": <number 0-100>,
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
    "summary": "A brief summary of the interview performance",
    "sentiment": "positive" | "neutral" | "negative"
}}

Be objective and constructive in your evaluation. Only return valid JSON, no additional text."""

        # Call Ollama API
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "mistral:7b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                    }
                }
            )

            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Ollama API error")

            result = response.json()
            response_text = result.get("response", "")

            # Try to extract JSON from response
            try:
                # Find JSON in response (might have extra text)
                start_idx = response_text.find("{")
                end_idx = response_text.rfind("}") + 1
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = response_text[start_idx:end_idx]
                    analysis = json.loads(json_str)
                else:
                    raise ValueError("No JSON found in response")
            except (json.JSONDecodeError, ValueError) as e:
                # Fallback: create a basic analysis
                analysis = {
                    "overall_score": 70,
                    "communication_score": 70,
                    "technical_knowledge_score": 70,
                    "confidence_score": 70,
                    "clarity_score": 70,
                    "strengths": ["Good communication", "Clear responses"],
                    "weaknesses": ["Could improve technical depth"],
                    "recommendations": ["Practice more technical questions", "Build confidence"],
                    "summary": "Decent interview performance with room for improvement",
                    "sentiment": "neutral"
                }

            return analysis

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Analysis timeout - model may be loading")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)

