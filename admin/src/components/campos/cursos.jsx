import { Form, Input, Select, Checkbox } from 'antd';
import RichTextEditor from '@components/campos/RichTextEditor';
import { UploadAcervo } from '@components/UploadAcervo';


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
            rules={[{ required: false, message: 'Por favor seleccione un estado de inscripción' }]}
        >
            <RichTextEditor />
        </Form.Item>
        <Form.Item
            name="acreditacion"
            label="Acreditación"
            rules={[{ required: false, message: 'Por favor seleccione un estado de acreditación' }]}
        >
            <RichTextEditor />
        </Form.Item>
        <Form.Item
            name="clave"
            label="Palabras clave"
            rules={[{ required: false, message: 'Por favor ingrese las palabras clave' }]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="modulos"
            label="Módulo"
            rules={[{ required: false, message: 'Por favor seleccione un módulo' }]}
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
            name="profesores"
            label="Profesor"
            rules={[{ required: false, message: 'Por favor seleccione un profesor' }]}
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
            name="instituciones"
            label="Institución"
            rules={[{ required: false, message: 'Por favor seleccione una institución' }]}
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
            name="perfiles"
            label="Perfil"
            rules={[{ required: false, message: 'Por favor seleccione un perfil' }]}
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

export const CamposComunes = ({ form }) => (
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
            <RichTextEditor />
        </Form.Item>
        <Form.Item
            name="inicio"
            label="Fecha de inicio"
            rules={[{ required: false, message: 'Por favor seleccione una fecha de inicio' }]}
        >
            <Input type="date" />
        </Form.Item>
        <Form.Item
            name="fin"
            label="Fecha de finalizacion"
            rules={[{ required: false, message: 'Por favor seleccione una fecha de finalizacion' }]}
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
            name="Horario"
            label="Horario"
            rules={[{ required: true, message: 'Por favor seleccione un horario' }]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="Objetivo"
            label="Objetivo"
            rules={[{ required: false, message: 'Por favor seleccione un objetivo' }]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="p_ingreso"
            label="P. Ingreso"
            rules={[{ required: false, message: 'Por favor seleccione un p. ingreso' }]}
        >
            <RichTextEditor />
        </Form.Item>
        <Form.Item
            name="p_egreso"
            label="P. Egreso"
            rules={[{ required: false, message: 'Por favor seleccione un p. egreso' }]}
        >
            <RichTextEditor />
        </Form.Item>
        <Form.Item
            name="archivo"
            label="Archivo"
            rules={[{ required: false, message: 'Por favor seleccione un archivo' }]}
        >
            <UploadAcervo 
                bucket="portal"
                folder="/cursos"
                label="Subir archivo"
                onUploaded={(media) => {
                    form.setFieldsValue({ archivo: media.url });
                }}
             />
            <Form.Item name="archivo" noStyle>
                <Input placeholder="Subir archivo" />
            </Form.Item>
                {form.getFieldValue('archivo') ? (
                    <a href={form.getFieldValue('archivo')} target="_blank" rel="noopener noreferrer">
                        Ver archivo
                    </a>
                ) : null}
        </Form.Item>
        <Form.Item
            name="formulario"
            label="Link a Formulario"
            rules={[{ required: false, message: 'Por favor seleccione un formulario' }]}
        >
            <Input />
        </Form.Item>
    </>
);