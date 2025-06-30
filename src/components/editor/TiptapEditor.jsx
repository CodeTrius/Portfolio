import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import YouTube from '@tiptap/extension-youtube';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import MenuBar from './MenuBar';

const TiptapEditor = ({ content, onContentChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),

            width: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.width) return {};
                return { width: attributes.width };
              },
            },
            height: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.height) return {};
                return { height: attributes.height };
              },
            },
            alt: {
              default: null,
            },
          };
        },
        renderHTML({ HTMLAttributes }) {
          return ['img', { ...HTMLAttributes }];
        },
      }),
      Placeholder.configure({
        placeholder: 'Comece a escrever aqui...',
      }),
      YouTube.configure({
        controls: true,
        nocookie: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-wrapper', 
      },
    },
  });

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;