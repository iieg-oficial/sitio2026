# Media y Acervo

Esta guía explica cómo usar el **Acervo** (almacenamiento S3-compatible con SeaweedFS) desde el CMS o cualquier componente del admin, paso a paso y con ejemplos listos para copiar.

## Qué es el Acervo

- Servicio S3-compatible (SeaweedFS) que vive en su propio repositorio (`/IIEG/acervo`).
- En **dev** está embebido en este compose (servicio `seaweedfs`).
- En **prod** se conecta vía la red Docker `iieg-network`.
- Tiene buckets por proyecto. Este portal usa:
  - `portal` — uploads del CMS y del CKAN (escritura + lectura).
  - `iieg` — bucket compartido del instituto (escritura + lectura).

## Endpoints del backend (api FastAPI)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/sitio-admin/multimedia?bucket=portal` | Lista archivos del bucket portal (lee de DB) |
| `GET` | `/api/sitio-admin/multimedia?bucket=iieg` | Lista archivos del bucket iieg (lee directo de S3) |
| `POST` | `/api/sitio-admin/multimedia` | Sube archivo. Body: `file`, `folder`, `alt`, `bucket` |
| `DELETE` | `/api/sitio-admin/multimedia/{id}?bucket=<bucket>` | Borra. Para iieg el id viene como `iieg:<object-name>` |
| `GET` | `/api/sitio-admin/multimedia/carpetas` | Lista carpetas (solo aplica a bucket portal) |
| `POST` | `/api/sitio-admin/multimedia/carpetas` | Crea carpeta (solo portal) |

> Las peticiones requieren cookie de auth (`access_token`) y header `X-CSRF-Token` en métodos mutables. El interceptor de axios en `admin/src/services/api.js` los inyecta automáticamente, así que normalmente no tienes que pensar en eso.

## Cliente JS — `mediaService.js`

`admin/src/services/mediaService.js` envuelve los endpoints. Métodos útiles:

```js
import mediaService from '@services/mediaService';

// listar archivos
const archivos = await mediaService.getMediaFiles({
    bucket: 'portal',          // 'portal' o 'iieg'
    folder: '/imagenes',       // opcional
    type: 'image',             // opcional, prefijo de MIME
    search: 'logo',            // opcional
});

// subir un archivo
const subido = await mediaService.uploadMediaFile(file, {
    bucket: 'portal',
    folder: '/imagenes',
    alt: 'Descripción para accesibilidad',
    onProgress: (percent) => console.log(`${percent}%`),
});
// subido.url → URL pública del archivo subido

// subir varios
const { successful, failed } = await mediaService.uploadMultipleFiles(files, {
    bucket: 'portal',
    onProgress: (nombre, percent) => console.log(`${nombre}: ${percent}%`),
});

// borrar
await mediaService.deleteMediaFile(id, 'portal');
await mediaService.deleteMultipleFiles([id1, id2], 'portal');

// carpetas (solo bucket portal)
const carpetas = await mediaService.getFolders();
await mediaService.createFolder('imagenes-2026', '/');

// helpers
mediaService.formatFileSize(bytes);         // '1.2 MB'
mediaService.getFileIcon(mimeType);         // nombre del icono Ant Design
mediaService.validateFileType(file, ['image/*', 'application/pdf']);
mediaService.validateFileSize(file, 10 * 1024 * 1024);  // 10 MB
mediaService.generatePreview(file);         // Promise<dataURL>
mediaService.getImageDimensions(file);      // Promise<{width, height}>
```

## Componente reutilizable — `MediaSelector`

`admin/src/components/MediaSelector.jsx` es un modal que abre el explorador de Media y devuelve el archivo seleccionado. Es la forma recomendada — así evitas duplicar lógica de upload en cada formulario.

```jsx
import { useState } from 'react';
import { Button, Input } from 'antd';
import MediaSelector from '@components/MediaSelector';

function MiFormulario() {
    const [imagen, setImagen] = useState('');
    const [showPicker, setShowPicker] = useState(false);

    return (
        <>
            <Input
                value={imagen}
                placeholder="URL de la imagen"
                addonAfter={
                    <Button type="link" onClick={() => setShowPicker(true)}>
                        Seleccionar del Acervo
                    </Button>
                }
            />

            <MediaSelector
                open={showPicker}
                onClose={() => setShowPicker(false)}
                onSelect={(item) => {
                    setImagen(item.url);
                    setShowPicker(false);
                }}
                bucket="portal"          // o 'iieg'
                accept="image/*"         // opcional
            />
        </>
    );
}
```

## Agregar un botón "Subir al Acervo" a tu componente

Si necesitas subir un archivo desde un componente (no pasar por el explorador), tres pasos:

### 1. Componente con upload directo

```jsx
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import mediaService from '@services/mediaService';

function UploadAcervo({ onUploaded, bucket = 'portal', folder = '/' }) {
    const handleUpload = async ({ file, onSuccess, onError, onProgress }) => {
        try {
            const result = await mediaService.uploadMediaFile(file, {
                bucket,
                folder,
                onProgress: (percent) => onProgress({ percent }),
            });
            onSuccess(result);
            message.success(`${file.name} subido`);
            onUploaded?.(result);
        } catch (error) {
            onError(error);
            message.error(`Error al subir ${file.name}`);
        }
    };

    return (
        <Upload customRequest={handleUpload} showUploadList={false}>
            <Button icon={<UploadOutlined />}>Subir al Acervo</Button>
        </Upload>
    );
}
```

### 2. Uso

```jsx
<UploadAcervo
    bucket="portal"
    folder="/banners"
    onUploaded={(media) => {
        console.log('URL del archivo:', media.url);
        setFieldValue('imagen', media.url);
    }}
/>
```

### 3. Si solo necesitas la URL

`media.url` es ya pública. Para `portal` apunta a `http://localhost:18080/acervo/portal/<archivo>` en dev y al dominio configurado en prod. No tienes que firmar nada.

## Decidir bucket: `portal` vs `iieg`

| Usa `portal` cuando... | Usa `iieg` cuando... |
|---|---|
| El archivo solo lo usa el portal IIEG | El archivo es compartido entre proyectos del instituto |
| Es contenido del CMS (banners, imágenes de página, posts) | Es contenido institucional reutilizable |
| Quieres que la metadata se guarde en la DB del portal | No te interesa metadata persistida |

## Buenas prácticas

- **Sube siempre a través del backend** (no directo del frontend al S3). El backend firma URLs y centraliza permisos.
- **Usa `media.url`** de la respuesta de la API en lugar de construir URLs a mano.
- **Archivos grandes (>100 MB):** considera chunked upload. El nginx tiene `client_max_body_size 100M`; para más, coordina ajustar el límite.
- **Nombres de archivo:** el backend genera un UUID automático, así que el `originalName` queda guardado como metadata y no hay conflictos.

## Verificar uploads desde shell

```bash
docker exec portal-api python -c "
from app.services.acervo import get_acervo_service
svc = get_acervo_service()
for o in svc.list_objects(bucket='portal'):
    print(o['size'], o['name'])
"
```

## Referencia rápida

- Modelo DB: `api/app/models/media.py`
- Endpoints: `api/app/api/routes/media.py`
- Servicio backend: `api/app/services/acervo.py`
- Servicio frontend: `admin/src/services/mediaService.js`
- UI explorador: `admin/src/pages/Media.jsx`
- Picker modal: `admin/src/components/MediaSelector.jsx`
