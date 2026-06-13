# ActivityFeed

> **קטגוריה:** dashboard
> **תלויות:** none
> **קוד:** src/dashboard/ActivityFeed.tsx
> **עלות בנייה:** ~15 דקות

## מה זה
רשימת פעילויות לאורך זמן — "הזמנה חדשה", "לקוח רשם", "תשלום התקבל". טיימליין אנכי עם icon + timestamp.

## Props API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | `ActivityItem[]` | required | |
| maxItems | `number` | `10` | |
| showTimestamps | `boolean` | `true` | |

```ts
interface ActivityItem {
  id: string
  label: string
  description?: string
  timestamp: Date | string
  icon?: React.ReactNode
  type?: "success" | "warning" | "error" | "info"
}
```

## שימוש בסיסי
```tsx
import { ActivityFeed } from "@tottemai/graphs"

<ActivityFeed
  items={[
    { id: "1", label: "הזמנה חדשה", description: "רות כהן — עיסוי שוודי", timestamp: new Date(), type: "success" },
    { id: "2", label: "תשלום התקבל", description: "₪350", timestamp: new Date(Date.now() - 3600000), type: "info" },
  ]}
/>
```

## קוד מלא
```tsx
// src/dashboard/ActivityFeed.tsx
import { cn } from "@tottemai/ui"
import { formatDistanceToNow } from "date-fns"
import { he } from "date-fns/locale"

interface ActivityItem {
  id: string
  label: string
  description?: string
  timestamp: Date | string
  icon?: React.ReactNode
  type?: "success" | "warning" | "error" | "info"
}

const typeColors = {
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error:   "bg-red-500",
  info:    "bg-[var(--color-primary)]",
}

interface Props {
  items: ActivityItem[]
  maxItems?: number
  showTimestamps?: boolean
}

export function ActivityFeed({ items, maxItems = 10, showTimestamps = true }: Props) {
  const displayed = items.slice(0, maxItems)

  return (
    <ol className="space-y-4">
      {displayed.map((item, i) => (
        <li key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0", typeColors[item.type ?? "info"])} />
            {i < displayed.length - 1 && <div className="w-px flex-1 bg-[var(--color-border)] mt-1" />}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium text-[var(--color-text)]">{item.label}</p>
            {item.description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.description}</p>}
            {showTimestamps && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: he })}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
```

## בדיקות סיום
- [ ] Timeline קו אנכי בין items
- [ ] type colors נכונים
- [ ] timestamp בעברית (date-fns/locale/he)
- [ ] maxItems עובד
- [ ] מיוצא ב-src/index.ts

← [[../00 - Library Overview & Build Plan]]
