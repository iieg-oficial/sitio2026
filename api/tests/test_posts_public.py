from app.models.posts import Posts


def test_obtener_post_por_slug_en_ruta_publica(client, db_session):
    post = Posts(
        titulo="Post de prueba",
        resumen="Resumen de prueba",
        contenido="Contenido de prueba",
        autor="IIEG",
        slug="post-de-prueba",
    )
    db_session.add(post)
    db_session.commit()
    db_session.refresh(post)

    response = client.get(f"/api/sitio/posts/{post.slug}")

    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == post.slug
    assert data["titulo"] == post.titulo
