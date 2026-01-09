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
    request_body: Optional[Any] = None

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

def generate_sample_from_schema(schema: Any, depth: int = 0) -> Any:
    """Generate a sample object from an OpenAPI schema."""
    if depth > 5:
        return None
        
    if not isinstance(schema, dict):
        return None

    # Priority 0: Direct default
    if "default" in schema:
        return schema["default"]

    # Priority 1: Direct example
    if "example" in schema:
        return schema["example"]
    
    # Priority 2: List of examples (OpenAPI 3.x)
    if "examples" in schema:
        examples = schema["examples"]
        if isinstance(examples, list) and len(examples) > 0:
            return examples[0]
        if isinstance(examples, dict) and len(examples) > 0:
            # OpenAPI 3.x examples can be a map where each value is an object with a 'value' field
            first_example = list(examples.values())[0]
            if isinstance(first_example, dict) and "value" in first_example:
                return first_example["value"]
            return first_example

    schema_type = schema.get("type")
    
    if schema_type == "object":
        properties = schema.get("properties", {})
        sample = {}
        for prop_name, prop_schema in properties.items():
            sample[prop_name] = generate_sample_from_schema(prop_schema, depth + 1)
        return sample
    elif schema_type == "array":
        items = schema.get("items", {})
        return [generate_sample_from_schema(items, depth + 1)]
    elif schema_type == "string":
        format_ = schema.get("format")
        if format_ == "date-time":
            return "2024-01-01T12:00:00Z"
        if format_ == "date":
            return "2024-01-01"
        if format_ == "email":
            return "user@example.com"
        if format_ == "uuid":
            return "123e4567-e89b-12d3-a456-426614174000"
        return "sample_string"
    elif schema_type == "integer":
        return 1
    elif schema_type == "number":
        return 1.0
    elif schema_type == "boolean":
        return True
    
    # Fallback for enum
    if "enum" in schema and isinstance(schema["enum"], list) and len(schema["enum"]) > 0:
        return schema["enum"][0]
    
    return None

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
            request_body_sample = None
            if isinstance(request_body_info, dict):
                content = request_body_info.get("content", {})
                if isinstance(content, dict):
                    # Prefer application/json
                    json_content = content.get("application/json") or content.get("multipart/form-data") or next(iter(content.values()), None)
                    if isinstance(json_content, dict):
                        schema = json_content.get("schema")
                        if schema:
                            resolved_schema = resolve_ref(spec, schema)
                            # First check if there is an example at the content level
                            request_body_sample = json_content.get("example")
                            if request_body_sample is None:
                                examples = json_content.get("examples")
                                if isinstance(examples, dict) and len(examples) > 0:
                                    # Take the first example
                                    first_example = next(iter(examples.values()))
                                    if isinstance(first_example, dict) and "value" in first_example:
                                        request_body_sample = first_example["value"]
                                    else:
                                        request_body_sample = first_example
                            
                            # If no example at content level, generate from schema
                            if request_body_sample is None:
                                request_body_sample = generate_sample_from_schema(resolved_schema)

            endpoints.append(EndpointInfo(
                path=path,
                method=method.upper(),
                summary=str(operation.get("summary") or operation.get("description", "")),
                parameters=parsed_params,
                request_body=request_body_sample if request_body_sample is not None else None
            ))

    logger.info(f"Successfully parsed {len(endpoints)} endpoints")
    return endpoints
