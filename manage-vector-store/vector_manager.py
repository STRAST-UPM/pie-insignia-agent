"""
Unified vector store management utility.
Consolidates all vector store operations into a single, clean interface.
"""

import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class VectorStoreManager:
    """Manages OpenAI vector store operations."""
    
    def __init__(self, client: Optional[OpenAI] = None):
        self.client = client or OpenAI()
    
    def upload_files(self, directory_path: str) -> List[str]:
        """Upload all files from directory and return file IDs."""
        if not os.path.exists(directory_path):
            raise FileNotFoundError(f"Directory not found: {directory_path}")
        
        files_to_upload = [
            os.path.join(directory_path, f) 
            for f in os.listdir(directory_path) 
            if os.path.isfile(os.path.join(directory_path, f))
        ]
        
        if not files_to_upload:
            logger.warning(f"No files found in directory: {directory_path}")
            return []
        
        uploaded_files = []
        for file_path in files_to_upload:
            try:
                with open(file_path, "rb") as file:
                    uploaded_file = self.client.files.create(file=file, purpose="assistants")
                    uploaded_files.append(uploaded_file.id)
                    logger.info(f"Uploaded: {file_path} -> {uploaded_file.id}")
            except Exception as e:
                logger.error(f"Failed to upload {file_path}: {e}")
        
        return uploaded_files
    
    def upload_single_file(self, file_path: str) -> str:
        """Upload a single file and return file ID."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        with open(file_path, "rb") as file:
            uploaded_file = self.client.files.create(file=file, purpose="assistants")
            logger.info(f"Uploaded: {file_path} -> {uploaded_file.id}")
            return uploaded_file.id
    
    def list_files(self) -> List[Dict[str, str]]:
        """List all uploaded files."""
        try:
            files = list(self.client.files.list())
            return [{"filename": file.filename, "id": file.id} for file in files]
        except Exception as e:
            logger.error(f"Failed to list files: {e}")
            return []
    
    def delete_file(self, file_id: str) -> bool:
        """Delete a file by ID."""
        try:
            self.client.files.delete(file_id)
            logger.info(f"Deleted file: {file_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete file {file_id}: {e}")
            return False
    
    def create_vector_store(self, name: str, file_ids: List[str]) -> str:
        """Create a vector store with given files."""
        if not file_ids:
            raise ValueError("No file IDs provided for vector store creation")
            
        vector_store = self.client.vector_stores.create(name=name, file_ids=file_ids)
        logger.info(f"Created vector store: {name} -> {vector_store.id}")
        return vector_store.id
    
    def list_vector_stores(self) -> List[Dict[str, Any]]:
        """List all vector stores."""
        try:
            stores = self.client.vector_stores.list()
            return [{"id": store.id, "name": store.name} for store in stores]
        except Exception as e:
            logger.error(f"Failed to list vector stores: {e}")
            return []
    
    def get_vector_store(self, vector_store_id: str) -> Dict[str, Any]:
        """Get details of a specific vector store."""
        try:
            store = self.client.vector_stores.retrieve(vector_store_id)
            return {
                "id": store.id,
                "name": store.name,
                "created_at": store.created_at,
                "file_counts": store.file_counts
            }
        except Exception as e:
            logger.error(f"Failed to get vector store {vector_store_id}: {e}")
            return {}
    
    def delete_vector_store(self, vector_store_id: str) -> bool:
        """Delete a vector store."""
        try:
            self.client.vector_stores.delete(vector_store_id)
            logger.info(f"Deleted vector store: {vector_store_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete vector store {vector_store_id}: {e}")
            return False
    
    def setup_complete_workflow(self, directory_path: str, store_name: str) -> str:
        """Complete workflow: upload files and create vector store."""
        logger.info(f"Starting complete workflow for: {store_name}")
        
        # Upload files
        file_ids = self.upload_files(directory_path)
        if not file_ids:
            raise ValueError("No files were uploaded successfully")
        
        # Create vector store
        vector_store_id = self.create_vector_store(store_name, file_ids)
        
        logger.info(f"Workflow completed. Vector store ID: {vector_store_id}")
        return vector_store_id


def main() -> int:
    """CLI interface for vector store management."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Manage OpenAI Vector Stores")
    parser.add_argument("command", choices=[
        "upload-files", "upload-file", "list-files", "delete-file",
        "create-store", "list-stores", "get-store", "delete-store", "setup"
    ])
    parser.add_argument("--path", help="File or directory path")
    parser.add_argument("--name", help="Vector store name")
    parser.add_argument("--id", help="File or vector store ID")
    parser.add_argument("--file-ids", nargs="+", help="List of file IDs")
    
    args = parser.parse_args()
    manager = VectorStoreManager()
    
    try:
        if args.command == "upload-files":
            if not args.path:
                raise ValueError("--path required for upload-files")
            file_ids = manager.upload_files(args.path)
            print(f"Uploaded files: {file_ids}")
        
        elif args.command == "upload-file":
            if not args.path:
                raise ValueError("--path required for upload-file")
            file_id = manager.upload_single_file(args.path)
            print(f"Uploaded file ID: {file_id}")
        
        elif args.command == "list-files":
            files = manager.list_files()
            if files:
                for file in files:
                    print(f"{file['filename']}: {file['id']}")
            else:
                print("No files found")
        
        elif args.command == "delete-file":
            if not args.id:
                raise ValueError("--id required for delete-file")
            success = manager.delete_file(args.id)
            print(f"Delete {'successful' if success else 'failed'}")
        
        elif args.command == "create-store":
            if not args.name or not args.file_ids:
                raise ValueError("--name and --file-ids required for create-store")
            store_id = manager.create_vector_store(args.name, args.file_ids)
            print(f"Created vector store ID: {store_id}")
        
        elif args.command == "list-stores":
            stores = manager.list_vector_stores()
            if stores:
                for store in stores:
                    print(f"{store['name']}: {store['id']}")
            else:
                print("No vector stores found")
        
        elif args.command == "get-store":
            if not args.id:
                raise ValueError("--id required for get-store")
            store = manager.get_vector_store(args.id)
            if store:
                print(f"Store details: {store}")
            else:
                print("Vector store not found")
        
        elif args.command == "delete-store":
            if not args.id:
                raise ValueError("--id required for delete-store")
            success = manager.delete_vector_store(args.id)
            print(f"Delete {'successful' if success else 'failed'}")
        
        elif args.command == "setup":
            if not args.path or not args.name:
                raise ValueError("--path and --name required for setup")
            store_id = manager.setup_complete_workflow(args.path, args.name)
            print(f"Setup complete. Vector store ID: {store_id}")
    
    except Exception as e:
        logger.error(f"Command failed: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
