# Tasks: Youth Badminton Training Knowledge Platform

**Feature Branch**: `001-badminton-knowledge-platform`
**Date**: 2025-11-09
**Architecture**: VuePress 2.x + WeChat Mini-Program + Aliyun CDN (Static Site)
**Total Tasks**: 132

## Task Status Summary

- **Total**: 132 tasks
- **Completed**: 0
- **In Progress**: 0
- **Pending**: 132

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Project Setup (10 tasks)

### Repository and Project Initialization

- [ ] T001 Create repository structure with content/, docs/, miniprogram/, scripts/, tests/, .github/
- [ ] T002 [P] Initialize VuePress 2.x project with TypeScript in docs/package.json, docs/.vuepress/config.ts
- [ ] T003 [P] Initialize WeChat mini-program project in miniprogram/app.js, miniprogram/app.json, miniprogram/project.config.json
- [ ] T004 [P] Create content directory structure (18 sections) in content/age-groups/, content/theory/, content/guidance/, content/resources/
- [ ] T005 [P] Setup build scripts directory in scripts/package.json
- [ ] T006 Configure VuePress theme for mobile-first design in docs/.vuepress/theme/index.ts
- [ ] T007 Install VuePress plugins (search, image optimization, markdown-it Chinese) in docs/.vuepress/config.ts
- [ ] T008 Create root package.json with workspace configuration linking docs/, miniprogram/, scripts/
- [ ] T009 [P] Setup ESLint, Prettier, EditorConfig in .eslintrc.js, .prettierrc, .editorconfig
- [ ] T010 [P] Create project documentation in README.md, CONTRIBUTING.md, LICENSE

---

## Phase 2: Foundational Infrastructure (18 tasks)

### Content Schema and Validation

- [ ] T011 [P] Define content frontmatter YAML schema in scripts/schemas/content-frontmatter.schema.yaml
- [ ] T012 [P] Create content validation script (Markdown lint, frontmatter, links) in scripts/validate-content.js
- [ ] T013 [P] Create content validation tests in tests/content/validation.test.js
- [ ] T014 [P] Setup markdownlint config for Chinese content in .markdownlint.json
- [ ] T015 [P] Create content templates for each section type in content/.templates/age-group-article.md, theory-article.md, guidance-article.md

### AI Image Generation Pipeline

- [ ] T016 [P] Create AI image generation script (scan GENERATE: prefixes) in scripts/generate-images.js
- [ ] T017 [P] Implement image-gen-server MCP client in scripts/lib/image-gen-client.js
- [ ] T018 [P] Create image prompt templates in scripts/lib/image-prompt-templates.js
- [ ] T019 [P] Document image review workflow in docs/content-authoring/image-review-workflow.md
- [ ] T020 [P] Setup image optimization (WebP + PNG fallback) in scripts/lib/image-optimizer.js

### VuePress Build System

- [ ] T021 Configure VuePress content source mapping in docs/.vuepress/config.ts
- [ ] T022 [P] Create VuePress components (ArticleCard, AgeGroupSelector, SectionNavigation) in docs/.vuepress/components/
- [ ] T023 Create VuePress build script with validation in scripts/build-static.sh
- [ ] T024 [P] Configure WeChat sharing metadata in docs/.vuepress/config.ts (head meta tags)
- [ ] T025 [P] Setup visual regression tests in tests/integration/visual-regression.test.js

### Deployment and CDN

- [ ] T026 [P] Create Aliyun OSS deployment script in scripts/deploy-cdn.sh
- [ ] T027 [P] Configure CDN cache rules (HTML: 5min, assets: 30d) in scripts/config/cdn-config.yaml
- [ ] T028 Setup GitHub Actions CI/CD in .github/workflows/content-validation.yml, .github/workflows/deploy.yml

---

## Phase 3: US1 - Browse Age-Specific Training Content (Priority P1) - MVP (28 tasks)

### Content Creation (Sample Articles)

- [ ] T029 [P] [US1] Create 3 sample articles for age 4-6 in content/age-groups/01-enlightenment-4-6/
- [ ] T030 [P] [US1] Generate + review AI images for age 4-6 articles in content/age-groups/01-enlightenment-4-6/*/images/
- [ ] T031 [P] [US1] Create 3 sample articles for age 7-9 in content/age-groups/02-foundation-7-9/
- [ ] T032 [P] [US1] Generate + review AI images for age 7-9 articles in content/age-groups/02-foundation-7-9/*/images/
- [ ] T033 [P] [US1] Create 3 sample articles for age 10-12 in content/age-groups/03-development-10-12/
- [ ] T034 [P] [US1] Generate + review AI images for age 10-12 articles in content/age-groups/03-development-10-12/*/images/
- [ ] T035 [P] [US1] Create 3 sample articles for age 13-15 in content/age-groups/04-advanced-13-15/
- [ ] T036 [P] [US1] Generate + review AI images for age 13-15 articles in content/age-groups/04-advanced-13-15/*/images/
- [ ] T037 [P] [US1] Create 3 theory module articles in content/theory/technique-theory/, physical-training-science/, injury-prevention/
- [ ] T038 [P] [US1] Generate + review AI images for theory articles in content/theory/*/images/
- [ ] T039 [P] [US1] Create 2 guidance articles in content/guidance/coach-training/, parent-handbook/
- [ ] T040 [P] [US1] Generate + review AI images for guidance articles in content/guidance/*/images/

### VuePress Homepage and Navigation

- [ ] T041 [P] [US1] Design homepage with age group navigation in docs/README.md, docs/.vuepress/components/HomePage.vue
- [ ] T042 [P] [US1] Create hierarchical navigation component (3-level expand/collapse) in docs/.vuepress/components/ContentNavigation.vue
- [ ] T043 [P] [US1] Create age group category pages in docs/age-groups/enlightenment-4-6.md, foundation-7-9.md, development-10-12.md, advanced-13-15.md
- [ ] T044 [P] [US1] Configure search plugin with Chinese support in docs/.vuepress/config.ts
- [ ] T045 [P] [US1] Create mobile-optimized article layout in docs/.vuepress/theme/layouts/ArticleLayout.vue
- [ ] T046 [P] [US1] Create bilingual glossary component in docs/.vuepress/components/GlossaryTerm.vue, content/glossary/terminology.md

### WeChat Mini-Program (WebView Integration)

- [ ] T047 [P] [US1] Create mini-program home page with age navigation in miniprogram/pages/home/home.wxml, home.js, home.wxss
- [ ] T048 [P] [US1] Create WebView page for articles in miniprogram/pages/webview/webview.wxml, webview.js
- [ ] T049 [P] [US1] Implement CDN URL utility in miniprogram/utils/cdn.js
- [ ] T050 [P] [US1] Create navigation components in miniprogram/components/navigation/category-card.wxml, section-list.wxml
- [ ] T051 [US1] Implement WebView preloading on selection in miniprogram/pages/home/home.js
- [ ] T052 [P] [US1] Create loading skeleton for WebView in miniprogram/components/loading/webview-skeleton.wxml
- [ ] T053 [P] [US1] Create WebView error fallback in miniprogram/pages/webview/error-fallback.wxml
- [ ] T054 [P] [US1] Setup local storage caching in miniprogram/utils/storage-cache.js
- [ ] T055 [P] [US1] Create native search page linking to WebView in miniprogram/pages/search/search.wxml, search.js
- [ ] T056 [US1] Test WebView integration E2E in tests/integration/miniprogram-webview.test.js

**Checkpoint**: US1 complete - Browse all age groups, navigate content, view articles, search

---

## Phase 4: US2 - Share Training Content (Priority P2) (14 tasks)

### WeChat Sharing API

- [ ] T057 [P] [US2] Implement WeChat sharing utility (wx.shareAppMessage) in miniprogram/utils/share.js
- [ ] T058 [P] [US2] Create shareable link generator (short codes) in miniprogram/utils/share-link-generator.js
- [ ] T059 [P] [US2] Create share button component in miniprogram/components/share/share-button.wxml, share-button.js
- [ ] T060 [P] [US2] Add share metadata to VuePress HTML (og:tags) in docs/.vuepress/config.ts
- [ ] T061 [P] [US2] Create share card preview in miniprogram/components/share/share-card-preview.wxml
- [ ] T062 [US2] Implement wx.postMessage from WebView in docs/.vuepress/enhanceApp.ts
- [ ] T063 [P] [US2] Create shared content landing page in miniprogram/pages/shared/shared.wxml, shared.js
- [ ] T064 [P] [US2] Implement QR code generation in miniprogram/utils/qr-code-generator.js

### H5 Sharing and Analytics

- [ ] T065 [P] [US2] Create H5 share page template in docs/.vuepress/theme/layouts/ShareLayout.vue
- [ ] T066 [P] [US2] Implement share analytics tracking in miniprogram/utils/analytics.js, docs/.vuepress/enhanceApp.ts
- [ ] T067 [US2] Test sharing flow E2E in tests/e2e/sharing-flow.test.js
- [ ] T068 [P] [US2] Implement share link expiration (12 months) in miniprogram/utils/share-link-validator.js
- [ ] T069 [P] [US2] Create share success feedback UI in miniprogram/components/share/share-success.wxml
- [ ] T070 [P] [US2] Document sharing best practices in docs/user-guide/sharing-content.md

**Checkpoint**: US2 complete - Share via WeChat/H5/QR code, recipients access without login

---

## Phase 5: US4 - Navigate Comprehensive Knowledge Taxonomy (Priority P2) (16 tasks)

### Advanced Navigation Features

- [ ] T071 [P] [US4] Create 18-section taxonomy visualization in docs/.vuepress/components/TaxonomyTree.vue
- [ ] T072 [P] [US4] Create breadcrumb navigation in docs/.vuepress/components/Breadcrumbs.vue
- [ ] T073 [P] [US4] Create related content component in docs/.vuepress/components/RelatedContent.vue
- [ ] T074 [US4] Create section landing pages (18 files) in docs/sections/*.md
- [ ] T075 [P] [US4] Add tag-based filtering in docs/.vuepress/components/TagFilter.vue
- [ ] T076 [P] [US4] Create search results page with filters in docs/.vuepress/theme/layouts/SearchResults.vue
- [ ] T077 [P] [US4] Implement recently viewed tracking in miniprogram/utils/history-tracker.js
- [ ] T078 [P] [US4] Create favorites feature in miniprogram/pages/favorites/favorites.wxml, miniprogram/utils/favorites-manager.js
- [ ] T079 [US4] Test navigation flows E2E in tests/e2e/navigation-flows.test.js

### Content Organization and Discovery

- [ ] T080 [P] [US4] Create sitemap generation script in scripts/generate-sitemap.js
- [ ] T081 [P] [US4] Implement content recommendation in docs/.vuepress/enhanceApp.ts
- [ ] T082 [US4] Create section index pages (18 files) in docs/sections/*/index.md
- [ ] T083 [P] [US4] Add quick navigation in mini-program in miniprogram/components/navigation/quick-jump.wxml
- [ ] T084 [P] [US4] Create difficulty indicators in docs/.vuepress/components/DifficultyBadge.vue
- [ ] T085 [P] [US4] Create FAQ page in docs/faq.md
- [ ] T086 [P] [US4] Document organization principles in docs/content-authoring/organization-guide.md

**Checkpoint**: US4 complete - Navigate 18 sections, taxonomy visible, related content works

---

## Phase 6: US3 - Access AI-Generated Training Resources (Priority P3) (17 tasks)

### AI On-Demand Generation (Mini-Program Overlay)

- [ ] T087 [P] [US3] Create AI suggestion overlay modal in miniprogram/pages/ai-suggestion/ai-suggestion.wxml, ai-suggestion.js, ai-suggestion.wxss
- [ ] T088 [P] [US3] Create AI input form in miniprogram/components/ai-input/ai-input.wxml, ai-input.js
- [ ] T089 [P] [US3] Create AI API client (GPT-like service) in miniprogram/utils/ai-client.js
- [ ] T090 [P] [US3] Implement training plan generation in miniprogram/utils/ai-client.js (training plan prompts)
- [ ] T091 [P] [US3] Implement nutrition suggestion generation in miniprogram/utils/ai-client.js (nutrition prompts)
- [ ] T092 [P] [US3] Create AI response display with disclaimers in miniprogram/components/ai-input/ai-response.wxml
- [ ] T093 [P] [US3] Implement AI caching (24h TTL) in miniprogram/utils/ai-cache.js
- [ ] T094 [P] [US3] Add loading with timeout (10s) in miniprogram/pages/ai-suggestion/ai-suggestion.js
- [ ] T095 [P] [US3] Create save/share for AI content in miniprogram/utils/ai-content-storage.js

### AI Rate Limiting and Cost Management

- [ ] T096 [P] [US3] Implement rate limiting (10/user/day) in miniprogram/utils/rate-limiter.js
- [ ] T097 [P] [US3] Create AI quota display in miniprogram/pages/settings/ai-quota.wxml
- [ ] T098 [P] [US3] Implement AI error handling in miniprogram/utils/ai-client.js
- [ ] T099 [P] [US3] Create quality feedback component (1-5 stars) in miniprogram/components/ai-input/ai-feedback.wxml
- [ ] T100 [P] [US3] Implement AI analytics tracking in miniprogram/utils/ai-analytics.js
- [ ] T101 [P] [US3] Create AI prompt templates in miniprogram/utils/ai-prompt-templates.js
- [ ] T102 [US3] Test AI generation flow E2E in tests/integration/ai-generation.test.js
- [ ] T103 [P] [US3] Document AI features in docs/user-guide/ai-features.md

**Checkpoint**: US3 complete - Generate training plans/nutrition, rate limiting works, disclaimers shown

---

## Phase 7: US5 - Access Multi-Format Resources (Priority P3) (13 tasks)

### Resource Library

- [ ] T104 [P] [US5] Create video index page in content/resources/videos/index.md
- [ ] T105 [P] [US5] Create video player component (Aliyun VOD) in docs/.vuepress/components/VideoPlayer.vue
- [ ] T106 [P] [US5] Create template download page in content/resources/templates/index.md, docs/.vuepress/components/TemplatePreview.vue
- [ ] T107 [P] [US5] Create assessment tool pages in content/resources/assessment-tools/*.md
- [ ] T108 [P] [US5] Create reference materials page in content/resources/references/index.md
- [ ] T109 [P] [US5] Add download tracking in docs/.vuepress/enhanceApp.ts
- [ ] T110 [P] [US5] Create resource filter component in docs/.vuepress/components/ResourceFilter.vue

### Resource Integration with Mini-Program

- [ ] T111 [P] [US5] Display videos in mini-program in miniprogram/pages/resources/videos.wxml, videos.js
- [ ] T112 [P] [US5] Create template download flow in miniprogram/pages/resources/templates.wxml
- [ ] T113 [P] [US5] Create assessment calculator in miniprogram/pages/resources/assessment.wxml, miniprogram/utils/assessment-calculator.js
- [ ] T114 [P] [US5] Extend favorites for resources in miniprogram/utils/favorites-manager.js
- [ ] T115 [US5] Test resource access E2E in tests/e2e/resource-access.test.js
- [ ] T116 [P] [US5] Document resources in docs/user-guide/resources.md

**Checkpoint**: US5 complete - Videos play, templates download, assessments work

---

## Phase 8: Polish and Launch Preparation (26 tasks)

### Performance Optimization

- [ ] T117 [P] Implement lazy loading for images in docs/.vuepress/config.ts
- [ ] T118 [P] Optimize bundle size (code splitting) in docs/.vuepress/config.ts
- [ ] T119 [P] Implement CDN preconnect in miniprogram/app.json
- [ ] T120 [P] Add compression (Gzip/Brotli) in scripts/deploy-cdn.sh
- [ ] T121 [P] Create service worker for offline in docs/.vuepress/public/service-worker.js
- [ ] T122 [P] Optimize mini-program package size in miniprogram/project.config.json
- [ ] T123 [P] Setup performance monitoring in scripts/monitoring/performance-monitor.js
- [ ] T124 [P] Run Lighthouse audit in tests/performance/lighthouse.test.js
- [ ] T125 [P] Load test 500 concurrent users in tests/performance/load-test.js

### Quality Assurance and Documentation

- [ ] T126 [P] Accessibility audit (WCAG 2.1 AA) in tests/accessibility/wcag-audit.test.js
- [ ] T127 [P] Cross-browser testing in tests/e2e/cross-browser.test.js
- [ ] T128 [P] Create onboarding flow in miniprogram/pages/onboarding/onboarding.wxml
- [ ] T129 [P] Write user documentation in docs/user-guide/*.md
- [ ] T130 [P] Create authoring guide in docs/content-authoring/authoring-guide.md
- [ ] T131 [P] Setup error monitoring in miniprogram/utils/error-monitor.js, docs/.vuepress/enhanceApp.ts
- [ ] T132 [P] Final E2E test all user stories in tests/e2e/full-user-journey.test.js

---

## MVP Scope (Minimum Viable Product)

**Priority**: Complete Phase 1-3 + T057-T064 (sharing basics)

**MVP includes**:
- VuePress static site with 14 sample articles (all 4 age groups)
- WeChat mini-program with WebView integration
- Basic navigation and search
- Content sharing via WeChat
- AI image generation pipeline (pre-generated)
- CDN deployment

**MVP excludes** (post-launch):
- Advanced navigation (taxonomy visualization, recommendations)
- AI on-demand generation
- Video resources and assessments
- Advanced analytics

**MVP Task Count**: 70 tasks (Phases 1-3 + US2 basics)

---

## Parallel Execution Opportunities

**High parallelism phases**:
- Phase 1: 5 parallel groups - T002-T005, T009-T010 run simultaneously after T001
- Phase 2: 10 parallel groups - Independent infrastructure tasks
- Phase 3: 15 parallel groups - Content creation, VuePress, mini-program
- Phase 4: 10 parallel groups - Sharing features
- Phase 5: 11 parallel groups - Navigation features
- Phase 6: 11 parallel groups - AI features
- Phase 7: 7 parallel groups - Resources
- Phase 8: 12 parallel groups - Optimization and QA

**Estimated Timeline with Parallel Execution**:
- Phase 1: 3 days
- Phase 2: 5 days
- Phase 3: 10 days (includes content creation + review)
- Phase 4: 4 days
- Phase 5: 5 days
- Phase 6: 6 days
- Phase 7: 4 days
- Phase 8: 7 days

**Total**: ~44 days with optimal parallelization

---

## Dependencies Summary

**Blocking dependencies**:
- T001 → T002, T003, T004, T005 (repository structure)
- T011 → T012, T015 (schema before validation)
- T015 → T029-T039 (templates before content)
- T017 → T030, T032, T034, T036, T038, T040 (image gen client)
- T023 → T025, T028 (build before tests/CI)
- T048 → T051, T053, T056, T062 (WebView before integration)

**Cross-phase dependencies**:
- US2 (sharing) depends on US1 (content exists)
- US4 (navigation) depends on US1 (content structure)
- US3 (AI) and US5 (resources) independent of US1-US4

---

## Task Summary

### Total Tasks: 132

**By Phase**:
- Phase 1 (Setup): 10 tasks
- Phase 2 (Foundational): 18 tasks
- Phase 3 (US1 - Browse): 28 tasks
- Phase 4 (US2 - Share): 14 tasks
- Phase 5 (US4 - Navigation): 16 tasks
- Phase 6 (US3 - AI): 17 tasks
- Phase 7 (US5 - Resources): 13 tasks
- Phase 8 (Polish): 16 tasks

**By User Story**:
- US1 (P1): 28 tasks - Core browsing
- US2 (P2): 14 tasks - Sharing
- US4 (P2): 16 tasks - Navigation
- US3 (P3): 17 tasks - AI features
- US5 (P3): 13 tasks - Resources
- Infrastructure: 28 tasks (Setup + Foundational)
- Polish: 16 tasks

**Parallel Opportunities**: 100+ tasks marked [P] can run in parallel

---

## Notes

- **Architecture**: VuePress 2.x + WeChat mini-program + static CDN (no backend/database)
- **Content**: Sample articles require expert authors, AI images need manual review
- **Testing**: E2E tests for WebView (T056), sharing (T067), navigation (T079), AI (T102), resources (T115)
- **Performance**: Optimization tasks meet <3s 4G load time target
- **Deployment**: CI/CD via GitHub Actions (T028)
