# app/core/search.py
def escape_like(value: str) -> str:
    """Escapa % y _ para uso seguro en ILIKE, evitando wildcards accidentales."""
    return (
        value.replace('\\', '\\\\')
             .replace('%', '\\%')
             .replace('_', '\\_')
    )
