import { Form, Select, Input, InputNumber, Switch } from 'antd';
import { useState } from 'react';

const { Option } = Select;

export const Cursos = () => {
  const [form] = Form.useForm();

  const tipo = Form.useWatch('tipo', form);

  return (
    <Form form={form} layout="vertical">

      <Form.Item label="Tipo de usuario" name="tipo">
        <Select placeholder="Selecciona un tipo">
  <Option value="profesor">Profesor</Option>
  <Option value="estudiante">Estudiante</Option>
</Select>
      </Form.Item>

      {/* Campos que aparecen solo si es Profesor */}
      {tipo === 'profesor' && (
        <>
          <Form.Item label="Materia" name="materia" rules={[{ required: true }]}>
            <Input placeholder="Materia que imparte" />
          </Form.Item>
          <Form.Item label="Años de experiencia" name="experiencia">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </>
      )}

      {/* Campos que aparecen solo si es Estudiante */}
      {tipo === 'estudiante' && (
        <>
          <Form.Item label="Grado" name="grado" rules={[{ required: true }]}>
            <Select placeholder="Selecciona grado">
              <Option value="1">1°</Option>
              <Option value="2">2°</Option>
              <Option value="3">3°</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Número de control" name="control">
            <Input placeholder="NC-0000" />
          </Form.Item>
        </>
      )}

      {/* Campos que aparecen solo si es Admin */}
      {tipo === 'admin' && (
        <>
          <Form.Item label="Nivel de acceso" name="nivel">
            <Select placeholder="Selecciona nivel">
              <Option value="super">Super admin</Option>
              <Option value="moderador">Moderador</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Acceso total" name="accesoTotal" valuePropName="checked">
            <Switch />
          </Form.Item>
        </>
      )}

    </Form>
  );
};