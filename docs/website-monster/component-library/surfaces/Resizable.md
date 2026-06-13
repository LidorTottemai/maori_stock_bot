# Resizable

> **קטגוריה:** surfaces
> **תלויות:** react-resizable-panels
> **Storybook:** src/stories/surfaces/Resizable.stories.tsx
> **קוד:** src/surfaces/Resizable.tsx
> **עלות בנייה:** ~25 דקות

## מה זה
Panel layout עם drag handles לשינוי גדלים. Wrapper מעל react-resizable-panels. שימושי ל-split views, IDE layouts, dashboards עם panels ניתנים לשינוי.

## Variants / Stories
| Story | תיאור |
|-------|-------|
| Horizontal split | שני panels זה לצד זה |
| Vertical split | שני panels זה מתחת לזה |
| Three panels | sidebar + main + preview |
| Collapsible | panel שניתן לסגור לגמרי |
| Min/Max sizes | הגבלות גודל |

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| direction | `'horizontal' \| 'vertical'` | `'horizontal'` | — |
| children | `ReactNode` | — | `ResizablePanel` + `ResizableHandle` |

```tsx
// Component structure:
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={30} minSize={20}>left</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={70}>right</ResizablePanel>
</ResizablePanelGroup>
```

## שימוש בסיסי
```tsx
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@tottemai/ui"

<ResizablePanelGroup direction="horizontal" className="h-[400px]">
  <ResizablePanel defaultSize={25} minSize={15}>
    <div>Sidebar</div>
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={75}>
    <div>Main Content</div>
  </ResizablePanel>
</ResizablePanelGroup>
```

## קוד מלא
```tsx
"use client"
// src/surfaces/Resizable.tsx
import * as React from "react"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"
import { cn } from "../cn"

const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PanelGroup>
>(({ className, ...props }, ref) => (
  <PanelGroup
    className={cn("resizable-group", className)}
    {...props}
  />
))
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizablePanel = Panel

interface ResizableHandleProps {
  withHandle?: boolean
  className?: string
}

function ResizableHandle({ withHandle, className }: ResizableHandleProps) {
  return (
    <PanelResizeHandle className={cn("resizable-handle", className)}>
      {withHandle && <div className="resizable-handle-grip" />}
      <style>{`
        .resizable-handle {
          position: relative; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          background: var(--color-border);
          transition: background 0.15s;
        }
        .resizable-handle:hover, .resizable-handle[data-resize-handle-active] { background: var(--color-primary); }
        [data-panel-group-direction="horizontal"] > .resizable-handle { width: 4px; cursor: col-resize; }
        [data-panel-group-direction="vertical"] > .resizable-handle { height: 4px; cursor: row-resize; }
        .resizable-handle-grip {
          width: 16px; height: 16px; border-radius: 9999px;
          background: var(--color-surface); border: 1px solid var(--color-border);
          display: flex; align-items: center; justify-content: center;
          z-index: 1;
        }
        .resizable-group { display: flex; width: 100%; height: 100%; }
        [data-panel-group-direction="vertical"] { flex-direction: column; }
      `}</style>
    </PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
```

## בדיקות סיום
- [ ] Drag handle פועל
- [ ] Min/Max sizes נשמרים
- [ ] Horizontal + Vertical פועלים
- [ ] CSS variables בלבד
- [ ] מיוצא ב-src/index.ts
- [ ] Story ב-Storybook

← [[00 - Library Overview & Build Plan]]
