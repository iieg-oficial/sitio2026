from app.api.deps import verify_csrf
from app.api.routes import media


def test_upload_html_file(client, db_session, admin_user, monkeypatch):
    class FakeAcervoService:
        async def upload_file(self, file, object_name, bucket=None):
            return f"https://acervo.test/{bucket}/{object_name}", "text/html"

    client.app.dependency_overrides[verify_csrf] = lambda: admin_user
    monkeypatch.setattr(media, "get_acervo_service", FakeAcervoService)

    response = client.post(
        "/api/sitio-admin/multimedia",
        files={"file": ("reporte.html", b"<!doctype html><html></html>", "text/html")},
    )

    assert response.status_code == 201
    assert response.json()["type"] == "text/html"
