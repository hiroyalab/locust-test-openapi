import yaml
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ParameterInfo(BaseModel):
    name: Optional[str] = None
    in_: Optional[str] = None
    required: bool = False
    schema_type: str = "string"
    description: Optional[str] = None
    example: Optional[Any] = None

class EndpointInfo(BaseModel):
    path: str
    method: str
    summary: Optional[str] = None
    parameters: List[ParameterInfo] = []
    request_body: Optional[Dict[str, Any]] = None

def resolve_ref(spec: Dict[str, Any], schema: Any, depth: int = 0) -> Any:
    """Recursively resolve $ref in the OpenAPI spec."""
    if depth > 10:  # Prevent infinite recursion
        return schema
        
    if isinstance(schema, list):
        return [resolve_ref(spec, item, depth + 1) for item in schema]
        
    if not isinstance(schema, dict):
        return schema
        
    if "$ref" in schema:
        ref_path = schema["$ref"]
        if not ref_path.startswith("#/"):
            return schema
            
        parts = ref_path.split("/")[1:]
        current = spec
        try:
            for part in parts:
                if isinstance(current, dict) and part in current:
                    current = current[part]
                elif isinstance(current, list) and part.isdigit():
                    current = current[int(part)]
                else:
                    logger.warning(f"Could not resolve ref part: {part} in {ref_path}")
                    return schema
            return resolve_ref(spec, current, depth + 1)
        except Exception as e:
            logger.error(f"Error resolving ref {ref_path}: {e}")
            return schema
            
    # If not a ref, still need to resolve refs inside the dictionary
    return {k: resolve_ref(spec, v, depth + 1) for k, v in schema.items()}

def parse_openapi(yaml_content: str) -> List[EndpointInfo]:
    try:
        spec = yaml.safe_load(yaml_content)
    except Exception as e:
        logger.error(f"YAML load error: {e}")
        raise ValueError(f"Invalid YAML format: {e}")

    if not isinstance(spec, dict):
        raise ValueError("OpenAPI spec must be a dictionary")

    endpoints = []
    paths = spec.get("paths", {})
    if not isinstance(paths, dict):
        logger.warning("No 'paths' object found in spec or it's not a dictionary")
        return []

    for path, path_item in paths.items():
        # A path item can be a reference itself
        path_item = resolve_ref(spec, path_item)
        if not isinstance(path_item, dict):
            continue

        # Extract path-level parameters
        global_params = path_item.get("parameters", [])
        if not isinstance(global_params, list):
            global_params = []

        for method in ["get", "post", "put", "delete", "patch"]:
            operation = path_item.get(method)
            if not operation or not isinstance(operation, dict):
                continue

            # operation level parameters
            local_params = operation.get("parameters", [])
            if not isinstance(local_params, list):
                local_params = []

            # Combine and resolve parameters
            all_params = global_params + local_params
            parsed_params = []
            for p in all_params:
                p = resolve_ref(spec, p)
                if not isinstance(p, dict):
                    continue
                
                name = p.get("name")
                if not name:
                    continue
                
                p_in = p.get("in", "query")
                schema = p.get("schema", {})
                schema = resolve_ref(spec, schema)
                schema_type = schema.get("type", "string") if isinstance(schema, dict) else "string"

                example = p.get("example")
                if example is None and isinstance(schema, dict):
                    example = schema.get("example")

                parsed_params.append(ParameterInfo(
                    name=name,
                    in_=p_in,
                    required=bool(p.get("required", False)),
                    schema_type=str(schema_type),
                    description=p.get("description"),
                    example=example
                ))

            # Resolve requestBody
            request_body_info = operation.get("requestBody")
            request_body_info = resolve_ref(spec, request_body_info)
            request_body_schema = None
            if isinstance(request_body_info, dict):
                content = request_body_info.get("content", {})
                if isinstance(content, dict):
                    json_content = content.get("application/json") or content.get("multipart/form-data")
                    if isinstance(json_content, dict):
                        request_body_schema = resolve_ref(spec, json_content.get("schema"))

            endpoints.append(EndpointInfo(
                path=path,
                method=method.upper(),
                summary=str(operation.get("summary") or operation.get("description", "")),
                parameters=parsed_params,
                request_body=request_body_schema if isinstance(request_body_schema, dict) else None
            ))

    logger.info(f"Successfully parsed {len(endpoints)} endpoints")
    return endpoints
