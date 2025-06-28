import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"]
  ]
};

const formats = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "blockquote", "code-block",
  "link"
];

const QuillEditor = ({ value, onChange, placeholder }) => (
  <ReactQuill
    theme="snow"
    value={value}
    onChange={onChange}
    modules={modules}
    formats={formats}
    placeholder={placeholder}
    className="bg-white border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px]"
  />
);

export default QuillEditor;
