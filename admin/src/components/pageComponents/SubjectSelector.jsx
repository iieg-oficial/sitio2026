import { useEffect, useState } from 'react';
import { Select, Typography } from 'antd';

const { Text } = Typography;

/**
 * TemaSelector - Selector jerárquico de temas en dos pasos.
 *
 * Paso 1: muestra solo los temas raíz para seleccionar.
 * Paso 2: muestra los subtemas de los padres seleccionados.
 *
 * Props:
 *   temas        - array árbol desde /subject/tree (solo raíces con subtemas anidados)
 *   seleccionados - array de IDs actualmente seleccionados (padres e hijos mezclados)
 *   onChange     - callback(nuevosIds: number[])
 */
export function TemaSelector({ temas = [], seleccionados = [], onChange }) {
  // Estado interno para padres e hijos — necesario para manejar la race condition
  // donde `seleccionados` llega antes que `temas` (fetch aún en curso)
  const [padresSeleccionados, setPadresSeleccionados] = useState([]);
  const [subtemasSeleccionados, setSubtemasSeleccionados] = useState([]);

  // Re-sincronizar cuando llegan los temas o cambia la lista seleccionada externamente
  useEffect(() => {
    if (temas.length === 0) return; // Esperar a que los temas carguen

    const idsPadres = temas.map((t) => t.id);
    const idsSubtemas = temas.flatMap((t) => (t.subtemas ?? []).map((s) => s.id));

    const nuevosPadres = seleccionados.filter((id) => idsPadres.includes(id));
    const nuevosSubtemas = seleccionados.filter((id) => idsSubtemas.includes(id));

    setPadresSeleccionados(nuevosPadres);
    setSubtemasSeleccionados(nuevosSubtemas);
  }, [temas, seleccionados]);

  // IDs de todos los temas raíz
  const idsPadres = temas.map((t) => t.id);

  // Reunir subtemas solo de los padres seleccionados
  const subtemasDisponibles = temas
    .filter((t) => padresSeleccionados.includes(t.id))
    .flatMap((t) => t.subtemas ?? []);

  // Al cambiar los padres: conservar solo los subtemas que sigan siendo válidos
  const handlePadresChange = (nuevosIds) => {
    const nuevosSubtemasValidos = new Set(
      temas
        .filter((t) => nuevosIds.includes(t.id))
        .flatMap((t) => (t.subtemas ?? []).map((s) => s.id))
    );
    const subtemasConservados = subtemasSeleccionados.filter((id) =>
      nuevosSubtemasValidos.has(id)
    );
    setPadresSeleccionados(nuevosIds);
    setSubtemasSeleccionados(subtemasConservados);
    onChange([...nuevosIds, ...subtemasConservados]);
  };

  // Al cambiar los subtemas: mantener los padres seleccionados intactos
  const handleSubtemasChange = (nuevosSubIds) => {
    setSubtemasSeleccionados(nuevosSubIds);
    onChange([...padresSeleccionados, ...nuevosSubIds]);
  };

  const nombresPadresSeleccionados = temas
    .filter((t) => padresSeleccionados.includes(t.id))
    .map((t) => t.titulo)
    .join(', ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Paso 1 — Temas raíz */}
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
          options={temas.map((t) => ({ label: t.titulo, value: t.id }))}
          allowClear
          showSearch
          optionFilterProp="label"
        />
      </div>

      {/* Paso 2 — Subtemas (solo si hay padres seleccionados con subtemas) */}
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
            options={subtemasDisponibles.map((s) => ({ label: s.titulo, value: s.id }))}
            allowClear
            showSearch
            optionFilterProp="label"
          />
        </div>
      )}

      {/* Mensaje si los temas elegidos no tienen subtemas */}
      {padresSeleccionados.length > 0 && subtemasDisponibles.length === 0 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Los temas seleccionados no tienen subtemas.
        </Text>
      )}
    </div>
  );
}