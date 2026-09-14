import logging

import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError

boto3.set_stream_logger('botocore', logging.DEBUG)

from app.core.settings import get_settings

settings = get_settings()

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

if getattr(settings, "acervo_api_key", None):
    def inject_api_key(request, **kwargs):
        header_name = getattr(settings, "acervo_api_key_header", "x-api-key")
        request.headers[header_name] = settings.acervo_api_key
    client.meta.events.register('before-send.s3', inject_api_key)

try:
    response = client.put_object(Bucket=settings.acervo_bucket_name, Key="test.txt", Body=b"hello")
    print("SUCCESS!")
except (BotoCoreError, ClientError) as e:
    print(f"FAILED: {e}")
