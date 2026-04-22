import { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@services/api';

const { Title } = Typography;

export default function Profesores() {
    const [profesores, setProfesores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProfesor, setEditingProfesor] = useState(null);

    useEffect(() => {
        fetchProfesores();
    }, []);

    const fetchProfesores = async () => {
        setLoading(true);
        try {
            const response = await api.get('/profesores');
            setProfesores(response.data);
        } catch {
            message.error('Error al cargar profesores');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProfesor(null);
        form.resetFields();
        setModalVisible(true);
    };

    
