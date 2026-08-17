import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { useEffect, useRef } from 'react'

const ToolbarButton = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      padding: '4px 8px',
      border: '1px solid',
      borderColor: active ? '#1677ff' : '#d9d9d9',
      borderRadius: 4,
      background: active ? '#e6f4ff' : '#fff',
      color: active ? '#1677ff' : '#333',
      cursor: 'pointer',
      fontSize: 13,
      lineHeight: 1,
    }}
  >
    {children}
  </button>
)

export default function RichTextEditor({ value, onChange }) {
  
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({
        allowBase64: true, // Permite imágenes locales en formato Base64
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())  // notifica al Form con HTML string
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validar que realmente sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }

      const reader = new FileReader();
      
      reader.onload = () => {
        const base64Url = reader.result;
        // Insertamos la imagen usando el string Base64 generado
        editor.chain().focus().setImage({ src: base64Url }).run();
      };

      reader.readAsDataURL(file); // Convierte el archivo local a Base64
    }
    
    // Limpiar el input para poder subir la misma imagen seguidas si se desea
    event.target.value = '';
  };

  const triggerLocalUpload = () => {
    // Simula el click en el input oculto
    fileInputRef.current?.click();
  };

  if (!editor) return null;

  // Sincroniza cuando el Form carga datos (edición)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px', borderBottom: '1px solid #d9d9d9', background: '#fafafa' }}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrita">
          <b>B</b>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Cursiva">
          <i>I</i>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Subrayado">
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Subtítulo">
          H3
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
          • Lista
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
          1. Lista
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinear izquierda">
          ←
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrar">
          ↔
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinear derecha">
          →
        </ToolbarButton>
        <ToolbarButton onClick={triggerLocalUpload} title="Insertar imagen">
          Imagen
        </ToolbarButton>
        <span style={{ borderLeft: '1px solid #ccc', margin: '0 4px' }} />
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
          title="Insertar tabla 3x3"
        >
          田 Tabla
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().addColumnAfter().run()} 
          disabled={!editor.isActive('table')}
          title="Agregar columna a la derecha"
        >
          + Columna
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().addRowAfter().run()} 
          disabled={!editor.isActive('table')}
          title="Agregar fila abajo"
        >
          + Fila
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().deleteColumn().run()} 
          disabled={!editor.isActive('table')}
          title="Eliminar columna"
        >
          - Columna
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().deleteRow().run()} 
          disabled={!editor.isActive('table')}
          title="Eliminar fila"
        >
          - Fila
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().deleteTable().run()} 
          disabled={!editor.isActive('table')}
          title="Eliminar tabla"
        >
          Eliminar Tabla
        </ToolbarButton>
        
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Área de edición */}
      <EditorContent
        editor={editor}
        style={{ padding: '12px', minHeight: 220, fontSize: 18 }}
      />
    </div>
  )
}