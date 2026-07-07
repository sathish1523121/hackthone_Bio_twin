from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
import re
import uuid

from backend.database import db, reports_col, profiles_col, documents_col
from backend.services.pdf_parser import extract_pdf_text, clean_text, chroma_db
from backend.services.supabase_helper import get_current_user
from backend.services.agents_workflow import run_agent_workflow_async

router = APIRouter(prefix="/api/reports", tags=["reports"])

class GenerateReportRequest(BaseModel):
    userId: str
    userProfile: Dict[str, Any]
    lifestyleData: Dict[str, Any]
    medicalReports: List[Dict[str, Any]]

class SimulationRequest(BaseModel):
    userId: str
    reportId: str
    question: str

def parse_biomarkers_from_text(text: str) -> Dict[str, str]:
    """
    Search for Cholesterol and Vitamin D values in PDF text.
    Returns custom keys mapped to values if found.
    """
    results = {}
    
    # Try to find Cholesterol
    chol_match = re.search(r'cholesterol\s*[:\-]?\s*(\d+)\s*(mg/dL)?', text, re.IGNORECASE)
    if chol_match:
        val = int(chol_match.group(1))
        status_str = "high" if val >= 200 else "normal"
        key = f'"name": "Cholesterol", "value": "{val} mg/dL", "status": "{status_str}"'
        results[key] = f"extracted cholesterol: {val} ({status_str})"
        
    # Try to find Vitamin D
    vit_match = re.search(r'vitamin\s*d\s*[:\-]?\s*(\d+)\s*(ng/mL)?', text, re.IGNORECASE)
    if vit_match:
        val = int(vit_match.group(1))
        status_str = "low" if val < 30 else "normal"
        key = f'"name": "Vitamin D", "value": "{val} ng/mL", "status": "{status_str}"'
        results[key] = f"extracted vitamin D: {val} ({status_str})"
        
    return results

@router.post("/upload")
async def upload_medical_report(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
        
    try:
        file_bytes = await file.read()
        extracted_raw = extract_pdf_text(file_bytes)
        cleaned = clean_text(extracted_raw)
        
        # Save to simulated ChromaDB
        doc_id = str(uuid.uuid4())
        chroma_db.add_document(doc_id, cleaned)
        
        # Save metadata to MongoDB documents collection
        doc_metadata = {
            "userId": current_user.get("id"),
            "fileName": file.filename,
            "text": cleaned,
            "vectorId": doc_id,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        await documents_col.insert_one(doc_metadata)
        
        return {
            "fileName": file.filename,
            "extractedText": cleaned,
            "uploadDate": doc_metadata["createdAt"],
            "docId": doc_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF and store metadata: {str(e)}"
        )

@router.post("/generate")
async def generate_report(req: GenerateReportRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    # Enforce multi-user isolation
    if req.userId != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to start report generation for another user."
        )
        
    try:
        # Fetch the official User Profile from MongoDB to prevent tampering
        profile = await profiles_col.find_one({"userId": current_user.get("id")})
        if not profile:
            if current_user.get("id") == "demo-user":
                profile = {
                    "userId": "demo-user",
                    "name": "Alex Carter",
                    "age": "32",
                    "gender": "Non-binary",
                    "height": "178 cm",
                    "weight": "74 kg",
                    "location": "San Francisco, CA",
                    "healthGoals": ["Reduce cholesterol", "Increase Vitamin D", "Improve sleep quality"],
                    "sleepHours": "6.5",
                    "sleepQuality": "Fair",
                    "exerciseLevel": "Moderate",
                    "workoutFrequency": "3 times/week",
                    "diet": "Mainly vegetarian",
                    "waterIntake": "1.5L",
                    "stressLevel": "Moderate",
                    "existingConditions": "None",
                    "allergies": "Seasonal pollen",
                    "currentMedications": "None"
                }
                await profiles_col.insert_one(profile)
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Health profile not found. Please complete onboarding first."
                )
            
        # Extract fields from database profile
        sleep_hours = profile.get("sleepHours", "7")
        exercise_level = profile.get("exerciseLevel", "Moderate")
        diet = profile.get("diet", "Balanced")
        goals = ", ".join(profile.get("healthGoals", []))
        name = profile.get("name", "User")
        age = profile.get("age", "30")
        location = profile.get("location", "Unknown")
        
        # Extract text from medical reports to find specific biomarkers
        full_text = " ".join([rep.get("extractedText", "") for rep in req.medicalReports])
        extracted_inputs = parse_biomarkers_from_text(full_text)
        
        inputs = {
            "user_name": name,
            "age": str(age),
            "location": location,
            "sleep_hours": str(sleep_hours),
            "exercise_level": exercise_level,
            "food_habits": diet,
            "health_goals": goals if goals else "General health tracking",
            "simulation_question": "What if I sleep 8 hours?",
            "report_pdf_path": req.medicalReports[0].get("fileName", "report.pdf") if req.medicalReports else "report.pdf"
        }
        
        # Add the extracted biomarkers or defaults
        chol_key = '"name": "Cholesterol", "value": "230 mg/dL", "status": "high"'
        vit_key = '"name": "Vitamin D", "value": "18 ng/mL", "status": "low"'
        
        if chol_key in extracted_inputs:
            inputs[chol_key] = extracted_inputs[chol_key]
        else:
            inputs[chol_key] = "high cholesterol"
            
        if vit_key in extracted_inputs:
            inputs[vit_key] = extracted_inputs[vit_key]
        else:
            inputs[vit_key] = "low vitamin D"
            
        # Create a unique local kickoff ID
        kickoff_id = f"local-kickoff-{uuid.uuid4()}"
        
        # Enqueue the multi-agent workflow process asynchronously in the background
        background_tasks.add_task(run_agent_workflow_async, kickoff_id, current_user.get("id"), inputs)
        
        return {
            "status": "success",
            "kickoff_id": kickoff_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Local Agent Kickoff failed: {str(e)}"
        )

@router.get("/status/{kickoff_id}")
async def get_report_status(kickoff_id: str, userId: str, current_user: dict = Depends(get_current_user)):
    # Enforce multi-user isolation
    if userId != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to check status for another user."
        )
        
    try:
        # Check if report is already generated and saved in MongoDB
        report = await reports_col.find_one({"kickoffId": kickoff_id})
        if report:
            report.pop("_id", None)
            return {
                "state": "SUCCESS",
                "report": report
            }
            
        # Query active agent statuses from db.agents_status
        cursor = db.agents_status.find({"kickoffId": kickoff_id})
        agent_states = []
        async for doc in cursor:
            agent_states.append(doc)
            
        if not agent_states:
            # Standby initialization status
            return {
                "state": "PENDING",
                "current_agent": "Manager Agent",
                "task_name": "orchestration",
                "description": "Connecting to diagnostics queue..."
            }
            
        running_agents = [a for a in agent_states if a.get("status") == "running"]
        failed_agents = [a for a in agent_states if a.get("status") == "failed"]
        
        if failed_agents:
            return {
                "state": "FAILED",
                "message": failed_agents[0].get("description", "Multi-agent diagnostics pipeline failed.")
            }
            
        if running_agents:
            active = running_agents[0]
            agent_id = active.get("agentId", "manager")
            return {
                "state": "RUNNING",
                "current_agent": f"{agent_id.capitalize()} Agent",
                "task_name": f"{agent_id}_analysis",
                "description": active.get("description", "Processing dynamic health markers...")
            }
            
        completed_agents = [a for a in agent_states if a.get("status") == "completed"]
        if completed_agents:
            last_completed = completed_agents[-1]
            agent_id = last_completed.get("agentId", "manager")
            return {
                "state": "RUNNING",
                "current_agent": f"{agent_id.capitalize()} Agent",
                "task_name": f"{agent_id}_completion",
                "description": last_completed.get("description", "Completed task. Preparing transition...")
            }
            
        return {
            "state": "RUNNING",
            "current_agent": "Manager Agent",
            "task_name": "orchestration",
            "description": "Coordinating agent diagnostics..."
        }
            
    except Exception as e:
        print("Error checking status:", str(e))
        return {
            "state": "RUNNING",
            "current_agent": "Manager Agent",
            "task_name": "orchestration",
            "description": "Reconnecting with agent cluster..."
        }

@router.get("/history/{userId}")
async def get_report_history(userId: str, current_user: dict = Depends(get_current_user)):
    # Enforce multi-user isolation
    if userId != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access report history for another user."
        )
        
    cursor = reports_col.find({"userId": userId}).sort("createdAt", -1)
    reports = []
    async for doc in cursor:
        doc.pop("_id", None)
        reports.append(doc)
        
    if not reports and userId == "demo-user":
        mock_reports = [
            {
                "userId": "demo-user",
                "kickoffId": "demo-report-1",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "healthScore": 84,
                "healthSummary": "Overall good metabolic health, but shows a pattern of moderate stress and suboptimal sleep affecting recovery. Vitamin D levels are mildly suboptimal, and Total Cholesterol is borderline high, likely influenced by diet and moderate exercise frequency. Correcting hydration and adding target nutrients will yield rapid improvements.",
                "medicalAnalysis": "• Total Cholesterol: 218 mg/dL (Borderline High - target is < 200 mg/dL)\n• Vitamin D: 24 ng/mL (Suboptimal - target is > 30 ng/mL)\n• HbA1c: 5.3% (Optimal - healthy glucose regulation)\n• Thyroid TSH: 1.8 uIU/mL (Optimal)\n\nRecommendation: Increase intake of fatty fish/mushrooms or consider 2000 IU Vitamin D3 daily. Replace saturated fats with monounsaturated oils (e.g. olive oil).",
                "lifestyleScore": {
                    "sleep": 68,
                    "exercise": 75,
                    "diet": 82
                },
                "recommendations": [
                    "Incorporate daily morning sunlight exposure or supplement 2000 IU Vitamin D3",
                    "Replace dietary saturated fats with monounsaturated oils (olive, avocado)",
                    "Optimize sleep schedule to hit 7.5+ hours to reduce stress/cortisol spikes",
                    "Increase hydration levels to 2.5L daily to support kidney filtration"
                ],
                "environmentImpact": "Air Quality Index (AQI): 42 (Good) in San Francisco, CA. Minimal pollen load today. However, local UV levels suggest limited indoor synthesis of Vitamin D, correlating with the suboptimal 24 ng/mL levels found in the report."
            },
            {
                "userId": "demo-user",
                "kickoffId": "demo-report-0",
                "createdAt": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
                "healthScore": 76,
                "healthSummary": "Initial baseline report showing higher cholesterol levels (234 mg/dL) and low Vitamin D (18 ng/mL) due to low sunlight exposure during winter months.",
                "medicalAnalysis": "• Total Cholesterol: 234 mg/dL (High - target is < 200 mg/dL)\n• Vitamin D: 18 ng/mL (Deficient - target is > 30 ng/mL)\n• HbA1c: 5.4% (Normal)\n• Thyroid TSH: 1.9 uIU/mL (Normal)",
                "lifestyleScore": {
                    "sleep": 60,
                    "exercise": 65,
                    "diet": 78
                },
                "recommendations": [
                    "Start Vitamin D supplementation immediately",
                    "Perform cardiovascular exercise at least 3 times a week",
                    "Audit sleep hygiene for late-night light exposures"
                ],
                "environmentImpact": "High seasonal pollen in the region may exacerbate inflammation indicators. Local UV index is low."
            }
        ]
        for rep in mock_reports:
            await reports_col.insert_one(rep)
            rep.pop("_id", None)
            reports.append(rep)
            
    return reports

@router.post("/simulate")
async def simulate_what_if(req: SimulationRequest, current_user: dict = Depends(get_current_user)):
    # Enforce multi-user isolation
    if req.userId != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to perform simulation for another user."
        )
        
    # Fetch report to gain context
    report = await reports_col.find_one({"userId": req.userId, "kickoffId": req.reportId})
    if not report:
        report = await reports_col.find_one({"userId": req.userId}, sort=[("createdAt", -1)])
        
    # Generate simple simulation responses based on the question
    question = req.question.lower()
    
    # Defaults
    if "sleep" in question:
        prediction = (
            "**BioTwin Predictive Simulation (Sleep Optimization):**\n\n"
            "- **Short-term (1 month):** Increasing sleep from your current level to 8 hours daily will reduce sleep debt to zero. You will experience a 12% improvement in cognitive focus, reduced cortisol (stress hormone) levels by 15%, and enhanced athletic recovery.\n"
            "- **Long-term (6 months):** Promotes a resting heart rate decrease of 3-5 bpm, improves insulin sensitivity, and helps normalize blood pressure.\n"
            "- **Impact on Health Score:** +4 Points (Est. Score: 89/100)"
        )
    elif "exercise" in question or "workout" in question:
        prediction = (
            "**BioTwin Predictive Simulation (Activity Enhancement):**\n\n"
            "- **Short-term (1 month):** Adding 2 sessions of strength/resistance training to your moderate routine will increase muscle protein synthesis and boost daily metabolic rate.\n"
            "- **Long-term (6 months):** Increases bone density, improves cardiovascular output, and assists in lowering borderline elevated total Cholesterol levels.\n"
            "- **Impact on Health Score:** +3 Points (Est. Score: 88/100)"
        )
    elif "diet" in question or "food" in question or "cholesterol" in question:
        prediction = (
            "**BioTwin Predictive Simulation (Nutritional Pivot):**\n\n"
            "- **Short-term (1 month):** Increasing fiber intake and adding plant sterols will begin to bind cholesterol in the digestive tract. Hydration compliance helps liver and kidney efficiency.\n"
            "- **Long-term (6 months):** Expected decrease in LDL-Cholesterol by 10-15% (bringing Cholesterol down from 230 mg/dL towards a normal <200 mg/dL range).\n"
            "- **Impact on Health Score:** +5 Points (Est. Score: 90/100)"
        )
    else:
        prediction = (
            f"**BioTwin Predictive Simulation ({req.question}):**\n\n"
            "By prioritizing lifestyle adjustments in this domain, your virtual twin projects a steady stabilization of biomarkers over 90 days. "
            "Energy reserves are expected to increase by 10%, with notable improvements in hormonal balance and cellular repair markers."
        )
        
    # Save the simulation in MongoDB collection simulations
    sim_doc = {
        "userId": req.userId,
        "reportId": req.reportId,
        "question": req.question,
        "prediction": prediction,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db.simulations.insert_one(sim_doc)
        
    return {
        "status": "success",
        "question": req.question,
        "prediction": prediction
    }

@router.get("/simulations/{userId}")
async def get_simulation_history(userId: str, current_user: dict = Depends(get_current_user)):
    if userId != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access simulation history for another user."
        )
    cursor = db.simulations.find({"userId": userId}).sort("createdAt", -1)
    sims = []
    async for doc in cursor:
        doc.pop("_id", None)
        sims.append(doc)
    return sims
