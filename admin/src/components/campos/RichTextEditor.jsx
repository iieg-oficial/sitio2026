import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect } from 'react'

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
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())  // notifica al Form con HTML string
    },
  })

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
      </div>

      {/* Área de edición */}
      <EditorContent
        editor={editor}
        style={{ padding: '12px', minHeight: 120, fontSize: 14 }}
      />
    </div>
  )
}