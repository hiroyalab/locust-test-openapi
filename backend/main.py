from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import yaml
import os
import subprocess
import signal
from jinja2 import Environment, FileSystemLoader
from app.services.openapi import parse_openapi, EndpointInfo

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demonstration (in real app, use a DB)
current_spec = []
running_process = None

class ScenarioConfig(BaseModel):
    path: str
    method: str
    weight: int = 1
    path_params: Dict[str, str] = {}
    query_params: Dict[str, str] = {}
    headers: Dict[str, str] = {}
    body: Optional[Dict[str, Any]] = None

class RunConfig(BaseModel):
    wait_min: int = 1
    wait_max: int = 5
    scenarios: List[ScenarioConfig]
    host: str

@app.post("/upload")
async def upload_openapi(file: UploadFile = File(...)):
    content = await file.read()
    try:
        endpoints = parse_openapi(content.decode())
        global current_spec
        current_spec = endpoints
        return {"endpoints": endpoints}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/run")
async def run_test(config: RunConfig):
    global running_process
    
    if running_process and running_process.poll() is None:
        # Stop existing
        os.kill(running_process.pid, signal.SIGTERM)
        
    # Generate locustfile.py
    env = Environment(loader=FileSystemLoader("templates"))
    
    # Custom filter to handle strings vs code snippets (fake.*)
    def pythonize_filter(val):
        if not val:
            return "''"
        if isinstance(val, str) and val.startswith("fake."):
            return val
        return repr(val)
    
    env.filters['pythonize'] = pythonize_filter
    
    template = env.get_template("locustfile.j2")
    
    rendered_content = template.render(
        wait_min=config.wait_min,
        wait_max=config.wait_max,
        scenarios=config.scenarios
    )
    
    with open("backend/data/dynamic_locustfile.py", "w") as f:
        f.write(rendered_content)
        
    # Start locust
    cmd = [
        "uv", "run", "locust", 
        "-f", "backend/data/dynamic_locustfile.py", 
        "--host", config.host,
        "--web-port", "8089"
    ]
    
    running_process = subprocess.Popen(cmd)
    
    return {"message": "Locust started", "locust_ui": "http://localhost:8089"}

@app.post("/stop")
async def stop_test():
    global running_process
    if running_process and running_process.poll() is None:
        os.kill(running_process.pid, signal.SIGTERM)
        running_process = None
        return {"message": "Locust stopped"}
    return {"message": "No process running"}

@app.get("/status")
async def get_status():
    global running_process
    is_running = running_process and running_process.poll() is None
    return {"is_running": is_running}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
