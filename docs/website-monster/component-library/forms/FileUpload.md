# FileUpload

> **קטגוריה:** forms
> **תלויות:** react-dropzone
> **Storybook:** src/stories/forms/FileUpload.stories.tsx
> **קוד:** src/forms/FileUpload.tsx
> **עלות בנייה:** ~30 דקות

## מה זה
אזור drag & drop להעלאת קבצים. תומך בהגבלת סוגי קבצים, גודל מקסימלי, multiple files, progress indicator. שימושי בטפסים עם תמונות/מסמכים.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Default | drag & drop zone |
| Image only | accept="image/*" |
| Multiple | מספר קבצים |
| With preview | תצוגה מקדימה של תמונות |
| With progress | progress bar בזמן upload |
| Error | failed upload state |
| Compact | גרסה קטנה לטפסים |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onFilesAccepted | `(files: File[]) => void` | — | callback בקבלת קבצים תקינים |
| accept | `Record<string, string[]>` | — | e.g. `{'image/*': ['.jpg', '.png']}` |
| maxSize | `number` | — | bytes |
| maxFiles | `number` | `1` | — |
| disabled | `boolean` | false | — |
| label | `string` | `"גרור קבצים לכאן"` | — |
| sublabel | `string` | — | e.g. "PNG, JPG עד 5MB" |

## שימוש בסיסי
```tsx
import { FileUpload } from "@tottemai/ui"

<FileUpload
  accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
  maxSize={5 * 1024 * 1024}
  onFilesAccepted={(files) => handleUpload(files)}
  label="העלאת תמונה"
  sublabel="PNG, JPG עד 5MB"
/>
```

## קוד מלא
```tsx
"use client"
// src/forms/FileUpload.tsx
import * as React from "react"
import { useDropzone, DropzoneOptions } from "react-dropzone"
import { cn } from "../cn"

interface FileUploadProps extends Pick<DropzoneOptions, "accept" | "maxSize" | "maxFiles" | "disabled"> {
  onFilesAccepted?: (files: File[]) => void
  label?: string
  sublabel?: string
  className?: string
}

function FileUpload({ onFilesAccepted, accept, maxSize, maxFiles = 1, disabled, label = "גרור קבצים לכאן", sublabel, className }: FileUploadProps) {
  const [files, setFiles] = React.useState<File[]>([])
  const [errors, setErrors] = React.useState<string[]>([])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept,
    maxSize,
    maxFiles,
    disabled,
    onDropAccepted(accepted) {
      setFiles(accepted)
      setErrors([])
      onFilesAccepted?.(accepted)
    },
    onDropRejected(rejected) {
      setErrors(rejected.map((r) => r.errors[0]?.message ?? "קובץ לא תקין"))
    },
  })

  return (
    <div className={cn("fileupload-wrapper", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "fileupload-zone",
          isDragActive && !isDragReject && "fileupload-zone--active",
          isDragReject && "fileupload-zone--reject",
          disabled && "fileupload-zone--disabled",
        )}
      >
        <input {...getInputProps()} />
        <svg className="fileupload-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 8v16M13 15l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 30h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="fileupload-label">{isDragActive ? "שחרר לכאן..." : label}</p>
        {sublabel && <p className="fileupload-sublabel">{sublabel}</p>}
      </div>

      {files.length > 0 && (
        <ul className="fileupload-filelist">
          {files.map((f) => (
            <li key={f.name} className="fileupload-fileitem">
              <span className="fileupload-filename">{f.name}</span>
              <span className="fileupload-filesize">{(f.size / 1024).toFixed(0)} KB</span>
            </li>
          ))}
        </ul>
      )}

      {errors.length > 0 && (
        <ul className="fileupload-errors">
          {errors.map((e, i) => <li key={i} className="fileupload-error">{e}</li>)}
        </ul>
      )}

      <style>{`
        .fileupload-zone {
          border: 2px dashed var(--color-border); border-radius: var(--radius-lg, 12px);
          padding: 32px 24px; text-align: center; cursor: pointer; background: var(--color-surface);
          transition: border-color 0.15s, background 0.15s;
        }
        .fileupload-zone:hover { border-color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 5%, transparent); }
        .fileupload-zone--active { border-color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 8%, transparent); }
        .fileupload-zone--reject { border-color: var(--color-error, #ef4444); }
        .fileupload-zone--disabled { opacity: 0.5; cursor: not-allowed; }
        .fileupload-icon { color: var(--color-text-muted); margin: 0 auto 12px; }
        .fileupload-label { font-size: 0.9375rem; color: var(--color-text); font-weight: 500; }
        .fileupload-sublabel { font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 4px; }
        .fileupload-filelist { margin-top: 12px; list-style: none; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .fileupload-fileitem { display: flex; justify-content: space-between; padding: 8px 12px; background: var(--color-surface-2); border-radius: var(--radius-sm, 4px); font-size: 0.875rem; }
        .fileupload-filename { color: var(--color-text); }
        .fileupload-filesize { color: var(--color-text-muted); }
        .fileupload-errors { margin-top: 8px; list-style: none; padding: 0; }
        .fileupload-error { font-size: 0.75rem; color: var(--color-error, #ef4444); }
      `}</style>
    </div>
  )
}

export { FileUpload }
```

## בדיקות סיום
- [ ] Drag & drop פועל
- [ ] Paste / click לבחירה פועלים
- [ ] maxSize / accept validation פועלים
- [ ] CSS variables בלבד
- [ ] Accessible (keyboard nav)
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
