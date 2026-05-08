import React from 'react';
import { ColorPicker, Form, Typography } from 'antd';

const ColorPickerField = ({ label, name }) => {
  return (
    <Form.Item 
      label={label} 
      name={name}
      // Importante: AntD necesita saber cómo obtener el valor del ColorPicker
      getValueFromEvent={(color) => color.toHexString()} 
    >
      <ColorPicker showText />
    </Form.Item>
  );
};

export default ColorPickerField;