# Data Model: Youth Badminton Training Knowledge Platform

**Feature**: Youth Badminton Training Knowledge Platform
**Date**: 2025-11-09
**Purpose**: Define entities, relationships, validation rules, and state management

## Overview

The data model supports a hierarchical content structure with 4 age groups, 18 content sections, 200-300 training modules, plus AI-generated content, shareable links, and resource assets. The model is designed for:

- **Content Management**: Editorial workflows in Strapi CMS
- **API Delivery**: RESTful/GraphQL APIs serving mini-program and H5 clients
- **Caching**: Redis caching layer for performance optimization
- **Search**: Elasticsearch indexing for full-text search
- **Analytics**: Event tracking and metrics aggregation

## Entity Relationship Diagram

```text
┌─────────────────┐
│  Age Group      │
│  (4 instances)  │
│  - 4-6 years    │
│  - 7-9 years    │
│  - 10-12 years  │
│  - 13-15 years  │
└────────┬────────┘
         │ 1:N
         │
         ▼
┌─────────────────────────────┐         ┌────────────────┐
│  Content Section            │         │  User Role     │
│  (18 instances)             │         │  - Coach       │
│  - 4 age-specific           │         │  - Parent      │
│  - 9 theory modules         │         │  - Athlete     │
│  - 2 guidance modules       │         └────────────────┘
│  - 4 resource libraries     │
└────────────┬────────────────┘
             │ 1:N
             │
             ▼
    ┌────────────────────┐         ┌─────────────────┐
    │  Training Module   │◄────────│  Resource Asset │
    │  (200-300)         │   N:N   │  - Videos       │
    │  - Physical        │         │  - Templates    │
    │  - Technical       │         │  - Assessments  │
    │  - Mental          │         └─────────────────┘
    │  - Theoretical     │
    └─────────┬──────────┘
              │
              │ Referenced by
              │
    ┌─────────▼──────────┐
    │  AI Generated      │
    │  Content           │
    │  - Training plans  │
    │  - Illustrations   │
    │  - Nutrition       │
    └────────────────────┘
              │
              │ Can be shared
              │
    ┌─────────▼──────────┐
    │  Shareable Link    │
    │  - WeChat card     │
    │  - H5 URL          │
    │  - QR code         │
    └────────────────────┘
```

## Core Entities

### 1. Age Group

**Purpose**: Represents developmental stages for content organization

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | UUID | Yes | Auto-generated | Unique identifier |
| `name` | String | Yes | Max 50 chars | Display name (e.g., "启蒙期（4-6岁）") |
| `slug` | String | Yes | Unique, URL-safe | URL-friendly identifier (e.g., "enlightenment-4-6") |
| `age_range_start` | Integer | Yes | 4-15 | Starting age (inclusive) |
| `age_range_end` | Integer | Yes | 4-15, >= start | Ending age (inclusive) |
| `description` | Text | Yes | Max 500 chars | Overview of developmental stage |
| `order` | Integer | Yes | Unique, 1-4 | Display order |
| `icon_url` | String | No | Valid URL | Icon for navigation |
| `color` | String | No | Hex color code | Theme color for UI |
| `created_at` | Timestamp | Yes | Auto-generated | Creation timestamp |
| `updated_at` | Timestamp | Yes | Auto-updated | Last modification timestamp |

**Relationships**:
- `content_sections` (1:N) - Many content sections belong to age group
- `training_modules` (1:N) - Many training modules belong to age group

**Validation Rules**:
- `age_range_end >= age_range_start`
- `slug` must be unique across all age groups
- `order` must be 1, 2, 3, or 4 (for the 4 age groups)

**Sample Data**:
```json
{
  "id": "uuid-1",
  "name": "启蒙期（4-6岁）",
  "slug": "enlightenment-4-6",
  "age_range_start": 4,
  "age_range_end": 6,
  "description": "建立基本运动模式，培养兴趣与协调性",
  "order": 1,
  "icon_url": "https://cdn.example.com/icons/age-4-6.png",
  "color": "#FF6B6B"
}
```

---

### 2. Content Section

**Purpose**: Major organizational divisions (18 total) within the knowledge base

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | UUID | Yes | Auto-generated | Unique identifier |
| `name` | String | Yes | Max 100 chars | Display name (e.g., "体能训练模块") |
| `slug` | String | Yes | Unique, URL-safe | URL-friendly identifier |
| `category` | Enum | Yes | See values below | Section category |
| `age_group_id` | UUID | No | Valid age group ID | Belongs to age group (null for theory/guidance) |
| `description` | Text | Yes | Max 1000 chars | Section overview |
| `order` | Integer | Yes | Unique per age group | Display order within parent |
| `icon_url` | String | No | Valid URL | Section icon |
| `parent_section_id` | UUID | No | Valid section ID | For nested sections (e.g., subsections) |
| `published` | Boolean | Yes | Default: false | Published status |
| `created_at` | Timestamp | Yes | Auto-generated | Creation timestamp |
| `updated_at` | Timestamp | Yes | Auto-updated | Last modification timestamp |

**Enum Values**:
- `category`: `age_specific`, `theory`, `guidance`, `resources`

**Relationships**:
- `age_group` (N:1) - Belongs to age group (optional, null for theory/guidance/resources)
- `training_modules` (1:N) - Contains many training modules
- `parent_section` (N:1, optional) - Nested section structure

**Validation Rules**:
- If `category = "age_specific"`, `age_group_id` must not be null
- If `category != "age_specific"`, `age_group_id` must be null
- `slug` must be unique across all sections
- `order` must be unique within the same `age_group_id` (or within root if no age group)

**Sample Data**:
```json
{
  "id": "uuid-section-1",
  "name": "体能训练模块",
  "slug": "physical-training",
  "category": "age_specific",
  "age_group_id": "uuid-1",
  "description": "针对4-6岁儿童的基础运动能力、协调性和柔韧性训练",
  "order": 1,
  "published": true
}
```

---

### 3. Training Module

**Purpose**: Specific training topics with detailed content (200-300 modules)

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | UUID | Yes | Auto-generated | Unique identifier |
| `title` | String | Yes | Max 200 chars | Module title |
| `slug` | String | Yes | Unique, URL-safe | URL-friendly identifier |
| `content` | Rich Text | Yes | Markdown/HTML | Main content body |
| `summary` | String | Yes | Max 300 chars | Brief summary for cards/search |
| `content_section_id` | UUID | Yes | Valid section ID | Belongs to content section |
| `age_group_id` | UUID | No | Valid age group ID | Primary age group (can be null for cross-age content) |
| `training_purpose` | String | No | Max 500 chars | Purpose and objectives |
| `scientific_basis` | Text | No | Max 1000 chars | Scientific rationale |
| `safety_guidelines` | Text | No | Max 1000 chars | Safety precautions |
| `duration` | Integer | No | Minutes (1-180) | Recommended duration |
| `difficulty_level` | Enum | No | See values below | Difficulty rating |
| `keywords` | Array[String] | No | Max 20 keywords | Search keywords (Chinese + English) |
| `related_modules` | Array[UUID] | No | Valid module IDs | Related training modules |
| `video_urls` | Array[String] | No | Valid URLs | Associated training videos |
| `image_urls` | Array[String] | No | Valid URLs | Illustrations and diagrams |
| `template_urls` | Array[String] | No | Valid URLs | Downloadable templates |
| `published` | Boolean | Yes | Default: false | Published status |
| `view_count` | Integer | Yes | Default: 0 | View tracking (analytics) |
| `share_count` | Integer | Yes | Default: 0 | Share tracking (analytics) |
| `created_at` | Timestamp | Yes | Auto-generated | Creation timestamp |
| `updated_at` | Timestamp | Yes | Auto-updated | Last modification timestamp |
| `published_at` | Timestamp | No | Auto-set on publish | Publication timestamp |

**Enum Values**:
- `difficulty_level`: `beginner`, `intermediate`, `advanced`

**Relationships**:
- `content_section` (N:1) - Belongs to content section
- `age_group` (N:1, optional) - Primary age group association
- `resources` (N:N) - Associated resource assets (videos, templates)
- `ai_generated_content` (1:N) - AI content generated for this module
- `shareable_links` (1:N) - Shareable links created for this module

**Validation Rules**:
- `content` must not be empty
- `slug` must be unique across all modules
- `duration` must be between 1-180 minutes if provided
- `keywords` array max 20 items, each keyword max 50 chars
- `related_modules` cannot include self-reference (`id`)

**Full-Text Search Fields**:
- `title`, `summary`, `content`, `training_purpose`, `keywords` (indexed in Elasticsearch)

**Sample Data**:
```json
{
  "id": "uuid-module-1",
  "title": "速度与敏捷性训练 - 反应速度训练",
  "slug": "reaction-speed-training-7-9",
  "content": "## 训练目标\n提升7-9岁儿童的神经系统快速反应能力...",
  "summary": "通过信号启动、追逐游戏等方式提升反应速度",
  "content_section_id": "uuid-section-physical",
  "age_group_id": "uuid-age-7-9",
  "training_purpose": "建立神经系统快速反应能力，为技术动作打基础",
  "scientific_basis": "敏感期发展理论，7-9岁是速度素质发展关键期",
  "safety_guidelines": "确保场地平整，避免碰撞，控制训练强度",
  "duration": 30,
  "difficulty_level": "beginner",
  "keywords": ["速度", "敏捷性", "反应", "speed", "agility", "reaction"],
  "published": true,
  "view_count": 0,
  "share_count": 0
}
```

---

### 4. Resource Asset

**Purpose**: Supplementary materials (videos, templates, assessment tools)

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | UUID | Yes | Auto-generated | Unique identifier |
| `name` | String | Yes | Max 200 chars | Resource name |
| `description` | Text | No | Max 500 chars | Resource description |
| `type` | Enum | Yes | See values below | Resource type |
| `category` | Enum | Yes | See values below | Content category |
| `file_url` | String | Yes | Valid URL | Storage URL (COS/OSS) |
| `thumbnail_url` | String | No | Valid URL | Preview thumbnail |
| `file_size` | Integer | Yes | Bytes | File size in bytes |
| `file_format` | String | Yes | Max 20 chars | File extension (e.g., "mp4", "pdf", "xlsx") |
| `duration` | Integer | No | Seconds | Video/audio duration |
| `age_group_id` | UUID | No | Valid age group ID | Target age group (optional) |
| `related_modules` | Array[UUID] | No | Valid module IDs | Associated training modules |
| `download_count` | Integer | Yes | Default: 0 | Download tracking |
| `published` | Boolean | Yes | Default: false | Published status |
| `created_at` | Timestamp | Yes | Auto-generated | Creation timestamp |
| `updated_at` | Timestamp | Yes | Auto-updated | Last modification timestamp |

**Enum Values**:
- `type`: `video`, `template`, `assessment`, `reference`, `image`
- `category`: `technique_demo`, `training_method`, `competition_analysis`, `plan_template`, `assessment_tool`, `reading_material`

**Relationships**:
- `training_modules` (N:N) - Can be associated with multiple modules
- `age_group` (N:1, optional) - Target age group

**Validation Rules**:
- `file_url` must be accessible and valid
- `file_format` must match actual file type
- `duration` required if `type = "video"`
- `file_size` must be > 0

**Sample Data**:
```json
{
  "id": "uuid-resource-1",
  "name": "高远球技术示范 - 多角度演示",
  "description": "高远球标准动作从正面、侧面、背面三个角度演示",
  "type": "video",
  "category": "technique_demo",
  "file_url": "https://cdn.example.com/videos/high-clear-demo.mp4",
  "thumbnail_url": "https://cdn.example.com/thumbs/high-clear-demo.jpg",
  "file_size": 52428800,
  "file_format": "mp4",
  "duration": 180,
  "age_group_id": "uuid-age-10-12",
  "published": true,
  "download_count": 0
}
```

---

### 5. AI Generated Content

**Purpose**: Dynamically created supplementary content (plans, illustrations, nutrition)

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | UUID | Yes | Auto-generated | Unique identifier |
| `content_type` | Enum | Yes | See values below | Type of AI content |
| `prompt` | Text | Yes | Max 2000 chars | User prompt or system template |
| `response` | Text | Yes | Max 10000 chars | AI-generated response |
| `training_module_id` | UUID | No | Valid module ID | Related training module (optional) |
| `age_group_id` | UUID | No | Valid age group ID | Target age group (optional) |
| `user_role` | Enum | No | See values below | Requesting user role |
| `parameters` | JSON | No | Valid JSON | Generation parameters (e.g., focus area, intensity) |
| `model_used` | String | Yes | Max 50 chars | AI model identifier (e.g., "gpt-4", "dall-e-3") |
| `tokens_used` | Integer | Yes | > 0 | Token count (cost tracking) |
| `generation_time_ms` | Integer | Yes | Milliseconds | Generation duration |
| `quality_rating` | Integer | No | 1-5 | User feedback rating |
| `image_urls` | Array[String] | No | Valid URLs | Generated images (for illustrations) |
| `cached` | Boolean | Yes | Default: false | Whether this was cached and reused |
| `cache_key` | String | No | Max 255 chars | Cache key for similar requests |
| `created_at` | Timestamp | Yes | Auto-generated | Creation timestamp |
| `expires_at` | Timestamp | No | Future date | Cache expiration (24 hours default) |

**Enum Values**:
- `content_type`: `training_plan`, `illustration`, `nutrition_advice`, `exercise_variation`
- `user_role`: `coach`, `parent`, `athlete`

**Relationships**:
- `training_module` (N:1, optional) - Related module
- `age_group` (N:1, optional) - Target age group
- `shareable_links` (1:N) - Can be shared

**Validation Rules**:
- `response` must not be empty
- `tokens_used` must be > 0
- `generation_time_ms` must be > 0
- If `cached = true`, `cache_key` must not be null
- `quality_rating` must be between 1-5 if provided

**Caching Strategy**:
- Cache key format: `ai:{content_type}:{age_group}:{hash(prompt + parameters)}`
- TTL: 24 hours for common requests, 1 hour for personalized requests
- Cached content reused if cache key matches

**Sample Data**:
```json
{
  "id": "uuid-ai-1",
  "content_type": "training_plan",
  "prompt": "生成一周训练计划，10-12岁，重点发展速度和爆发力",
  "response": "# 10-12岁速度爆发力周训练计划\n\n## 周一...",
  "training_module_id": "uuid-module-speed",
  "age_group_id": "uuid-age-10-12",
  "user_role": "coach",
  "parameters": {"focus": "speed", "intensity": "moderate"},
  "model_used": "gpt-4",
  "tokens_used": 1200,
  "generation_time_ms": 3500,
  "cached": false,
  "cache_key": "ai:training_plan:10-12:hash123",
  "expires_at": "2025-11-10T12:00:00Z"
}
```

---

### 6. Shareable Link

**Purpose**: Distribution mechanism for content sharing via WeChat, H5, QR codes

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | UUID | Yes | Auto-generated | Unique identifier |
| `short_code` | String | Yes | Unique, 8 chars | Short URL code (e.g., "a3Xf9p2Q") |
| `target_type` | Enum | Yes | See values below | Type of shared content |
| `target_id` | UUID | Yes | Valid entity ID | ID of shared entity |
| `platform` | Enum | Yes | See values below | Sharing platform |
| `share_url` | String | Yes | Valid URL | Full shareable URL |
| `qr_code_url` | String | No | Valid URL | QR code image URL |
| `mini_program_path` | String | No | Valid path | Mini-program page path |
| `title` | String | Yes | Max 100 chars | Share card title |
| `description` | String | No | Max 200 chars | Share card description |
| `image_url` | String | No | Valid URL | Share card image |
| `creator_role` | Enum | No | See values below | Creator's role |
| `access_count` | Integer | Yes | Default: 0 | Access tracking |
| `unique_visitors` | Integer | Yes | Default: 0 | Unique visitor count |
| `created_at` | Timestamp | Yes | Auto-generated | Creation timestamp |
| `expires_at` | Timestamp | No | Future date | Expiration (null = never expires) |
| `last_accessed_at` | Timestamp | No | Auto-updated | Last access timestamp |

**Enum Values**:
- `target_type`: `training_module`, `ai_generated_content`, `resource_asset`, `content_section`
- `platform`: `wechat_mini_program`, `h5_web`, `alipay_mini_program`, `qr_code`
- `creator_role`: `coach`, `parent`, `athlete`, `system`

**Relationships**:
- `training_module` (N:1, conditional) - If `target_type = "training_module"`
- `ai_generated_content` (N:1, conditional) - If `target_type = "ai_generated_content"`
- `resource_asset` (N:1, conditional) - If `target_type = "resource_asset"`
- `content_section` (N:1, conditional) - If `target_type = "content_section"`

**Validation Rules**:
- `short_code` must be unique and exactly 8 characters
- `target_id` must reference valid entity matching `target_type`
- `share_url` format: `https://domain.com/s/{short_code}`
- `mini_program_path` required if `platform = "wechat_mini_program"`
- `expires_at` must be in the future if provided

**URL Routing Logic**:
- WeChat Mini Program: `pages/shared/index?code={short_code}`
- H5 Web: `https://h5.domain.com/s/{short_code}` (redirects to content)
- QR Code: Generates QR code image pointing to H5 URL

**Sample Data**:
```json
{
  "id": "uuid-share-1",
  "short_code": "a3Xf9p2Q",
  "target_type": "training_module",
  "target_id": "uuid-module-1",
  "platform": "wechat_mini_program",
  "share_url": "https://domain.com/s/a3Xf9p2Q",
  "mini_program_path": "pages/shared/index?code=a3Xf9p2Q",
  "title": "速度与敏捷性训练 - 反应速度训练",
  "description": "7-9岁儿童反应速度提升方法",
  "image_url": "https://cdn.example.com/share/reaction-speed.jpg",
  "creator_role": "coach",
  "access_count": 0,
  "unique_visitors": 0,
  "expires_at": null
}
```

---

### 7. User Role Context

**Purpose**: Represents user's relationship to platform (influences content presentation)

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | UUID | Yes | Auto-generated | Unique identifier |
| `role` | Enum | Yes | See values below | User role |
| `display_name` | String | Yes | Max 50 chars | Role display name (localized) |
| `description` | String | No | Max 200 chars | Role description |
| `permissions` | Array[String] | Yes | Predefined list | Feature access permissions |
| `default_content_filter` | JSON | No | Valid JSON | Default content filtering preferences |

**Enum Values**:
- `role`: `coach`, `parent`, `athlete`

**Permissions**:
- **Coach**: `view_all_content`, `request_ai_content`, `share_content`, `download_templates`, `access_assessment_tools`
- **Parent**: `view_all_content`, `request_ai_content`, `share_content`, `view_faq`
- **Athlete**: `view_age_appropriate_content`, `view_videos`, `share_content`

**Sample Data**:
```json
{
  "id": "uuid-role-coach",
  "role": "coach",
  "display_name": "教练",
  "description": "全面访问培训内容，侧重教学方法和训练计划",
  "permissions": ["view_all_content", "request_ai_content", "share_content", "download_templates", "access_assessment_tools"],
  "default_content_filter": {
    "show_teaching_methods": true,
    "show_assessment_tools": true
  }
}
```

---

## Analytics and Event Tracking

**Purpose**: Track user behavior for platform optimization

**Events Tracked** (logged to analytics service):

| Event Name | Properties | Purpose |
|------------|-----------|---------|
| `content_viewed` | `module_id`, `age_group`, `user_role`, `duration_seconds` | Track content popularity |
| `search_performed` | `query`, `results_count`, `user_role` | Improve search relevance |
| `ai_content_generated` | `content_type`, `age_group`, `user_role`, `tokens_used` | Monitor AI usage and costs |
| `content_shared` | `target_type`, `target_id`, `platform`, `user_role` | Track sharing patterns |
| `resource_downloaded` | `resource_id`, `resource_type`, `user_role` | Monitor resource usage |
| `session_started` | `platform`, `user_role`, `entry_point` | Understand user journeys |
| `error_occurred` | `error_type`, `page`, `details` | Identify and fix issues |

**Metrics Aggregated** (daily/weekly/monthly):

- Total views per module, section, age group
- Most popular content (by role: coach, parent, athlete)
- Average session duration
- Most frequent searches
- AI content generation rate and costs
- Share rate (shares per view)
- Download rate for templates/resources
- Error rate and types

---

## State Transitions

### Training Module Publication Workflow

```text
[Draft]
   ↓ (editor creates content)
[In Review]
   ↓ (reviewer approves)
[Published] ← (live content)
   ↓ (editor unpublishes)
[Archived] ← (content no longer current)
```

**States**:
- `draft`: Editable by content creators, not visible to users
- `in_review`: Submitted for editorial review, not visible to users
- `published`: Live and accessible to users (API returns this content)
- `archived`: Preserved for reference but not displayed in navigation

**Transitions**:
- Draft → In Review: Content complete, submitted for review
- In Review → Draft: Reviewer requests changes
- In Review → Published: Reviewer approves, content goes live
- Published → Archived: Content outdated or replaced
- Archived → Draft: Content needs updating, brought back for editing

### AI Content Lifecycle

```text
[Requested]
   ↓ (generate via AI API)
[Generated] ← (cached for 24h)
   ↓ (user saves)
[Saved] ← (persistent)
   ↓ (user shares)
[Shared] ← (link created)
   ↓ (after expires_at or manual delete)
[Expired]
```

**States**:
- `requested`: User submits prompt, queued for generation
- `generated`: AI responds, displayed to user (cached in Redis)
- `saved`: User opts to save for later (persisted in database)
- `shared`: User creates shareable link (link entity created)
- `expired`: Cache TTL reached or manual deletion

---

## Validation Rules Summary

### Content Integrity Rules

1. **Hierarchical Consistency**: Training Module → Content Section → Age Group hierarchy must be valid
2. **URL Uniqueness**: All `slug` fields must be unique within their entity type
3. **Date Logic**: `updated_at >= created_at`, `published_at` only set when `published = true`
4. **File Validation**: `file_url`, `image_urls`, `video_urls` must be accessible URLs
5. **Relationship Validity**: All foreign keys must reference existing entities

### Business Logic Rules

1. **Age Group Coverage**: Each age group (4-6, 7-9, 10-12, 13-15) must have at least 20 training modules
2. **Content Section Balance**: Each of 18 sections must have at least 5 training modules
3. **AI Rate Limiting**: Maximum 10 AI requests per user per day (tracked via Redis)
4. **Share Link Expiration**: Default expiration 12 months, max 24 months
5. **Cache Invalidation**: When module updated, invalidate related cache keys in Redis

### Search Index Rules

1. **Elasticsearch Indexing**: All published modules indexed within 1 minute of publication
2. **Keyword Extraction**: Minimum 3 keywords per module for effective search
3. **Search Language**: Support both Chinese (simplified) and English keywords
4. **Relevance Boosting**: Title matches ranked higher than content matches

---

## Database Schema Notes

### Indexes (PostgreSQL)

**Performance-critical indexes**:

```sql
-- Training Module indexes
CREATE INDEX idx_module_section_id ON training_module(content_section_id);
CREATE INDEX idx_module_age_group_id ON training_module(age_group_id);
CREATE INDEX idx_module_published ON training_module(published) WHERE published = true;
CREATE INDEX idx_module_view_count ON training_module(view_count DESC);
CREATE UNIQUE INDEX idx_module_slug ON training_module(slug);

-- Content Section indexes
CREATE INDEX idx_section_age_group_id ON content_section(age_group_id);
CREATE INDEX idx_section_category ON content_section(category);

-- Shareable Link indexes
CREATE UNIQUE INDEX idx_share_short_code ON shareable_link(short_code);
CREATE INDEX idx_share_target ON shareable_link(target_type, target_id);
CREATE INDEX idx_share_created_at ON shareable_link(created_at DESC);

-- AI Generated Content indexes
CREATE INDEX idx_ai_cache_key ON ai_generated_content(cache_key) WHERE cached = true;
CREATE INDEX idx_ai_module_id ON ai_generated_content(training_module_id);
CREATE INDEX idx_ai_expires_at ON ai_generated_content(expires_at);

-- Resource Asset indexes
CREATE INDEX idx_resource_type ON resource_asset(type);
CREATE INDEX idx_resource_age_group_id ON resource_asset(age_group_id);
```

### Caching Strategy (Redis)

**Cache Keys**:

```text
content:module:{id}                TTL: 30 minutes
content:section:{id}               TTL: 30 minutes
content:age-group:{id}             TTL: 60 minutes
search:query:{hash}                TTL: 5 minutes
ai:cache-key:{key}                 TTL: 24 hours
share:short-code:{code}            TTL: 60 minutes
analytics:views:{module_id}:daily  TTL: 24 hours
rate-limit:ai:{user_id}:daily      TTL: 24 hours (counter)
```

**Cache Invalidation**:
- Module updated → Clear `content:module:{id}`, `search:query:*` (pattern match)
- Section updated → Clear `content:section:{id}`, related module caches
- AI content generated → Set `ai:cache-key:{key}` with TTL
- Share link created → Set `share:short-code:{code}` with link data

---

## Next Steps

1. ✅ Data model defined with 7 core entities
2. ✅ Relationships and validation rules established
3. ✅ State transitions and lifecycle documented
4. ⏭️ Generate API contracts (OpenAPI specs) based on this data model
5. ⏭️ Generate quickstart.md with setup instructions
6. ⏭️ Update agent context with data model information
