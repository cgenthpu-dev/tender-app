import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ initialValue, onChange }) => {
    const editorRef = useRef(null);

    return (
        <div className="rich-text-editor h-full">
            <Editor
                onInit={(evt, editor) => editorRef.current = editor}
                initialValue={initialValue}
                onEditorChange={onChange}
                tinymceScriptSrc="/tinymce/tinymce.min.js" // Point to local self-hosted script
                init={{
                    license_key: 'gpl',
                    height: "100%",
                    menubar: true,
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'table | removeformat | help',
                    content_css: ['https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css'],
                    content_style: `
                        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
                        body { 
                            font-family: 'Montserrat', sans-serif; 
                            font-size: 14px; 
                            line-height: 1.6; 
                            color: #000;
                            margin: 1rem;
                        }
                        p { margin-bottom: 0.75rem; }
                        strong { font-weight: 700; }
                    `,
                    branding: false,
                    promotion: false,
                    statusbar: false,
                    // Table configuration
                    table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
                    table_appearance_options: false,
                    table_grid: false,
                    table_resize_bars: true,
                    object_resizing: true,
                }}
            />
        </div>
    );
};

export default RichTextEditor;
