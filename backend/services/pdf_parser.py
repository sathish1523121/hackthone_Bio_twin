import fitz  # PyMuPDF
import re
import os
import json
import math

class SimpleTextSplitter:
    def __init__(self, chunk_size=1000, chunk_overlap=200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_text(self, text: str):
        chunks = []
        words = text.split()
        current_chunk = []
        current_length = 0
        
        for word in words:
            current_chunk.append(word)
            current_length += len(word) + 1  # count space
            if current_length >= self.chunk_size:
                chunks.append(" ".join(current_chunk))
                # Retain overlap words
                overlap_words = current_chunk[-max(1, int(len(current_chunk) * (self.chunk_overlap / self.chunk_size))):]
                current_chunk = overlap_words
                current_length = sum(len(w) + 1 for w in current_chunk)
                
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        return chunks

def extract_pdf_text(file_bytes: bytes) -> str:
    """Extracts text from PDF bytes using PyMuPDF (fitz)"""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    return full_text

def clean_text(text: str) -> str:
    """Performs text cleaning on extracted PDF text"""
    # Remove extra blank lines and clean whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

# Lightweight Vector DB Simulator (ChromaDB Mock)
class MockChromaDB:
    def __init__(self, db_path="chromadb_mock.json"):
        self.db_path = db_path
        self.data = {}
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, "r") as f:
                    self.data = json.load(f)
            except Exception:
                self.data = {}

    def save(self):
        with open(self.db_path, "w") as f:
            json.dump(self.data, f)

    def add_document(self, doc_id: str, text: str):
        splitter = SimpleTextSplitter()
        chunks = splitter.split_text(text)
        
        self.data[doc_id] = {
            "full_text": text,
            "chunks": chunks
        }
        self.save()

    def get_document(self, doc_id: str):
        return self.data.get(doc_id)

    def search(self, doc_id: str, query: str, top_k=2):
        doc = self.get_document(doc_id)
        if not doc:
            return []
        
        chunks = doc.get("chunks", [])
        if not chunks:
            return []
            
        # Standard Term Frequency calculation for matching
        query_words = set(re.findall(r'\w+', query.lower()))
        scored_chunks = []
        for i, chunk in enumerate(chunks):
            chunk_words = re.findall(r'\w+', chunk.lower())
            score = 0
            for qw in query_words:
                score += chunk_words.count(qw)
            scored_chunks.append((score, chunk))
            
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk for score, chunk in scored_chunks[:top_k]]

chroma_db = MockChromaDB()
