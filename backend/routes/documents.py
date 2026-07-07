from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends, Form
from typing import List
import uuid
from datetime import datetime

from backend.database import documents_col
from backend.services.pdf_parser import extract_pdf_text, clean_text, chroma_db
from backend.services.supabase_helper import get_current_user

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    reportType: str = Form("Blood Test"),
    hospitalLab: str = Form(""),
    doctorName: str = Form(""),
    current_user: dict = Depends(get_current_user)
):
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
            "reportType": reportType,
            "hospitalLab": hospitalLab,
            "doctorName": doctorName,
            "createdAt": datetime.utcnow().isoformat()
        }
        await documents_col.insert_one(doc_metadata)
        
        return {
            "fileName": file.filename,
            "extractedText": cleaned,
            "uploadDate": doc_metadata["createdAt"],
            "docId": doc_id,
            "reportType": reportType,
            "hospitalLab": hospitalLab,
            "doctorName": doctorName
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process and store PDF metadata: {str(e)}"
        )

@router.get("/")
async def get_documents(current_user: dict = Depends(get_current_user)):
    try:
        cursor = documents_col.find({"userId": current_user.get("id")}).sort("createdAt", -1)
        docs = []
        async for doc in cursor:
            doc.pop("_id", None)
            docs.append(doc)
        return docs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user documents: {str(e)}"
        )

@router.delete("/{docId}")
async def delete_document(docId: str, current_user: dict = Depends(get_current_user)):
    try:
        res = await documents_col.delete_one({"userId": current_user.get("id"), "vectorId": docId})
        if res.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or unauthorized to delete."
            )
        return {"status": "success", "message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )
