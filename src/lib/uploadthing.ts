import {
  generateUploadButton,
  generateUploadDropzone,
  generateUploader,
} from "@uploadthing/react";
import { genUploader } from "uploadthing/client";
import type { PostFileRouter } from "../app/api/uploadthing/core";

export const UploadButton = generateUploadButton<typeof PostFileRouter>();
export const UploadDropzone = generateUploadDropzone<typeof PostFileRouter>();

export const { uploadFiles } = genUploader<typeof PostFileRouter>({
  package: "uploadthing",
  
});
