import { Form, Input, Select, Checkbox } from 'antd';

const { Option } = Select;

export const CamposCapacitaciones = ({ modulos, profesores }) => (
    <>
        <Form.Item
            name="destacado"
            label="Destacado"
            valuePropName="checked"
        >
            <Checkbox>Destacado</Checkbox>
        </Form.Item>
        <Form.Item
            name="inscripcion"
            label="Inscripción"
            rules={[{ required: true, message: 'Por favor seleccione un estado de inscripción' }]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="acreditacion"
            label="Acreditación"
            rules={[{ required: true, message: 'Por favor seleccione un estado de acreditación' }]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="vigencia"
            label="Vigencia"
            rules={[{ required: true, message: 'Por favor seleccione una vigencia' }]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="modulo_id"
            label="Módulo"
            rules={[{ required: true, message: 'Por favor seleccione un módulo' }]}
        >
            <Select 
                mode="multiple"
                placeholder="Seleccione uno o varios módulos"
                allowClear
                showSearch
                maxTagCount="responsive"
                optionFilterProp="label"
                filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                }
            >
                {modulos.map((modulo) => (
                    <Option key={modulo.id} value={modulo.id}>
                        {modulo.nombre}
                    </Option>
                ))}
            </Select>
        </Form.Item>
        <Form.Item
            name="profesor_id"
            label="Profesor"
            rules={[{ required: true, message: 'Por favor seleccione un profesor' }]}
        >
            <Select 
                mode="multiple"
                placeholder="Seleccione uno o varios profesores"
                allowClear
                showSearch
                maxTagCount="responsive"
                optionFilterProp="label"
                filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                }
            >
                {profesores.map((profesor) => (
                    <Option key={profesor.id} value={profesor.id}>
                        {profesor.nombre}
                    </Option>
                ))}
            </Select>
        </Form.Item>
    </>
);
export const CamposConvocatorias = ({ instituciones, perfiles }) => (
    <>
        <Form.Item
            name="institucion_id"
            label="Institución"
            rules={[{ required: true, message: 'Por favor seleccione una institución' }]}
        >
            <Select 
                mode="multiple"
                placeholder="Seleccione una o varias instituciones"
                allowClear
                showSearch
                maxTagCount="responsive"
                optionFilterProp="label"
                filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                }
            >
                {instituciones.map((institucion) => (
                    <Option key={institucion.id} value={institucion.id}>
                        {institucion.nombre}
                    </Option>
                ))}
            </Select>
        </Form.Item>
        <Form.Item
            name="perfil_id"
            label="Perfil"
            rules={[{ required: true, message: 'Por favor seleccione un perfil' }]}
        >
            <Select 
                mode="multiple"
                placeholder="Seleccione uno o varios perfiles"
                allowClear
                showSearch
                maxTagCount="responsive"
                optionFilterProp="label"
                filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                }
            >
                {perfiles.map((perfil) => (
                    <Option key={perfil.id} value={perfil.id}>
                        {perfil.nombre}
                    </Option>
                ))}
            </Select>
        </Form.Item>
    </>
);

export const CamposComunes = () => (
    <>
        <Form.Item
            name="titulo"
            label="Titulo"
            rules={[{ required: true, message: 'Por favor ingrese el titulo' }]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
        >
            <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
            name="inicio"
            label="Fecha de inicio"
            rules={[{ required: true, message: 'Por favor seleccione una fecha de inicio' }]}
        >
            <Input type="date" />
        </Form.Item>
        <Form.Item
            name="formato"
            label="Formato"
            rules={[{ required: true, message: 'Por favor seleccione un formato' }]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="horario"
            label="Horario"
            rules={[{ required: true, message: 'Por favor seleccione un horario' }]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="objetivo"
            label="Objetivo"
            rules={[{ required: true, message: 'Por favor seleccione un objetivo' }]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="p_ingreso"
            label="P. Ingreso"
            rules={[{ required: true, message: 'Por favor seleccione un p. ingreso' }]}
        >
            <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
            name="p_egreso"
            label="P. Egreso"
            rules={[{ required: true, message: 'Por favor seleccione un p. egreso' }]}
        >
            <Input.TextArea rows={4} />
        </Form.Item>
    </>
);