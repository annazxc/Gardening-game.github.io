# Flask API for Alice in Wonderland Vector Database

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class CustomE5Embedding(HuggingFaceEmbeddings):
    def embed_documents(self, texts):
        texts = [f"passage: {t}" for t in texts]
        return super().embed_documents(texts)
    
    def embed_query(self, text):
        return super().embed_query(f"query: {text}")

# Initialize the embedding model and load the vector database
def load_vector_db():
    try:
        embedding_model = CustomE5Embedding(model_name="intfloat/multilingual-e5-small")
        db = FAISS.load_local("wonderland_db", embedding_model, allow_dangerous_deserialization=True)
        return db
    except Exception as e:
        print(f"Error loading vector database: {e}")
        return None

vector_db = load_vector_db()

@app.route('/api/query', methods=['POST'])
def query_vector_db():
    if not vector_db:
        return jsonify({"error": "Vector database not loaded"}), 500
    
    data = request.json
    if not data or 'query' not in data:
        return jsonify({"error": "Query parameter is required"}), 400
    
    query = data['query']
    top_k = data.get('topK', 3)  # Default to 3 results if not specified
    
    try:
        # Get relevant documents from the vector store
        retriever = vector_db.as_retriever(search_kwargs={"k": top_k})
        docs = retriever.get_relevant_documents(query)
        
        # Extract and return the page content
        contexts = [doc.page_content for doc in docs]
        
        return jsonify({
            "query": query,
            "contexts": contexts
        })
    except Exception as e:
        print(f"Error processing query: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)