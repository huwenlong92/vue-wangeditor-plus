export type UploadKind = "image" | "video" | "file";

export interface UploadContext {
  kind: UploadKind;
  path: string;
}

export type UploadResult =
  | string
  | {
      url?: string;
      path?: string;
    };

export type UploadHandler = (
  file: File,
  context: UploadContext,
) => Promise<UploadResult>;

export interface WangEditorPlusProps {
  modelValue?: string;
  value?: string;
  placeholder?: string;
  height?: string;
  mode?: "default" | "simple";
  uploadPath?: string;
  imageUploadPath?: string;
  videoUploadPath?: string;
  fileUploadPath?: string;
  excludeKeys?: string[];
  scroll?: boolean;
  contentBleedX?: string;
  upload?: UploadHandler;
  resolveUploadUrl?: (path: string) => string;
}
