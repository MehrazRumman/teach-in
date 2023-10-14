import { useState, useCallback, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { bnAnsiToUnicode, reverseConverter } from './ansi_to_ bn';
interface EditorProps {
  onEditorChange?: (value: string) => void;
  onSubmit?: () => void;
  styles?: string;
  contents?: string;
  handleCancel?: () => void;
  isLoadingSubmit?: boolean;
  removeMessage?: string;
}

function RichEditor({ contents, onEditorChange }: EditorProps) {
  const [value, setValue] = useState<string>(contents || '');

  const translateText = useCallback(
    async (editor: any, bijoyText: string) => {
      const unicodeText = bnAnsiToUnicode(bijoyText);
      editor.selection.setContent(unicodeText);
      setValue(editor.getContent());
      onEditorChange?.(editor.getContent());
    },
    [onEditorChange],
  );

  const translateText2 = useCallback(
    async (editor: any, enText: string) => {
      const unicodeText = reverseConverter(enText);
      editor.selection.setContent(unicodeText);
      setValue(editor.getContent());
      onEditorChange?.(editor.getContent());
    },
    [onEditorChange],
  );

  const handleInit = useCallback(
    (editor: any) => {
      editor.ui.registry.addButton('convertButton', {
        text: 'Bangla',
        onAction: function () {
          const bijoyText = editor.selection.getContent({ format: 'text' });
          if (bijoyText) {
            translateText(editor, bijoyText);
          }
        },
      });

      editor.ui.registry.addButton('convertButton2', {
        text: 'English',
        onAction: function () {
          const engText = editor.selection.getContent({ format: 'text' });
          if (engText) {
            translateText2(editor, engText);
          }
        },
      });
    },
    [translateText],
  );
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      // Load MathJax plugin
      const pluginUrl = '/plugins/tinymce-mathjax/plugin.js';
      editorRef.current.editorManager.plugins.load('mathjax', pluginUrl);
    }
  }, []);

  return (
    <Editor
      onInit={(evt, editor) => (editorRef.current = editor)}
      apiKey="6tkqfd7lq9zh7ex76mtlqxlyg6bdrutbb7pl7tqan0zcf4qh"
      cloudChannel="5-stable"
      disabled={false}
      inline={false}
      onEditorChange={(newValue) => {
        setValue(newValue);
        if (onEditorChange) {
          onEditorChange(newValue);
        }
      }}
      visual="false"
      plugins=""
      tagName="div"
      textareaName=""
      value={value}
      outputFormat="html"
      init={{
        paste_data_images: true,
        automatic_uploads: true,
        images_upload_handler: async function (blobInfo, success, failure) {
          try {
            const formData = new FormData();
            formData.append('myImage', blobInfo.blob(), blobInfo.filename());
            formData.append('source', 'Editor');

            const { data } = await axios.post('/api/image', formData);

            success(data.downloadUrl);
          } catch (e) {
            failure('Image upload failed');
          }
        },
        menubar: true,
        plugins: [
          'code',
          'image,paste advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount mathjax',
        ],
        external_plugins: {
          mathjax: '/plugins/tinymce-mathjax/plugin.js',
        },
        mathjax: {
          lib: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js', // Adjust the path as needed
          symbols: { start: '\\(', end: '\\)' }, //optional: mathjax symbols
          configUrl: '/plugins/tinymce-mathjax/config.js', // Adjust the path as needed
        },
        toolbar:
          'subscript superscript  | bold italic color image,paste | mathjax | convertButton | convertButton2 | alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat formatselect ',
        setup: handleInit,
      }}
    />
  );
}

export default RichEditor;
