import { useEffect, useState } from 'react';
import { Select, Typography } from 'antd';

const { Text } = Typography;

export function TemaSelector({ temas = [], seleccionados = [], onChange }) {
  const [padresSeleccionados, setPadresSeleccionados] = useState([]);
  const [subtemasSeleccionados, setSubtemasSeleccionados] = useState([]);

  useEffect(() => {
    if (!temas || temas.length === 0) return;

    // Normalizar a número para evitar discrepancias tipo '1' !== 1
    const idsNormalizados = (seleccionados || []).map((id) => Number(id));

    const idsPadresDirectos = new Set();
    const idsSubtemasDirectos = new Set();

    // Indexar padres y subtemas para búsqueda rápida
    const mapaPadreDeSubtema = new Map();
    
    temas.forEach((padre) => {
      const padreId = Number(padre.id);
      (padre.subtemas ?? []).forEach((sub) => {
        const subId = Number(sub.id);
        mapaPadreDeSubtema.set(subId, padreId);
      });
    });

    const idsPadresTodos = new Set(temas.map((t) => Number(t.id)));

    idsNormalizados.forEach((id) => {
      if (idsPadresTodos.has(id)) {
        idsPadresDirectos.add(id);
      } else if (mapaPadreDeSubtema.has(id)) {
        idsSubtemasDirectos.add(id);
        // INFERIR PADRE: Si se seleccionó el subtema, auto-activar su tema padre
        idsPadresDirectos.add(mapaPadreDeSubtema.get(id));
      }
    });

    setPadresSeleccionados(Array.from(idsPadresDirectos));
    setSubtemasSeleccionados(Array.from(idsSubtemasDirectos));
  }, [temas, seleccionados]);

  // Subtemas disponibles basados en los padres seleccionados
  const subtemasDisponibles = temas
    .filter((t) => padresSeleccionados.includes(Number(t.id)))
    .flatMap((t) => t.subtemas ?? []);

  const handlePadresChange = (nuevosIds) => {
    const nuevosIdsNum = nuevosIds.map(Number);
    const nuevosSubtemasValidos = new Set(
      temas
        .filter((t) => nuevosIdsNum.includes(Number(t.id)))
        .flatMap((t) => (t.subtemas ?? []).map((s) => Number(s.id)))
    );

    const subtemasConservados = subtemasSeleccionados.filter((id) =>
      nuevosSubtemasValidos.has(id)
    );

    setPadresSeleccionados(nuevosIdsNum);
    setSubtemasSeleccionados(subtemasConservados);
    onChange([...nuevosIdsNum, ...subtemasConservados]);
  };

  const handleSubtemasChange = (nuevosSubIds) => {
    const nuevosSubIdsNum = nuevosSubIds.map(Number);
    setSubtemasSeleccionados(nuevosSubIdsNum);
    onChange([...padresSeleccionados, ...nuevosSubIdsNum]);
  };

  const nombresPadresSeleccionados = temas
    .filter((t) => padresSeleccionados.includes(Number(t.id)))
    .map((t) => t.titulo)
    .join(', ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
          Temas
        </Text>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Selecciona uno o varios temas"
          value={padresSeleccionados}
          onChange={handlePadresChange}
          options={temas.map((t) => ({ label: t.titulo, value: Number(t.id) }))}
          allowClear
          showSearch
          optionFilterProp="label"
        />
      </div>

      {padresSeleccionados.length > 0 && subtemasDisponibles.length > 0 && (
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
            Subtemas de: <Text type="secondary">{nombresPadresSeleccionados}</Text>
          </Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Selecciona subtemas (opcional)"
            value={subtemasSeleccionados}
            onChange={handleSubtemasChange}
            options={subtemasDisponibles.map((s) => ({ label: s.titulo, value: Number(s.id) }))}
            allowClear
            showSearch
            optionFilterProp="label"
          />
        </div>
      )}

      {padresSeleccionados.length > 0 && subtemasDisponibles.length === 0 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Los temas seleccionados no tienen subtemas.
        </Text>
      )}
    </div>
  );
}