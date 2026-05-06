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
  // IDs de todos los temas raíz
  const idsPadres = temas.map((t) => t.id);

  // Cuáles padres están seleccionados
  const padresSeleccionados = seleccionados.filter((id) => idsPadres.includes(id));

  // Reunir subtemas solo de los padres seleccionados
  const subtemasDisponibles = temas
    .filter((t) => padresSeleccionados.includes(t.id))
    .flatMap((t) => t.subtemas ?? []);

  const idsSubtemas = subtemasDisponibles.map((s) => s.id);

  // Cuáles subtemas (de los disponibles) están seleccionados
  const subtemasSeleccionados = seleccionados.filter((id) => idsSubtemas.includes(id));

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
    onChange([...nuevosIds, ...subtemasConservados]);
  };

  // Al cambiar los subtemas: mantener los padres seleccionados intactos
  const handleSubtemasChange = (nuevosSubIds) => {
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