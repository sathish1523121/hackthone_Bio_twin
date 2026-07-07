from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid

from backend.services.supabase_helper import get_current_user
from backend.services.agents_workflow import run_agent_workflow_async, agents_status_col
from backend.routes.reports import GenerateReportRequest, get_report_status

router = APIRouter(prefix="/api/agents", tags=["agents"])

class RunAgentRequest(BaseModel):
    userId: str
    userProfile: Dict[str, Any]
    lifestyleData: Dict[str, Any]
    medicalReports: List[Dict[str, Any]]

@router.post("/run")
async def run_agents(req: RunAgentRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """
    POST /api/agents/run
    Trigger the 6-agent virtual twin execution workflow in the background.
    """
    if req.userId != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized user access."
        )
        
    kickoff_id = f"local-kickoff-{uuid.uuid4()}"
    
    # Enqueue background task
    background_tasks.add_task(run_agent_workflow_async, kickoff_id, req.userId, {
        "user_name": req.userProfile.get("name", "User"),
        "age": str(req.userProfile.get("age", "30")),
        "location": req.userProfile.get("location", "New York, USA"),
        "sleep_hours": str(req.userProfile.get("sleepHours", "7")),
        "exercise_level": req.userProfile.get("exerciseLevel", "Moderate"),
        "food_habits": req.userProfile.get("diet", "Balanced"),
        "health_goals": ", ".join(req.userProfile.get("healthGoals", [])) if req.userProfile.get("healthGoals") else "General health tracking"
    })
    
    return {
        "status": "success",
        "kickoff_id": kickoff_id
    }

@router.get("/status/{kickoff_id}")
async def get_agent_execution_status(kickoff_id: str, current_user: dict = Depends(get_current_user)):
    """
    GET /api/agents/status/{kickoff_id}
    Retrieves the execution status for the multi-agent crew.
    """
    # Fetch log items from agents_status collection
    cursor = agents_status_col.find({"kickoffId": kickoff_id})
    agent_states = []
    async for doc in cursor:
        doc.pop("_id", None)
        agent_states.append(doc)
        
    if not agent_states:
        return {
            "status": "Waiting",
            "progress": 0,
            "logs": ["Diagnostics pipeline standby... Waiting for cluster allocation."]
        }
        
    # Map to UI structure
    logs = []
    completed_count = 0
    running_agent = None
    
    for s in agent_states:
        agent_logs = s.get("logs", [])
        logs.extend(agent_logs)
        if s.get("status") == "completed":
            completed_count += 1
        elif s.get("status") == "running":
            running_agent = s.get("agentId")
            
    # Calculate progress % (7 stages total: manager, medical, lifestyle, environment, research, twin, report)
    progress = int((completed_count / 7.0) * 100)
    
    status_label = "Thinking"
    if completed_count == 7:
        status_label = "Completed"
        progress = 100
    elif running_agent:
        status_label = "Processing"
        
    return {
        "status": status_label,
        "progress": progress,
        "active_agent": running_agent,
        "logs": logs
    }
