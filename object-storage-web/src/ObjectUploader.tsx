import type { ReactNode } from "react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: (file: any) => Promise<{ method: "PUT"; url: string; headers?: Record<string, string> }>;
  onComplete?: (result: any) => void;
  buttonClassName?: string;
  children: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ObjectUploader({ buttonClassName, children, onChange }: ObjectUploaderProps) {
  return (
    <label className={buttonClassName} style={{ cursor: "pointer", display: "block", textAlign: "center" }}>
      {children}
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
    </label>
  );
}
