import React from 'react';
import { ColorPicker, Form, Typography } from 'antd';

const ColorPickerField = ({ label, name, initialValue }) => (
  <Form.Item
    label={label}
    name={name}
    initialValue={initialValue}
    getValueFromEvent={(color) => (color ? color.toHexString() : undefined)}
  >
    <ColorPicker showText />
  </Form.Item>
);

export default ColorPickerField;