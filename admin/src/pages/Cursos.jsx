import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  const [instituciones, setInstituciones] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [perfiles, setPerfiles] = useState([]);

  useEffect(() => {
    fetchCursos();
    fetchInstituciones();
    fetchModulos();
    fetchProfesores();
  }, []);

  const fetchCursos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cursos');
      setCursos(response.data.cursos);
    } catch (error) {
      console.error('Error al obtener cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstituciones = async () => {
    try {
      const response = await api.get('/instituciones');
      setInstituciones(response.data.instituciones);
    } catch (error) {
      console.error('Error al obtener instituciones:', error);
    }
  };

  const fetchModulos = async () => {
    try {
      const response = await api.get('/modulos');
      setModulos(response.data.modulos);
    } catch (error) {
      console.error('Error al obtener modulos:', error);
    }
  };

  const fetchProfesores = async () => {
    try {
      const response = await api.get('/profesores');
      setProfesores(response.data.profesores);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
    }
  };

  const fetchPerfiles = async () => {
    try {
      const response = await api.get('/perfiles');
      setPerfiles(response.data.perfiles);
    } catch (error) {
      console.error('Error al obtener perfiles:', error);
    }
  };

  const handleCreate = () => {
    setEditingCurso(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCurso(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar este curso?',
      content: `Se eliminará el curso: ${record.titulo}`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/cursos/${record.id}`);
          message.success('Curso eliminado exitosamente');
          fetchCursos();
        } catch (error) {
          console.error('Error al eliminar curso:', error);
          message.error('Error al eliminar curso');
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCurso) {
        await api.put(`/cursos/${editingCurso.id}`, values);
        message.success('Curso actualizado exitosamente');
      } else {
        await api.post('/cursos/create', values);
        message.success('Curso creado exitosamente');
      }
      setModalVisible(false);
      fetchCursos();
    } catch (error) {
      message.error(editingCurso ? 'Error al actualizar curso' : 'Error al crear curso');
    }
  };

  const columns = [
    {
      title: 'Titulo',
      dataIndex: 'titulo',
      key: 'titulo',
      sorter: (a, b) => a.titulo.localeCompare(b.titulo)
    },
    {
      title: 'Tipo de curso',
      dataIndex: 'tipo_curso',
      key: 'tipo_curso',
      sorter: (a, b) => a.tipo_curso.localeCompare(b.tipo_curso)
    },
    {
      title: 'Fecha de inicio',
      dataIndex: 'inicio',
      key: 'inicio',
      sorter: (a, b) => a.inicio.localeCompare(b.inicio)
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Eliminar
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Administración de Cursos</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Nuevo Curso
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={cursos}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} cursos`
          }}
        />
      </Card>

      <Modal
        title={editingCurso ? 'Editar Curso' : 'Nuevo Curso'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={editingCurso ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
          <Form.Item
            name="tipo_curso"
            label="Tipo de curso"
            rules={[{ required: true, message: 'Por favor seleccione un tipo de curso' }]}
          >
            <Select placeholder="Seleccione un tipo de curso" 
            options={
              [
                { value: 'Presencial', label: 'Presencial' }, 
                { value: 'Virtual', label: 'Virtual' }
              ]
            } />
          </Form.Item>
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
            name="contacto"
            label="Contacto"
            rules={[{ required: true, message: 'Por favor seleccione un contacto' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="modulo_id"
            label="Módulo"
            rules={[{ required: true, message: 'Por favor seleccione un módulo' }]}
          >
            <Select placeholder="Seleccione un módulo">
              {modulos.map((modulo) => (
                <Option key={modulo.id} value={modulo.id}>
                  {modulo.titulo}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="institucion_id"
            label="Institución"
            rules={[{ required: true, message: 'Por favor seleccione una institución' }]}
          >
            <Select placeholder="Seleccione una institución">
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
            <Select placeholder="Seleccione un perfil">
              {perfiles.map((perfil) => (
                <Option key={perfil.id} value={perfil.id}>
                  {perfil.nombre}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="profesor_id"
            label="Profesor"
            rules={[{ required: true, message: 'Por favor seleccione un profesor' }]}
          >
            <Select placeholder="Seleccione un profesor">
              {profesores.map((profesor) => (
                <Option key={profesor.id} value={profesor.id}>
                  {profesor.nombre}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

