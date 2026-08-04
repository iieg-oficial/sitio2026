import os
import boto3
from botocore.client import Config
import sys

from app.core.settings import get_settings
settings = get_settings()

print(f"Using Endpoint: {settings.acervo_s3_url}")
print(f"Using Access Key: {settings.acervo_access_key}")
print(f"Using Secret Key: {settings.acervo_secret_key}")
print(f"Using API Key: {settings.acervo_api_key}")
print(f"Using API Key Header: {settings.acervo_api_key_header}")

config = Config(signature_version="s3v4", s3={"addressing_style": "path"})
client = boto3.client(
    "s3",
    endpoint_url=settings.acervo_s3_url,
    aws_access_key_id=settings.acervo_access_key,
    aws_secret_access_key=settings.acervo_secret_key,
    region_name=settings.acervo_region,
    config=config,
    verify=settings.acervo_verify_ssl,
)

if settings.acervo_api_key:
    def inject_api_key(request, **kwargs):
        header_name = getattr(settings, "acervo_api_key_header", "x-api-key")
        request.headers[header_name] = settings.acervo_api_key
        print(f"Injected header {header_name}: {settings.acervo_api_key}")
    client.meta.events.register('before-send.s3', inject_api_key)

try:
    response = client.list_objects_v2(Bucket=settings.acervo_bucket_name)
    print("SUCCESS!")
except Exception as e:
    print(f"FAILED: {e}")
