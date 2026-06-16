import os
import shutil
import zipfile

def post_build():
    out_dir = os.path.abspath("apps/web/out")
    deploy_zip_path = os.path.abspath("apps/web/deploy.zip")
    
    print(f"Starting post-build processing in: {out_dir}")
    
    _next_dir = os.path.join(out_dir, "_next")
    next_dir = os.path.join(out_dir, "next")
    
    if os.path.exists(_next_dir):
        if os.path.exists(next_dir):
            shutil.rmtree(next_dir)
        os.rename(_next_dir, next_dir)
        print("Renamed _next directory to next")
    else:
        print("Warning: _next directory not found. Already renamed or build failed?")
        
    # Replace references in all text-based files
    extensions_to_update = {".html", ".js", ".json", ".css", ".txt"}
    
    updated_count = 0
    for root, dirs, files in os.walk(out_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in extensions_to_update:
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                    
                    # Target both absolute /_next/ and relative _next/
                    needs_write = False
                    if "_next/" in content:
                        content = content.replace("_next/", "next/")
                        needs_write = True
                    if "_next" in content:
                        # Fallback for any other raw _next occurrences that are not __next
                        # but check if they are part of __next
                        # We can be safe by only replacing _next when not prefixed by _
                        # Let's replace "/_next" with "/next"
                        if "/_next" in content:
                            content = content.replace("/_next", "/next")
                            needs_write = True
                            
                    if needs_write:
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(content)
                        updated_count += 1
                except Exception as e:
                    print(f"Error updating file {file_path}: {e}")
                    
    print(f"Updated paths in {updated_count} files.")
    
    # Create deploy.zip
    print(f"Creating zip file: {deploy_zip_path}")
    if os.path.exists(deploy_zip_path):
        os.remove(deploy_zip_path)
        
    with zipfile.ZipFile(deploy_zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(out_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, out_dir)
                z.write(file_path, arcname)
                
    print(f"Successfully created deploy.zip ({os.path.getsize(deploy_zip_path)} bytes) containing all assets!")

if __name__ == "__main__":
    post_build()
