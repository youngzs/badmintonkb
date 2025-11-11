# Research: Youth Badminton Training Knowledge Platform

**Phase**: 0 - Outline & Research
**Date**: 2025-11-09
**Purpose**: Resolve technical unknowns and establish best practices for implementation

## Research Tasks Summary

1. **Static Site Generator Selection** (VuePress vs Docusaurus)
2. **WeChat Mini-Program WebView Integration Patterns**
3. **AI Image Generation Best Practices for Content**
4. **CDN Selection and Deployment Strategy**
5. **Content Structure and Metadata Schema**
6. **Mini-Program Performance Optimization Techniques**

---

## 1. Static Site Generator Selection

### Decision: VuePress 2.x

### Rationale:
- **Chinese Ecosystem**: VuePress has strong adoption in Chinese developer community, better Chinese documentation
- **Mobile-First**: Easier to customize for mobile-first responsive design with Vue 3 components
- **Lightweight**: Smaller bundle sizes compared to Docusaurus (important for CDN bandwidth costs)
- **Markdown Extensions**: Rich plugin ecosystem for Chinese content (bilingual glossary, terminology tooltips)
- **WeChat Integration**: Existing VuePress plugins for WeChat sharing metadata optimization
- **Performance**: Excellent static generation performance for 100+ pages

### Alternatives Considered:
- **Docusaurus 3.x**: More feature-rich but React-based (larger bundles), less Chinese community support
- **VitePress**: Newer, faster but less mature plugin ecosystem, may lack needed features
- **Custom Next.js SSG**: Overkill for pure static content, adds unnecessary complexity

### Implementation Notes:
- Use VuePress 2.x with Vue 3 composition API
- Custom theme based on default theme with mobile-first modifications
- Plugins needed: search, image optimization, markdown-it extensions for Chinese typography

---

## 2. WeChat Mini-Program WebView Integration Patterns

### Decision: Hybrid Navigation Pattern

### Rationale:
- **Performance**: Native mini-program tabs for primary navigation (home, categories, AI) + WebView for article content
- **User Experience**: Native navigation feels more responsive, preserves WeChat UX patterns
- **Sharing**: Native pages can use wx.shareAppMessage API directly without WebView limitations
- **Offline**: Native pages work offline, WebView requires network for CDN content
- **2MB Limit**: Minimal native code keeps package size under limit

### Pattern Details:

```javascript
// Mini-program structure
pages/
├── home/           // Native tab - category navigation
├── webview/        // WebView display for articles
├── ai-modal/       // Native overlay for AI suggestions
└── search/         // Native search with results linking to WebView

// URL scheme for WebView
https://cdn.example.com/articles/{category}/{article-slug}.html?source=miniprogram
```

### Best Practices:
1. **Message Passing**: Use `wx.postMessage` from WebView to notify mini-program of user actions (share clicks)
2. **Loading States**: Show native loading skeleton before WebView renders
3. **Error Handling**: Native fallback page for WebView load failures
4. **Deep Linking**: Support direct article links via mini-program QR codes → open in WebView

### Alternatives Considered:
- **Full WebView**: Single WebView for entire app - worse UX, can't use native sharing
- **Full Native**: Re-implement all content rendering natively - violates static content architecture
- **WebView-only with JSSDK**: WeChat JSSDK in WebView - more complex, permission issues

---

## 3. AI Image Generation Best Practices for Content

### Decision: Pre-generation Pipeline with Manual Review Workflow

### Rationale:
- **Quality Control**: Manual expert review ensures technical accuracy before publishing
- **Performance**: No runtime generation delay, images served directly from CDN
- **Cost Control**: Generate once during content creation, not per-user-view
- **Versioning**: Images versioned with content in Git

### Pipeline Workflow:

```text
1. Content Author writes article in Markdown
   └─> Includes image placeholders: ![训练动作](./images/GENERATE:shoulder-rotation-drill.png)

2. Script scans for GENERATE: prefixes
   └─> Calls image-gen-server MCP with prompts from article context
   └─> Saves generated images to content/[section]/images/

3. Expert reviews generated images
   └─> Approves or regenerates with refined prompts
   └─> Updates Markdown to reference final image filenames

4. Git commit includes article.md + approved images
   └─> CI/CD validates image references, builds static site
```

### Prompt Template for Image Generation:

```text
Generate a technical illustration for youth badminton training:
- Subject: {exercise/technique name from article}
- Age Group: {4-6, 7-9, 10-12, or 13-15 years}
- Style: Clean educational diagram, suitable for children/parents
- Key Elements: {specific anatomical/movement details from article}
- Safety: Show proper form, avoid injury-prone positions
- Cultural: Asian athlete representation preferred
```

### Quality Gates:
- ✅ Anatomically accurate for specified age group
- ✅ Clear visual distinction from adult training
- ✅ No text in images (supports multilingual future)
- ✅ Consistent illustration style across platform

### Alternatives Considered:
- **Stock Photos**: Limited availability for youth badminton-specific content
- **Manual Illustration**: Too expensive/slow for 200-500 images
- **Runtime Generation**: Adds latency, costs, and complexity

---

## 4. CDN Selection and Deployment Strategy

### Decision: Aliyun OSS + CDN (阿里云对象存储 + CDN)

### Rationale:
- **China Performance**: Best performance for Chinese users (primary audience)
- **WeChat Integration**: Trusted domain for mini-program WebView (no blocklist issues)
- **Cost-Effective**: Competitive pricing for bandwidth and storage
- **Tooling**: Official SDKs for Node.js deployment scripts
- **HTTPS**: Free SSL certificates for custom domains

### Configuration:

```yaml
# CDN Configuration
Domain: https://knowledge.badminton-training.cn
Origin: Aliyun OSS bucket
Cache Rules:
  - HTML: 5 minutes (allow content updates)
  - Images/CSS/JS: 30 days (immutable with hash in filename)
  - Error pages: No cache

OSS Bucket Structure:
/articles/{section}/{slug}/index.html
/articles/{section}/{slug}/images/*.png
/assets/css/*.css (with content hash)
/assets/js/*.js (with content hash)
```

### Deployment Process:

```bash
# scripts/deploy-cdn.sh
1. Build static site: npm run docs:build
2. Generate file manifest with hashes
3. Upload new/changed files to OSS
4. Purge CDN cache for HTML files only
5. Update mini-program CDN URL config if needed
```

### Performance Optimizations:
- **Image Format**: Convert PNG → WebP with fallback for older devices
- **Compression**: Gzip for text, Brotli for modern browsers
- **Lazy Loading**: Images loaded on scroll (via Intersection Observer in HTML)
- **Preconnect**: DNS prefetch for CDN domain in mini-program

### Alternatives Considered:
- **Tencent Cloud**: Good WeChat integration but higher costs
- **Cloudflare**: Great global performance but China access issues
- **Self-hosted**: Operational burden, worse performance

---

## 5. Content Structure and Metadata Schema

### Decision: Frontmatter-Based Metadata with Taxonomy

### Schema:

```yaml
---
# Required Metadata (all articles)
title: "速度与敏捷性训练"
section: "age-groups"  # or theory, guidance, resources
category: "foundation-7-9"
subcategory: "physical-training"
age_group: [7, 8, 9]
tags: ["体能训练", "速度", "敏捷性"]
author: "专家姓名"
reviewed_by: "审核专家"
created_date: "2025-11-01"
last_modified: "2025-11-05"

# Optional Metadata
reading_time: 8  # minutes
difficulty: "基础"  # 基础, 进阶, 高级
video_refs: ["v001-speed-drills"]
related_articles: ["coordination-training", "footwork-basics"]
safety_level: "低风险"  # 低风险, 中风险, 高风险 (requires supervision)

# SEO & Sharing
description: "7-9岁儿童速度与敏捷性训练方法,包括科学依据、训练计划和安全注意事项"
keywords: ["青少年羽毛球", "体能训练", "速度训练"]
cover_image: "./images/speed-training-cover.png"
---

# Article Content in Markdown
```

### Directory Naming Convention:

```text
content/
├── age-groups/
│   ├── 01-enlightenment-4-6/     # Prefix for sort order
│   ├── 02-foundation-7-9/
│   ├── 03-development-10-12/
│   └── 04-advanced-13-15/
├── theory/
│   ├── 05-technique-theory/       # Continue numbering for global order
│   ├── 06-physical-science/
│   ├── 07-injury-prevention/
│   ├── 08-nutrition/
│   └── 09-psychology/
```

### Content Validation Rules:
1. All required frontmatter fields present
2. Age group values valid (4-15)
3. Tags limited to predefined taxonomy
4. Image references exist in filesystem
5. Internal links resolve to existing articles
6. Reading time matches content length (auto-calculated)

---

## 6. Mini-Program Performance Optimization Techniques

### Decision: Multi-Layer Caching + Progressive Enhancement

### Optimization Strategies:

#### 1. **Navigation Preloading**
```javascript
// Preload article HTML when user hovers/touches category
wx.request({
  url: `https://cdn.../articles/${slug}.html`,
  method: 'GET',
  success: (res) => {
    // Store in memory cache
    articleCache.set(slug, res.data);
  }
});
```

#### 2. **WebView Reuse**
```javascript
// Reuse same WebView instance for different articles
// Change src instead of creating new WebView
this.setData({
  webviewUrl: newArticleUrl
});
```

#### 3. **Local Storage Caching**
```javascript
// Cache frequently accessed articles in local storage
wx.setStorage({
  key: `article:${slug}`,
  data: htmlContent,
  success: () => {
    // Serve from cache on next visit
    // Background refresh for updates
  }
});
```

#### 4. **Skeleton Screens**
```xml
<!-- Show instant loading feedback -->
<view wx:if="{{loading}}" class="skeleton">
  <view class="skeleton-title"></view>
  <view class="skeleton-paragraph"></view>
</view>
```

#### 5. **Image Lazy Loading in WebView HTML**
```html
<!-- Generated by VuePress with lazy loading -->
<img src="placeholder.png"
     data-src="actual-image.webp"
     loading="lazy"
     class="lazyload" />
```

#### 6. **AI Suggestion Caching**
```javascript
// Cache AI suggestions by input hash
const cacheKey = `ai:${hashInputs(age, focus, intensity)}`;
const cached = await wx.getStorage({key: cacheKey});
if (cached && Date.now() - cached.timestamp < 86400000) {
  return cached.suggestion;  // Use 24h cache
}
```

### Performance Targets:
- **Mini-program Launch**: <2s cold start
- **Article Navigation**: <500ms transition (from cache)
- **First Content Paint**: <1.5s on 4G (CDN + preload)
- **AI Suggestion**: <10s (with loading indicator)

### Monitoring:
```javascript
// Track performance metrics
wx.reportAnalytics('article_load_time', {
  slug: articleSlug,
  duration: loadEndTime - loadStartTime,
  source: 'cache' | 'network'
});
```

---

## Technology Stack Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Static Site Generator** | VuePress | 2.x | Chinese ecosystem, mobile-first, lightweight |
| **Frontend Framework** | Vue 3 | 3.x | VuePress dependency, composition API |
| **Mini-Program** | WeChat MP | Latest SDK | Primary distribution platform |
| **CDN/Storage** | Aliyun OSS + CDN | - | China performance, WeChat integration |
| **AI Image Gen** | image-gen-server MCP | - | Pre-generation pipeline |
| **AI Content** | GPT-like API | - | On-demand suggestions |
| **Build Tool** | Vite | 5.x | VuePress 2 uses Vite |
| **Content Validation** | Markdownlint + Custom | - | Quality assurance |
| **CI/CD** | GitHub Actions | - | Automated deployment |

---

## Open Questions / Risks

### Resolved in Clarifications:
- ✅ Content creation strategy (all 18 sections before launch)
- ✅ AI image integration (pre-generation with review)
- ✅ Storage architecture (static Markdown → CDN)
- ✅ Mini-program integration (WebView with native wrapper)
- ✅ Dynamic AI scope (training plans/nutrition suggestions in overlay)

### Remaining Risks:
1. **Content Creation Timeline**: 100+ expert articles may take 3-6 months
   - Mitigation: Parallel content creation, templates, content guidelines
2. **Mini-Program Approval**: WeChat审核 may reject WebView-heavy apps
   - Mitigation: Follow WeChat guidelines, provide fallback native pages
3. **AI API Costs**: On-demand generation could be expensive at scale
   - Mitigation: Aggressive caching, rate limiting, quota system
4. **CDN Bandwidth**: 500 concurrent users viewing image-rich content
   - Mitigation: Image optimization (WebP), CDN caching, lazy loading

---

## Next Steps (Phase 1)

1. Create `data-model.md` - Define content entities and relationships
2. Create `contracts/ai-api.yaml` - API contract for AI suggestion service
3. Create `contracts/content-schema.yaml` - Frontmatter validation schema
4. Create `quickstart.md` - Developer setup and workflow guide
5. Update agent context with technology stack decisions
