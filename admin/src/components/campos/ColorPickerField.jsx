import React from 'react';
import { ColorPicker, Form, Input } from 'antd';

const ColorInput = ({ value, onChange }) => {
  const stringValue = typeof value === 'string' ? value : value?.toHexString?.() || value || '';

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <ColorPicker
        format="hex"
        value={value}
        onChange={(_, hex) => onChange?.(hex)}
      />
      <Input
        value={stringValue}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="#000000"
        style={{ flex: 1 }}
      />
    </div>
  );
};

const ColorPickerField = ({ label, name }) => {
  return (
    <Form.Item 
      label={label} 
      name={name}  
    >
      <ColorInput />
    </Form.Item>
  );
};

export default ColorPickerField;