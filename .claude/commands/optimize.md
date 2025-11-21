# Optimize Performance Command

Analyze and optimize code for better performance.

## Instructions

Ask the user for:
1. Area to optimize (frontend, backend, database, build)
2. Current performance metrics (if available)
3. Target metrics or pain points
4. Specific files or features

Then analyze and provide optimization recommendations.

## Frontend Performance

### 1. React Optimization

**Unnecessary Re-renders:**
```typescript
// ❌ Component re-renders on every parent update
function ExpensiveComponent({ data }: Props) {
  return <div>{expensiveCalculation(data)}</div>;
}

// ✅ Memoized component
import { memo } from 'react';

export const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  return <div>{expensiveCalculation(data)}</div>;
});

// ✅ Memoized calculation
import { useMemo } from 'react';

function ExpensiveComponent({ data }: Props) {
  const result = useMemo(() => expensiveCalculation(data), [data]);
  return <div>{result}</div>;
}
```

**Expensive Callbacks:**
```typescript
// ❌ New function on every render
function Component() {
  return <Button onClick={() => handleClick(id)} />;
}

// ✅ Memoized callback
import { useCallback } from 'react';

function Component() {
  const handleButtonClick = useCallback(() => {
    handleClick(id);
  }, [id]);

  return <Button onClick={handleButtonClick} />;
}
```

**Code Splitting:**
```typescript
// ❌ All components loaded upfront
import { HeavyComponent } from './HeavyComponent';

// ✅ Lazy load
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 2. Image Optimization

```typescript
// ❌ Unoptimized images
<img src="/large-image.jpg" alt="Hero" />

// ✅ Optimized with modern formats and lazy loading
<picture>
  <source srcset="/image.avif" type="image/avif" />
  <source srcset="/image.webp" type="image/webp" />
  <img
    src="/image.jpg"
    alt="Hero"
    loading="lazy"
    width="800"
    height="600"
  />
</picture>

// ✅ With responsive sizes
<img
  srcset="
    /image-400.jpg 400w,
    /image-800.jpg 800w,
    /image-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
  src="/image-800.jpg"
  alt="Hero"
  loading="lazy"
/>
```

### 3. List Virtualization

```typescript
// ❌ Rendering 10,000 items
{items.map(item => <ListItem key={item.id} item={item} />)}

// ✅ Virtual list (only renders visible items)
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <ListItem
            key={items[virtualRow.index].id}
            item={items[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### 4. Debouncing/Throttling

```typescript
// ❌ API call on every keystroke
function SearchComponent() {
  const [query, setQuery] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    fetchResults(e.target.value); // Too many calls!
  };
}

// ✅ Debounced search
import { useDeferredValue } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (deferredQuery) {
      fetchResults(deferredQuery);
    }
  }, [deferredQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

// ✅ Or use a debounce library
import { useDebouncedCallback } from 'use-debounce';

function SearchComponent() {
  const handleSearch = useDebouncedCallback((value: string) => {
    fetchResults(value);
  }, 300);

  return <input onChange={e => handleSearch(e.target.value)} />;
}
```

## Backend Performance

### 1. Database Query Optimization

```typescript
// ❌ N+1 query problem
async function getUsersWithPosts() {
  const users = await db.select().from(users);

  for (const user of users) {
    user.posts = await db.select().from(posts).where(eq(posts.userId, user.id));
  }

  return users;
}

// ✅ Single query with join
async function getUsersWithPosts() {
  return await db
    .select()
    .from(users)
    .leftJoin(posts, eq(users.id, posts.userId));
}

// ✅ Or use ORM with eager loading
async function getUsersWithPosts() {
  return await db.query.users.findMany({
    with: {
      posts: true
    }
  });
}
```

### 2. Caching

```typescript
// ❌ No caching
app.get('/api/users/:id', async (req, res) => {
  const user = await db.select().from(users).where(eq(users.id, req.params.id));
  res.json(user);
});

// ✅ With Redis cache
import { redis } from './redis';

app.get('/api/users/:id', async (req, res) => {
  const cached = await redis.get(`user:${req.params.id}`);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.params.id));

  await redis.setex(`user:${req.params.id}`, 3600, JSON.stringify(user));

  res.json(user);
});
```

### 3. Connection Pooling

```typescript
// ❌ New connection per request
async function queryDatabase(sql: string) {
  const client = await createConnection();
  const result = await client.query(sql);
  await client.end();
  return result;
}

// ✅ Connection pool
import { Pool } from 'pg';

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function queryDatabase(sql: string) {
  const client = await pool.connect();
  try {
    return await client.query(sql);
  } finally {
    client.release();
  }
}
```

### 4. Pagination

```typescript
// ❌ Loading all records
app.get('/api/users', async (req, res) => {
  const users = await db.select().from(users); // Could be millions!
  res.json(users);
});

// ✅ Cursor-based pagination
app.get('/api/users', async (req, res) => {
  const { cursor, limit = 20 } = req.query;

  const users = await db
    .select()
    .from(users)
    .where(cursor ? gt(users.id, cursor) : undefined)
    .limit(Number(limit) + 1);

  const hasMore = users.length > Number(limit);
  const results = hasMore ? users.slice(0, -1) : users;
  const nextCursor = hasMore ? results[results.length - 1].id : null;

  res.json({
    data: results,
    nextCursor,
    hasMore
  });
});
```

### 5. Async Processing

```typescript
// ❌ Slow synchronous processing
app.post('/api/orders', async (req, res) => {
  const order = await createOrder(req.body);
  await sendEmail(order); // Blocks response
  await updateInventory(order); // Blocks response
  await notifyWarehouse(order); // Blocks response
  res.json(order);
});

// ✅ Background job queue
import { queue } from './queue';

app.post('/api/orders', async (req, res) => {
  const order = await createOrder(req.body);

  // Queue background tasks
  await queue.add('send-email', { orderId: order.id });
  await queue.add('update-inventory', { orderId: order.id });
  await queue.add('notify-warehouse', { orderId: order.id });

  res.json(order); // Fast response
});
```

## Build Optimization

### 1. Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Or with webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
```

### 2. Tree Shaking

```typescript
// ❌ Imports entire library
import _ from 'lodash';
const result = _.uniq(array);

// ✅ Import only what's needed
import uniq from 'lodash/uniq';
const result = uniq(array);

// Or use modern alternative
const result = [...new Set(array)];
```

### 3. Code Splitting

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  }
});
```

## Performance Monitoring

### 1. Web Vitals

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify(metric);
  navigator.sendBeacon('/analytics', body);
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### 2. React Profiler

```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

## Performance Checklist

### Frontend
- [ ] Components memoized where appropriate
- [ ] Expensive calculations memoized
- [ ] Code splitting for large bundles
- [ ] Images optimized (WebP/AVIF, lazy loading)
- [ ] Lists virtualized (>100 items)
- [ ] Debounced input handlers
- [ ] Service worker for caching

### Backend
- [ ] Database queries optimized (no N+1)
- [ ] Indexes on frequently queried columns
- [ ] Caching strategy implemented
- [ ] Connection pooling configured
- [ ] Pagination for large datasets
- [ ] Background jobs for slow tasks
- [ ] Response compression enabled

### Build
- [ ] Bundle size analyzed
- [ ] Tree shaking enabled
- [ ] Code splitting configured
- [ ] Dependencies audit (remove unused)
- [ ] Production build optimized

## Output Format

```markdown
# Performance Optimization Report

## Current Metrics
- Bundle size: Xmb
- LCP: Xms
- FID: Xms
- API response time: Xms
- Database query time: Xms

## Issues Found

### 1. [Issue Title]
**Impact:** High/Medium/Low
**Area:** Frontend/Backend/Database
**Description:** [What's slow]
**Fix:** [How to optimize]

## Optimizations Applied

### 1. [Optimization]
**Before:** [Metric]
**After:** [Metric]
**Improvement:** X%

## Recommendations

[Additional optimizations to consider]

## Performance Goals

- [ ] Bundle < 200kb
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] API < 200ms
- [ ] DB queries < 100ms
```

## Confirm with User

After optimization:
- Show performance improvements with metrics
- Run benchmarks to verify gains
- Check for regressions in functionality
- Document optimizations for team
