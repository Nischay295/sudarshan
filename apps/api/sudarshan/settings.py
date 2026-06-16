from dataclasses import dataclass
import os

# Helper to load .env file manually
def load_dotenv():
    # Search for .env in current and parent dirs up to 3 levels, and current working directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    potential_paths = [
        os.path.join(current_dir, ".env"),
        os.path.join(current_dir, "..", ".env"),
        os.path.join(current_dir, "..", "..", ".env"),
        os.path.join(current_dir, "..", "..", "..", ".env"),
        os.path.join(os.getcwd(), ".env"),
    ]
    # Use a set to avoid processing the same path multiple times
    seen_paths = set()
    for path in potential_paths:
        norm_path = os.path.abspath(path)
        if norm_path in seen_paths:
            continue
        seen_paths.add(norm_path)
        if os.path.exists(norm_path) and os.path.isfile(norm_path):
            try:
                with open(norm_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            # Strip whitespace and surrounding quotes
                            k_clean = k.strip()
                            v_clean = v.strip()
                            if (v_clean.startswith('"') and v_clean.endswith('"')) or (v_clean.startswith("'") and v_clean.endswith("'")):
                                v_clean = v_clean[1:-1]
                            # Set only if not already in environ to mimic standard dotenv behavior
                            if k_clean not in os.environ:
                                os.environ[k_clean] = v_clean
            except Exception as e:
                print(f"Error loading .env from {norm_path}: {e}")

load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_name: str = "Sudarshan API"
    api_version: str = "0.1.0"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./sudarshan.db")
    cors_origins: tuple[str, ...] = (
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    )


settings = Settings()


