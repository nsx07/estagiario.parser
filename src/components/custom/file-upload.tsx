"use client";
import { proccess } from "@/proccess/parser";
import { useState } from "react";

export interface FileUploadProps {
  label: string;
  width?: string;
  height?: string;
  onFileUpload?: (file: File) => void;
}

export const FileUpload = ({
  label,
  width,
  height,
  onFileUpload,
}: FileUploadProps) => {
  const [file, setFile] = useState<string>();
  const [buffer, setBuffer] = useState<File>();
  const [fileEnter, setFileEnter] = useState(false);
  const [hover, setHover] = useState<boolean>(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files;
    if (files && files[0]) {
      let blobUrl = URL.createObjectURL(files[0]);
      setBuffer(files[0]);
      setFile(blobUrl);

      if (onFileUpload) {
        onFileUpload(files[0]);
      }
    }
  };

  return (
    <div>
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setFileEnter(true);
          }}
          onDragLeave={(e) => {
            setFileEnter(false);
          }}
          onDragEnd={(e) => {
            e.preventDefault();
            setFileEnter(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setFileEnter(false);
            if (e.dataTransfer.items) {
              [...e.dataTransfer.items].forEach((item, i) => {
                if (item.kind === "file") {
                  const file = item.getAsFile();
                  if (file) {
                    let blobUrl = URL.createObjectURL(file);
                    setFile(blobUrl);
                  }
                  console.log(`items file[${i}].name = ${file?.name}`);
                }
              });
            } else {
              [...e.dataTransfer.files].forEach((file, i) => {
                console.log(`… file[${i}].name = ${file.name}`);
              });
            }
          }}
          className={`${fileEnter ? "border-4 " : "border-2 "} ${
            width ? width : "w-full max-w-xs "
          } ${height ? height : "h-72"}
          bg-zinc-300 dark:bg-zinc-600 flex flex-col rounded border-dotted items-center justify-center`}
        >
          <label
            htmlFor="file"
            className={`${width ? width : "w-full max-w-xs "} ${
              height ? height : "h-72"
            } h-full w-full flex justify-center items-center gap-3 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors duration-300 ease-in-out cursor-pointer`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            {label}
          </label>
          <input
            id="file"
            type="file"
            className="hidden"
            onChange={(e) => handleFile(e)}
          />
        </div>
      ) : (
        <div className="relative w-max">
          <object
            className="rounded-md w-full max-w-xs h-full object-scale-down aspect-auto"
            data={file}
            type="image/png"
          />
          {/* <div
            className={`${
              hover ? "backdrop-blur" : ""
            } absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center rounded transition-all duration-300 ease-in-out`}
          >
            <button
              onClick={() => setFile("")}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              className="p-4 uppercase tracking-widest outline-none text-zinc-900 bg-gray-200 bg-opacity-90 rounded-full "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                className="w-5 h-5"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
};
