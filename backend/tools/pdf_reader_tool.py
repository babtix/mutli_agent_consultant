import pypdf
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import Dict
from dependencies import get_current_user

router = APIRouter(prefix="/tools/pdf", tags=["Tools"])

@router.post("/extract-text")
async def extract_pdf_text(
    file: UploadFile = File(..., description="Fichier PDF à lire en mémoire"),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Le fichier doit avoir l'extension .pdf")
        
    try:
        pdf_reader = pypdf.PdfReader(file.file)
        
        extracted_text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            
            # Simple fallback / format normalization 
            if text:
                extracted_text += text.strip() + "\n\n"
                
        return {
            "status": "success",
            "filename": file.filename,
            "pages_count": len(pdf_reader.pages),
            "text": extracted_text.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Échec de lecture ou extraction de texte du PDF: {str(e)}")
