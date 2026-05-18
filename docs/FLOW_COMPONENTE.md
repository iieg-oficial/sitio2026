# Flow de creación de componente

Esta guía muestra cómo crear un componente nuevo end-to-end: **DB → API → CMS → Portal web**. El ejemplo trabajado es un carrusel de banners.

> Tip: si tu dominio se parece a uno existente, copia su estructura. Casi todos los dominios siguen el mismo patrón (`posts`, `subject`, `banner`, `datos_nuevos`, `flashes`, etc.) — es la forma más rápida de empezar.

## Estructura de carpetas tocadas

```
api/
├── app/
│   ├── models/banner.py          ← SQLAlchemy
│   ├── schemas/banner.py         ← Pydantic
│   ├── api/routes/banner.py      ← CRUD admin (con auth)
│   ├── api/routes/banner_public.py  ← Lectura pública
│   └── api/routes/__init__.py    ← Registrar router
└── alembic/versions/...          ← Migración

admin/
└── src/
    ├── pages/Banner.jsx          ← Página del CMS
    ├── components/campos/banner.jsx  ← Form/campos reutilizables (opcional)
    └── router/editorRoutes.jsx   ← Registrar ruta

web/
└── src/
    └── components/home/banners.jsx  ← Componente del portal
        + registrar en BlockRenderer si va dentro de páginas dinámicas
```

## Paso 1 — Modelo (Backend)

`api/app/models/banner.py`:

```python
from sqlalchemy import Column, Integer, String, Boolean, Text
from app.core.database import Base

class Banner(Base):
    __tablename__ = "banner"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    imagen_desktop = Column(String(200), nullable=True)
    imagen_mobile = Column(String(200), nullable=True)
    link = Column(String(200), nullable=True)
    boton = Column(String(200), nullable=True)
    color_fondo = Column(String(200), nullable=True)
    full_screen = Column(Boolean, default=False)
    slug = Column(String(200), nullable=True)
```

Registra el modelo en `api/app/models/__init__.py`:

```python
from app.models.banner import Banner
__all__ = [..., "Banner"]
```

## Paso 2 — Schemas (Pydantic)

`api/app/schemas/banner.py`:

```python
from pydantic import BaseModel, ConfigDict

class BannerBase(BaseModel):
    titulo: str
    descripcion: str | None = None
    imagen_desktop: str | None = None
    imagen_mobile: str | None = None
    link: str | None = None
    boton: str | None = None
    color_fondo: str | None = None
    full_screen: bool = False

class BannerCreate(BannerBase):
    pass

class BannerOut(BannerBase):
    id: int
    slug: str | None
    model_config = ConfigDict(from_attributes=True)

class BannerResponse(BaseModel):
    banners: list[BannerOut]
    total: int
```

## Paso 3 — Migración Alembic

```bash
make shell-api
alembic revision --autogenerate -m "add banner table"
alembic upgrade head
```

Revisa la migración generada antes de aplicarla — a veces Alembic no detecta todos los cambios y conviene ajustarla a mano.

## Paso 4 — Routes Admin (con auth)

`api/app/api/routes/banner.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify

from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Banner, Usuario
from app.schemas.banner import BannerCreate, BannerOut, BannerResponse

router = APIRouter(prefix="/banner", tags=["banner"])

@router.get("/", response_model=BannerResponse)
def list_banners(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    items = db.query(Banner).all()
    return {"banners": items, "total": len(items)}

@router.post("/create", response_model=BannerOut, status_code=status.HTTP_201_CREATED)
def create_banner(
    data: BannerCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(data.titulo)
    contador = 1
    while db.query(Banner).filter(Banner.slug == slug).first():
        slug = f"{slugify(data.titulo)}-{contador}"
        contador += 1

    banner = Banner(**data.model_dump(), slug=slug)
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner

@router.put("/{banner_id}", response_model=BannerOut)
def update_banner(banner_id: int, data: BannerCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(verify_csrf)):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner no encontrado")
    for k, v in data.model_dump().items():
        setattr(banner, k, v)
    db.commit()
    db.refresh(banner)
    return banner

@router.delete("/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_banner(banner_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(verify_csrf)):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner no encontrado")
    db.delete(banner)
    db.commit()
```

> Cuando uses `get_current_user` solo se valida el login. `verify_csrf` además exige el header `X-CSRF-Token` — recuerda usarlo en POST/PUT/PATCH/DELETE.

## Paso 5 — Routes Public (sin auth)

`api/app/api/routes/banner_public.py`:

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Banner
from app.schemas.banner import BannerOut

router = APIRouter(prefix="/banner", tags=["banner-public"])

@router.get("", response_model=list[BannerOut])
def get_banners(
    activo: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Banner)
    items = query.all()
    return items
```

## Paso 6 — Registrar routers

`api/app/main.py`, dentro de `create_app()`:

```python
from app.api.routes import banner, banner_public

app.include_router(banner.router, prefix=settings.admin_prefix)
app.include_router(banner_public.router, prefix=settings.web_prefix)
```

Tras esto:
- Admin (con auth): `/api/portal-admin/banner/*`
- Public: `/api/portal/banner`

## Paso 7 — CMS (Admin)

### 7.1 Página de listado/edición

`admin/src/pages/Banner.jsx` — usa Ant Design Table, Modal, Form. Patrón estándar:

```jsx
import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import api from '@services/api';
import MediaSelector from '@components/MediaSelector';

export default function Banner() {
    const [banners, setBanners] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const load = async () => {
        const { data } = await api.get('/banner');
        setBanners(data.banners);
    };

    useEffect(() => { load(); }, []);

    const onSave = async (values) => {
        try {
            if (editing) {
                await api.put(`/banner/${editing.id}`, values);
            } else {
                await api.post('/banner/create', values);
            }
            message.success('Guardado');
            setEditing(null);
            form.resetFields();
            load();
        } catch {
            message.error('Error al guardar');
        }
    };

    const onDelete = async (id) => {
        await api.delete(`/banner/${id}`);
        load();
    };

    return (
        <>
            <Button type="primary" onClick={() => setEditing({})}>Nuevo banner</Button>

            <Table dataSource={banners} rowKey="id" columns={[
                { title: 'Título', dataIndex: 'titulo' },
                { title: 'Link', dataIndex: 'link' },
                {
                    title: 'Acciones',
                    render: (_, b) => (
                        <>
                            <Button onClick={() => { setEditing(b); form.setFieldsValue(b); }}>Editar</Button>
                            <Button danger onClick={() => onDelete(b.id)}>Eliminar</Button>
                        </>
                    )
                }
            ]} />

            <Modal open={!!editing} onCancel={() => setEditing(null)} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={onSave}>
                    <Form.Item name="titulo" label="Título" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    {/* imagen_desktop con picker */}
                    {/* ... resto de campos */}
                </Form>
            </Modal>
        </>
    );
}
```

### 7.2 Registrar la ruta

`admin/src/router/editorRoutes.jsx`:

```jsx
import Banner from '../pages/Banner';

export const editorRoutes = [
    ...,
    protectedRoute('banners', <Banner />, ADMIN_EDITOR),
];
```

Ya queda en `/portal-admin/banners`.

### 7.3 Item en el sidebar

`admin/src/components/MainLayout.jsx`, agregar al `menuItems`:

```jsx
{
    key: '/banners',
    icon: <PictureOutlined />,
    label: 'Banners',
    onClick: () => navigate('/banners'),
}
```

## Paso 8 — Web (Portal público)

### 8.1 Componente

`web/src/components/home/banners.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import api from '@services/apiService';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Banners() {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        api.get('/banner').then((r) => setBanners(r.data));
    }, []);

    if (!banners.length) return null;

    return (
        <Swiper modules={[Pagination, Autoplay]} pagination autoplay={{ delay: 8000 }}>
            {banners.map((b) => (
                <SwiperSlide key={b.id}>
                    <a href={b.link}>
                        <picture>
                            <source media="(min-width: 768px)" srcSet={b.imagen_desktop} />
                            <img src={b.imagen_mobile || b.imagen_desktop} alt={b.titulo} />
                        </picture>
                    </a>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
```

### 8.2 Registrar como bloque dinámico (opcional)

Si el bloque puede insertarse en páginas dinámicas del CMS, registra en `web/src/components/BlockRenderer.jsx`:

```jsx
import Banners from './home/banners';

const COMPONENT_MAP = {
    ...
    'banners': Banners,
};
```

Después, una página dinámica con bloque `{ type: 'banners' }` lo renderiza.

### 8.2.1 Mapeo de bloques dinamicos y paginas

El componente antes mencionado tambien funciona para mostrar de manera dinamica componentes en las paginas. Estas mismas hacen un mapeo en "/config/pageMap.js" donde se hace una relacion de "slug" y nombre de componente.

```
export const pageMap = {
    "conocenos": ['informacion', 'mision_vision','valores', 'normatividad', 'plan_institucional', 'plan_trabajo'],
    "organigrama": ['director', 'directorio'],
    "organos-de-gobierno": ['organos'],
    "sistema-institucional-de-archivo": ['archivo'],
    "contabilidad-gubernamental": ['contabilidad'],
    "snieg": ['snieg'], 
    "preguntas-frecuentes": ['preguntas'],
    "sistemas-de-informacion": ['sistemas'],
    "flashes": ['flashes'],
    "reportes": ['reportes'],
    "galeria-de-mapas": ['mapas'],
    "documentacion": ['documentacion'],
    "capacitaciones": ['capacitaciones'],
    "convocatorias": ['convocatorias']
};
```

Del mismo modo se utiliza para elementos dinamicos dentro de las paginas internas - pageComponentMap.js:


export const pageComponentMap = {
    "blog": ['blog'],
    "convocatorias": ['convocatorias'],
    "capacitaciones": ['capacitaciones'],
};
```

El funcionamiento del componente "dinamico" puede verse dentro de PaginaIndividual.js y Pagina Dinamica,jsx

```
const blocks = blockNames.map((name) => ({
        name,
        Component: lazy(() =>
          import(`../interComponents/${name}.jsx`).catch(() => import('../blocks/NotFound'))
        ),
      }));
```


### 8.3 Usar directo en una página

```jsx
import Banners from '@components/home/banners';

function Home() {
    return (
        <section className="h-96"><Banners /></section>
    );
}
```

## Checklist final

- [ ] Modelo SQLAlchemy + `__init__.py` actualizado
- [ ] Schema Pydantic (Create, Out, Response)
- [ ] Migración Alembic generada y aplicada
- [ ] Routes admin (con `verify_csrf` en mutables)
- [ ] Routes public (lectura sin auth)
- [ ] Routers incluidos en `main.py` con sus prefijos correctos
- [ ] Página del CMS + ruta + item del sidebar
- [ ] Componente del portal web
- [ ] Si va en páginas dinámicas, agregado a `BlockRenderer`
- [ ] Probado en `make up` (dev): crear, listar, editar, eliminar
- [ ] Visible en el portal público

## Convenciones del proyecto

- Endpoints en **español**: `/banner`, `/autenticacion`, `/multimedia`, etc.
- Mutables siempre con `verify_csrf` (cookie httpOnly + header X-CSRF-Token).
- Lecturas públicas en `_public.py` aparte, registradas con `web_prefix`.
- Para imágenes/archivos usar el Acervo (ver [MEDIA_ACERVO.md](./MEDIA_ACERVO.md)).
- ESLint: 4 espacios, comillas simples. Backend: PEP 8, snake_case, type hints.
