import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Quote, Minus, Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, FileCode
} from 'lucide-react';
import api from '../../lib/api';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  problemId?: string;
  noteSection?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content, onChange, placeholder, problemId, noteSection, className
}) => {
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (problemId) formData.append('problemId', problemId);
      if (noteSection) formData.append('noteSection', noteSection);

      const { data } = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        return data.data.url;
      }
      return null;
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    }
  }, [problemId, noteSection]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: {
          openOnClick: false,
          HTMLAttributes: { class: 'editor-link' },
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder || 'Start typing...' }),
      Highlight.configure({ multicolor: true }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              uploadImage(file).then((url) => {
                if (url && editor) {
                  editor.chain().focus().setImage({ src: url }).run();
                }
              });
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return false;

        event.preventDefault();
        imageFiles.forEach((file) => {
          uploadImage(file).then((url) => {
            if (url && editor) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          });
        });
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const ToolbarButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    title: string;
    children: React.ReactNode;
  }> = ({ onClick, isActive, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg text-xs font-semibold transition-all border ${
        isActive
          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400/50'
          : 'bg-white/[0.03] text-slate-400 border-white/8 hover:text-white hover:bg-white/[0.07]'
      }`}
      style={{ padding: '9px 10px' }}
    >
      {children}
    </button>
  );

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e: any) => {
      const files = e.target.files;
      if (files) {
        Array.from(files as FileList).forEach((file) => {
          uploadImage(file).then((url) => {
            if (url) editor.chain().focus().setImage({ src: url }).run();
          });
        });
      }
    };
    input.click();
  };

  return (
    <div
      className={`overflow-hidden ${className || ''}`}
      style={{
        backgroundColor: '#0d1119',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-1.5"
        style={{
          padding: '14px 18px',
          background: 'rgba(255, 255, 255, 0.015)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)"><Undo size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)"><Redo size={15} /></ToolbarButton>

        <div className="w-px h-5 mx-1.5 bg-white/8" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={15} /></ToolbarButton>

        <div className="w-px h-5 mx-1.5 bg-white/8" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)"><Bold size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)"><Italic size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)"><UnderlineIcon size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
          <span className="text-[11px] font-bold px-1 rounded bg-amber-400 text-black">H</span>
        </ToolbarButton>

        <div className="w-px h-5 mx-1.5 bg-white/8" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List"><ListOrdered size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Checklist"><CheckSquare size={15} /></ToolbarButton>

        <div className="w-px h-5 mx-1.5 bg-white/8" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote"><Quote size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code"><Code size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block"><FileCode size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus size={15} /></ToolbarButton>

        <div className="w-px h-5 mx-1.5 bg-white/8" />

        <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Add Link"><LinkIcon size={15} /></ToolbarButton>
        <ToolbarButton onClick={handleFileInput} title="Upload / Insert Image"><ImageIcon size={15} /></ToolbarButton>
      </div>

      {/* Editor Content Area */}
      <div style={{ padding: '8px 12px' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
