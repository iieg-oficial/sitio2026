# Habilitación de Relaciones Dinámicas en Importador Genérico

De acuerdo con lo solicitado, hemos dotado a `import_generic_model_data.py` con "inteligencia" para detectar automáticamente relaciones (`relationship`) y asignar llaves foráneas a **cualquier modelo** de la base de datos sin necesidad de crear scripts personalizados.

## Resumen de la Implementación

### 1. Introspección Automática de SQLAlchemy
Importamos `inspect` desde SQLAlchemy en `import_generic_model_data.py`. Esto permite al importador leer el esquema interno del modelo destino (`__table__.columns` y ahora `mapper.relationships`).

### 2. Detección de Columnas Relacionadas en el CSV
El importador genérico ahora busca activamente columnas en tus archivos CSV que terminen en `_slugs` o `_ids`.
Si detecta que existe una relación en el modelo que coincida con esa raíz, intentará relacionarlos. 
- Ejemplo: Si el modelo tiene la relación `temas = relationship(Subject...)`, el importador buscará en el CSV las columnas `tema_slugs`, `temas_slugs` o `tema_ids` y dividirá los valores si están separados por `|`.

### 3. Asignación Automática
El importador ejecuta la consulta a la tabla relacionada y asigna los objetos resultantes (o el objeto único, si es una relación uno a muchos) directamente a la instancia antes de guardarla. Si pasas un slug que no existe en la base de datos, el script ignorará esa relación en particular e imprimirá una `ADVERTENCIA` en tu terminal, pero seguirá guardando el registro y sus otras propiedades correctamente.

### 4. Simplificación del Proyecto
Gracias a este enorme salto en funcionalidad, pudimos eliminar el código personalizado de `import_documentacion.py` y restaurarlo a su estado genérico original (un script de sólo unas cuantas líneas). ¡A partir de ahora, cualquier nuevo modelo que tenga relaciones se importará sin fricción utilizando únicamente el importador genérico!

## ¿Cómo Usarlo?

Simplemente debes agregar las columnas de relación a tus archivos `.csv` con los datos separados por un pipe `|`.

**Ejemplo en `instituciones_import_example.csv` (relacionando `cursos`):**
```csv
nombre,slug,descripcion,logo,curso_slugs
"Secretaría de Economía",economia-jalisco,"Secretaría del Estado",https://...,taller-de-datos|analisis-financiero
```

**Ejemplo en `archivos_import_example.csv` (relacionando `temas`):**
```csv
titulo,slug,fecha,tipo,periocidad,archivo,tema_slugs
"Directorio Estadístico",directorio-estadistico,2026-04-01,documento,anual,https://...,economia|salud
```
