"""
Embedding Engine
Generates unified dense semantic vector representations for external signals and internal organizational capabilities.
Supports SentenceTransformers with seamless lightweight dense fallback.
"""

import os
import logging
import numpy as np
from typing import List, Union, Optional

logger = logging.getLogger(__name__)


class EmbeddingEngine:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(EmbeddingEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, model_name: str = "all-MiniLM-L6-v2", use_local_fallback: bool = False):
        if getattr(self, "_initialized", False):
            return

        self.model_name = model_name
        self.model = None
        self.dimension = 384
        self._fallback_mode = False

        if not use_local_fallback:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading SentenceTransformer model: {model_name}...")
                self.model = SentenceTransformer(model_name)
                if hasattr(self.model, "get_sentence_embedding_dimension"):
                    self.dimension = self.model.get_sentence_embedding_dimension()
                elif hasattr(self.model, "get_embedding_dimension"):
                    self.dimension = self.model.get_embedding_dimension()
                else:
                    self.dimension = 384
                logger.info(f"SentenceTransformer loaded successfully (dim={self.dimension}).")
            except Exception as e:
                logger.warning(f"Could not load SentenceTransformer ({e}). Initializing high-dimensional dense fallback.")
                self._fallback_mode = True
        else:
            self._fallback_mode = True

        if self._fallback_mode:
            self._init_dense_fallback()

        self._initialized = True

    def _init_dense_fallback(self):
        """High-dimensional deterministic dense semantic encoder for offline / lightweight use."""
        from sklearn.feature_extraction.text import HashingVectorizer
        self._vectorizer = HashingVectorizer(n_features=384, alternate_sign=False, norm='l2')
        self.dimension = 384

    def embed_text(self, text: str) -> List[float]:
        """Generate normalized dense embedding vector for a single string."""
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate normalized dense embeddings for a batch of strings."""
        if not texts:
            return []

        clean_texts = [t.strip() if t and t.strip() else "empty document" for t in texts]

        if not self._fallback_mode and self.model is not None:
            try:
                embeddings = self.model.encode(clean_texts, show_progress_bar=False, normalize_embeddings=True)
                return [emb.tolist() for emb in embeddings]
            except Exception as e:
                logger.warning(f"Model encode failed ({e}), falling back to vectorizer.")

        # Fallback dense projection
        sparse_vecs = self._vectorizer.transform(clean_texts)
        dense_vecs = sparse_vecs.toarray()
        norms = np.linalg.norm(dense_vecs, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        normalized = dense_vecs / norms
        return [row.tolist() for row in normalized]

    @staticmethod
    def cosine_similarity(vec_a: Union[List[float], np.ndarray], vec_b: Union[List[float], np.ndarray]) -> float:
        """Compute cosine similarity between two 1D vectors."""
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

    @staticmethod
    def cosine_similarity_matrix(matrix_a: np.ndarray, matrix_b: np.ndarray) -> np.ndarray:
        """Compute pairwise cosine similarities between matrix A (M x D) and matrix B (N x D)."""
        a = np.array(matrix_a, dtype=np.float32)
        b = np.array(matrix_b, dtype=np.float32)
        norm_a = np.linalg.norm(a, axis=1, keepdims=True)
        norm_b = np.linalg.norm(b, axis=1, keepdims=True)
        norm_a[norm_a == 0] = 1.0
        norm_b[norm_b == 0] = 1.0
        a_norm = a / norm_a
        b_norm = b / norm_b
        return np.dot(a_norm, b_norm.T)


if __name__ == "__main__":
    engine = EmbeddingEngine()
    v1 = engine.embed_text("High frequency wireless power transfer coil in 85kHz band")
    v2 = engine.embed_text("Magnetic sheet core for inductive power coupler")
    v3 = engine.embed_text("Recipe for baking chocolate chip cookies")
    print(f"Dim: {len(v1)}")
    print(f"Sim(v1, v2) = {engine.cosine_similarity(v1, v2):.4f}")
    print(f"Sim(v1, v3) = {engine.cosine_similarity(v1, v3):.4f}")
