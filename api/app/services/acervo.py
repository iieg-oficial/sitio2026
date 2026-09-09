from datetime import datetime
import magic
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from fastapi import UploadFile

from app.core.settings import get_settings

settings = get_settings()

PORTAL_BUCKET = "portal"

ALLOWED_MIME_TYPES = {
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/xml',
    'text/xml',
    'application/json',
    'text/csv',
    'text/plain',
}

class AcervoService:
    def __init__(self):
        endpoint_url = settings.acervo_s3_url
        config = Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
        )

        self._clients: dict[str, "boto3.client"] = {
            settings.acervo_bucket_name: boto3.client(
                "s3",
                endpoint_url=endpoint_url,
                aws_access_key_id=settings.acervo_access_key,
                aws_secret_access_key=settings.acervo_secret_key,
                region_name=settings.acervo_region,
                config=config,
                verify=settings.acervo_verify_ssl,
            ),
            settings.acervo_iieg_bucket_name: boto3.client(
                "s3",
                endpoint_url=endpoint_url,
                aws_access_key_id=settings.acervo_iieg_access_key,
                aws_secret_access_key=settings.acervo_iieg_secret_key,
                region_name=settings.acervo_region,
                config=config,
                verify=settings.acervo_verify_ssl,
            ),
        }
        self.default_bucket = settings.acervo_bucket_name

        if getattr(settings, "acervo_api_key", None):
            def inject_api_key(request, **kwargs):
                header_name = getattr(settings, "acervo_api_key_header", "x-api-key")
                request.headers[header_name] = settings.acervo_api_key
            for client in self._clients.values():
                client.meta.events.register('before-send.s3', inject_api_key)

        self._ensure_buckets_exist()

    def _ensure_buckets_exist(self):
        for bucket, client in self._clients.items():
            try:
                client.head_bucket(Bucket=bucket)
            except ClientError as e:
                code = e.response.get("Error", {}).get("Code", "")
                if code in ("404", "NoSuchBucket"):
                    try:
                        client.create_bucket(Bucket=bucket)
                    except ClientError:
                        pass

    def _client_for(self, bucket: str | None) -> tuple["boto3.client", str]:
        bucket = bucket or self.default_bucket
        if bucket not in self._clients:
            raise ValueError(f"Bucket no configurado: {bucket}")
        return self._clients[bucket], bucket

    @staticmethod
    def get_validated_content_type(file_bytes: bytes) -> str:
        """Analiza los magic bytes del archivo e identifica el Content-Type real."""
        mime = magic.Magic(mime=True)
        detected_type = mime.from_buffer(file_bytes)
        
        if detected_type not in ALLOWED_MIME_TYPES:
            raise ValueError(f"Tipo de archivo no permitido o no soportado: {detected_type}")
            
        return detected_type
    
    async def upload_file(
        self, file: UploadFile, object_name: str, bucket: str | None = None
    ) -> tuple[str, str]:
        """
        Sube un archivo desinfectado/validado a S3.
        Devuelve una tupla (url, validated_content_type).
        """
        client, bucket_name = self._client_for(bucket)
        try:
            file_data = await file.read()
            
            # 1. Obtener y validar el tipo MIME real leyendo los bytes
            validated_content_type = self.get_validated_content_type(file_data)

            # 2. Subir a S3 asignando el ContentType validado
            client.put_object(
                Bucket=bucket_name,
                Key=object_name,
                Body=file_data,
                ContentType=validated_content_type
            )
            
            # Resetear el puntero del archivo UploadFile por buena práctica
            await file.seek(0)
            
            file_url = self.get_file_url(object_name, bucket=bucket_name)
            return file_url, validated_content_type

        except ClientError as e:
            raise Exception(f"Error uploading file to S3: {str(e)}")

    def delete_file(self, object_name: str, bucket: str | None = None) -> bool:
        client, bucket_name = self._client_for(bucket)
        try:
            client.delete_object(Bucket=bucket_name, Key=object_name)
            return True
        except ClientError:
            return False

    def get_file_url(self, object_name: str, bucket: str | None = None) -> str:
        _, bucket_name = self._client_for(bucket)
        scheme = "https" if settings.acervo_use_ssl else "http"
        return f"{scheme}://{settings.acervo_public_endpoint}/{bucket_name}/{object_name}"

    def list_objects(self, bucket: str | None = None, prefix: str | None = None) -> list[dict]:
        client, bucket_name = self._client_for(bucket)
        paginator = client.get_paginator("list_objects_v2")
        kwargs = {"Bucket": bucket_name}
        if prefix:
            kwargs["Prefix"] = prefix

        result = []
        for page in paginator.paginate(**kwargs):
            for obj in page.get("Contents", []):
                result.append(
                    {
                        "name": obj["Key"],
                        "size": obj.get("Size", 0),
                        "last_modified": obj.get("LastModified") or datetime.utcnow(),
                        "etag": obj.get("ETag", "").strip('"'),
                        "content_type": None,
                        "url": self.get_file_url(obj["Key"], bucket=bucket_name),
                    }
                )
        return result


_acervo_service: AcervoService | None = None


def get_acervo_service() -> AcervoService:
    global _acervo_service
    if _acervo_service is None:
        _acervo_service = AcervoService()
    return _acervo_service