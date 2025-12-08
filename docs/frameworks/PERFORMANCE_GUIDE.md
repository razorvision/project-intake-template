# Performance Guide

Optimization strategies for web application performance.

## Table of Contents

- [Core Web Vitals](#core-web-vitals)
- [Next.js Optimizations](#nextjs-optimizations)
- [Image Optimization](#image-optimization)
- [Bundle Optimization](#bundle-optimization)
- [Database Performance](#database-performance)
- [Caching Strategies](#caching-strategies)
- [Monitoring](#monitoring)

---

## Core Web Vitals

### Key Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Time to largest visible element |
| **INP** (Interaction to Next Paint) | < 200ms | Responsiveness to user input |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability |

### Measuring Performance

```bash
# Lighthouse CLI
npx lighthouse https://your-site.com --view

# PageSpeed Insights API
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=YOUR_URL"
```

**Tools:**
- Chrome DevTools Performance tab
- Vercel Analytics
- WebPageTest.org
- PageSpeed Insights

---

## Next.js Optimizations

### Server Components (Default in App Router)

```typescript
// Server Component (default) - No client JS bundle
export default async function ProductList() {
  const products = await getProducts() // Runs on server
  
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  )
}

// Client Component - Only when needed
'use client'
export function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false)
  // Interactive component
}
```

### Static Generation

```typescript
// Static page (generated at build time)
export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  return <Article post={post} />
}

// Generate static params
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

// Revalidate every hour
export const revalidate = 3600
```

### Dynamic Imports

```typescript
import dynamic from 'next/dynamic'

// Load heavy component only when needed
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Client-only component
})

// Load on interaction
const Modal = dynamic(() => import('@/components/Modal'))
```

### Route Prefetching

```typescript
import Link from 'next/link'

// Prefetch enabled by default for viewport links
<Link href="/dashboard">Dashboard</Link>

// Disable prefetch for low-priority links
<Link href="/settings" prefetch={false}>Settings</Link>
```

---

## Image Optimization

### Next.js Image Component

```typescript
import Image from 'next/image'

// Optimized image with automatic sizing
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // LCP image - disable lazy loading
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Responsive image
<Image
  src="/product.jpg"
  alt="Product"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
```

### Image Best Practices

```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
      },
    ],
  },
}
```

### Lazy Loading

```typescript
// Images below fold - automatic lazy loading
<Image src="/below-fold.jpg" alt="..." loading="lazy" />

// Eager load LCP image
<Image src="/hero.jpg" alt="..." priority />
```

---

## Bundle Optimization

### Analyzing Bundle Size

```bash
# Install analyzer
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // config
})

# Run analysis
ANALYZE=true npm run build
```

### Tree Shaking

```typescript
// Bad: Import entire library
import _ from 'lodash'
const result = _.debounce(fn, 300)

// Good: Import specific function
import debounce from 'lodash/debounce'
const result = debounce(fn, 300)

// Best: Use native or lighter alternative
import { debounce } from 'lodash-es' // ES modules
```

### Code Splitting

```typescript
// Route-based splitting (automatic in App Router)
app/
  page.tsx        // Separate bundle
  dashboard/
    page.tsx      // Separate bundle

// Component-based splitting
const HeavyEditor = dynamic(
  () => import('@/components/Editor'),
  { loading: () => <EditorSkeleton /> }
)
```

### Reducing Dependencies

```bash
# Check dependency sizes
npx bundlephobia <package-name>

# Find unused dependencies
npx depcheck

# Find duplicate packages
npm ls <package-name>
```

**Common replacements:**

| Heavy Library | Lighter Alternative |
|---------------|--------------------|
| `moment` | `date-fns` or `dayjs` |
| `lodash` | Native JS or `lodash-es` |
| `axios` | Native `fetch` |
| `uuid` | `crypto.randomUUID()` |

---

## Database Performance

### Query Optimization

```typescript
// Bad: Select all fields
const users = await prisma.user.findMany()

// Good: Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
})

// Bad: N+1 queries
const posts = await prisma.post.findMany()
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } })
}

// Good: Include related data
const posts = await prisma.post.findMany({
  include: { author: { select: { name: true } } },
})
```

### Indexing

```prisma
model Post {
  id        String   @id
  authorId  String
  status    String
  createdAt DateTime @default(now())
  
  // Index for common queries
  @@index([authorId])
  @@index([status, createdAt(sort: Desc)])
}
```

### Connection Pooling

```typescript
// For serverless: Use connection pooler
// Neon, PlanetScale, Supabase all offer pooling

// DATABASE_URL should point to pooler
// DIRECT_URL for migrations only
```

---

## Caching Strategies

### HTTP Caching

```typescript
// API route with cache headers
export async function GET() {
  const data = await getData()
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
```

### React Query Caching

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minute
      gcTime: 5 * 60 * 1000,       // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Per-query configuration
useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  staleTime: 5 * 60 * 1000, // 5 minutes for user data
})
```

### Next.js Data Cache

```typescript
// Cached fetch (default)
const data = await fetch('https://api.example.com/data')

// Opt out of caching
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store',
})

// Revalidate periodically
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }, // 1 hour
})
```

### Memoization

```typescript
import { useMemo, useCallback, memo } from 'react'

// Memoize expensive calculations
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)

// Memoize callbacks
const handleClick = useCallback(
  (id: string) => selectItem(id),
  [selectItem]
)

// Memoize component
const ListItem = memo(function ListItem({ item }) {
  return <li>{item.name}</li>
})
```

---

## Monitoring

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Custom Performance Monitoring

```typescript
// Report Web Vitals
export function reportWebVitals(metric) {
  console.log(metric)
  
  // Send to analytics
  if (metric.label === 'web-vital') {
    sendToAnalytics({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    })
  }
}
```

### Performance Budget

```javascript
// next.config.js
module.exports = {
  experimental: {
    // Warn if page JS exceeds limit
    largePageDataBytes: 128 * 1000, // 128KB
  },
}
```

---

## Quick Wins Checklist

### Critical
- [ ] Use Next.js Image for all images
- [ ] Add `priority` to LCP image
- [ ] Use Server Components where possible
- [ ] Implement proper caching headers

### Important
- [ ] Lazy load below-fold content
- [ ] Use dynamic imports for heavy components
- [ ] Optimize database queries (no N+1)
- [ ] Add database indexes for common queries

### Nice to Have
- [ ] Analyze and reduce bundle size
- [ ] Replace heavy dependencies
- [ ] Implement stale-while-revalidate
- [ ] Add performance monitoring

---

## Related Documentation

- [Next.js Patterns](NEXTJS_PATTERNS.md) - Framework patterns
- [Database Patterns](DATABASE_PATTERNS.md) - Query optimization
- [Deployment Guide](../guides/infrastructure/DEPLOYMENT_GUIDE.md) - CDN and edge
