import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db
from backend.routes import profile, reports, documents, environment, agents, auth
from backend.config import settings

app = FastAPI(
    title="BioTwin AI API",
    description="Backend API for BioTwin AI health intelligence portal.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(profile.router)
app.include_router(reports.router)
app.include_router(documents.router)
app.include_router(environment.router)
app.include_router(agents.router)
app.include_router(auth.router)

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "BioTwin AI API"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
