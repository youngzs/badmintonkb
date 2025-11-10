# Quickstart Guide: Youth Badminton Training Platform

**Feature**: `001-badminton-knowledge-platform`
**Last Updated**: 2025-11-09

## Overview

This guide helps developers set up and run the Youth Badminton Training Platform locally for development. The platform consists of three main components:

1. **Frontend**: Taro-based mini-program + H5 (React)
2. **Backend**: Serverless functions (Node.js)
3. **CMS**: Strapi headless CMS

## Prerequisites

### Required Software

- **Node.js**: 18.x LTS or higher
- **npm** or **yarn**: Latest version
- **PostgreSQL**: 14+ (for Strapi CMS database)
- **Redis**: 6.x+ (for caching and rate limiting)
- **Git**: Version control

### Recommended Tools

- **VS Code**: With extensions for React, TypeScript, ESLint
- **WeChat Developer Tools**: For mini-program testing
- **Postman**: For API testing
- **Docker**: Optional, for running PostgreSQL/Redis locally

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd sports_training
git checkout 001-badminton-knowledge-platform
```

### 2. Install Dependencies

#### Frontend

```bash
cd frontend
npm install

# Install Taro CLI globally if not already installed
npm install -g @tarojs/cli
```

#### Backend

```bash
cd backend
npm install

# Install Serverless Framework globally
npm install -g serverless
```

#### CMS (Strapi)

```bash
cd cms
npm install
```

### 3. Environment Configuration

#### Frontend `.env`

Create `frontend/.env.local`:

```env
# API Endpoints
TARO_APP_API_BASE_URL=http://localhost:3000/v1
TARO_APP_AI_API_URL=http://localhost:3000/v1/ai
TARO_APP_SHARE_URL=https://localhost:3000/s

# WeChat Mini Program (get from WeChat MP Admin)
TARO_APP_WECHAT_APPID=your_wechat_appid

# Feature Flags
TARO_APP_ENABLE_AI=true
TARO_APP_ENABLE_ANALYTICS=false
```

#### Backend `.env`

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/badminton_training

# Redis
REDIS_URL=redis://localhost:6379

# AI Service (OpenAI)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_IMAGE_MODEL=dall-e-3

# Rate Limiting
AI_DAILY_LIMIT_PER_USER=10
SEARCH_RATE_LIMIT=100

# Cloud Storage (Tencent COS or Aliyun OSS)
CLOUD_STORAGE_BUCKET=your-bucket-name
CLOUD_STORAGE_REGION=your-region
CLOUD_STORAGE_ACCESS_KEY=your-access-key
CLOUD_STORAGE_SECRET_KEY=your-secret-key

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX=badminton-training

# Environment
NODE_ENV=development
```

#### CMS `.env`

Create `cms/.env`:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-comma-separated
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret

DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=badminton_training_cms
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_SSL=false

# Cloud Storage
PROVIDER=tencent-cos
PROVIDER_BUCKET=your-bucket
PROVIDER_REGION=your-region
PROVIDER_SECRET_ID=your-secret-id
PROVIDER_SECRET_KEY=your-secret-key
```

### 4. Database Setup

#### Create Databases

```bash
# Using psql
createdb badminton_training
createdb badminton_training_cms

# Or using Docker
docker run --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=badminton_training \
  -p 5432:5432 \
  -d postgres:14
```

#### Run Migrations (Backend)

```bash
cd backend
npm run migrate
```

#### Initialize Strapi

```bash
cd cms
npm run develop

# First run will guide you through creating admin user
# Access at http://localhost:1337/admin
```

### 5. Redis Setup

```bash
# Using Docker
docker run --name redis \
  -p 6379:6379 \
  -d redis:6-alpine

# Or install locally and start
redis-server
```

### 6. Elasticsearch Setup (Optional for Development)

```bash
# Using Docker
docker run --name elasticsearch \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  -p 9200:9200 \
  -d elasticsearch:8.5.0

# Install IK Analyzer plugin for Chinese
docker exec -it elasticsearch \
  elasticsearch-plugin install \
  https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v8.5.0/elasticsearch-analysis-ik-8.5.0.zip
```

## Running the Application

### Development Mode

#### Start All Services (Recommended)

Using `concurrently` for parallel execution:

```bash
# From project root
npm install -g concurrently

# Start all services
npm run dev:all
```

Or start each service individually:

#### 1. Start CMS (Strapi)

```bash
cd cms
npm run develop

# Access admin panel at http://localhost:1337/admin
```

#### 2. Start Backend (Serverless Offline)

```bash
cd backend
npm run dev

# API available at http://localhost:3000
```

#### 3. Start Frontend (Taro)

For **H5 development**:

```bash
cd frontend
npm run dev:h5

# Opens browser at http://localhost:10086
```

For **WeChat Mini Program development**:

```bash
cd frontend
npm run dev:weapp

# Open WeChat Developer Tools
# Import project from frontend/dist
```

### Testing

#### Unit Tests

```bash
# Frontend
cd frontend
npm run test

# Backend
cd backend
npm run test
```

#### E2E Tests

```bash
# H5 E2E tests with Playwright
cd frontend
npm run test:e2e

# Mini Program tests
# Use WeChat Developer Tools automated testing features
```

#### API Contract Tests

```bash
cd backend
npm run test:contract
```

## Content Management (Strapi)

### Access Admin Panel

1. Navigate to http://localhost:1337/admin
2. Log in with admin credentials created during setup
3. Manage content types: Age Groups, Content Sections, Training Modules, Resources

### Creating Sample Content

#### 1. Create Age Groups

- Go to "Content Manager" > "Age Group"
- Create 4 age groups:
  - 启蒙期（4-6岁）
  - 基础期（7-9岁）
  - 发展期（10-12岁）
  - 提高期（13-15岁)

#### 2. Create Content Sections

- Navigate to "Content Manager" > "Content Section"
- Create sections under each age group (e.g., "体能训练模块", "羽毛球专项启蒙")

#### 3. Add Training Modules

- Go to "Content Manager" > "Training Module"
- Create modules within sections
- Add rich text content, keywords, related resources

### API Access

Strapi auto-generates REST and GraphQL APIs:

- **REST**: `http://localhost:1337/api/age-groups`
- **GraphQL**: `http://localhost:1337/graphql`

Configure permissions in Strapi admin under "Settings" > "Users & Permissions"

## API Testing

### Using Postman

1. Import OpenAPI specs from `/specs/001-badminton-knowledge-platform/contracts/`
2. Set base URL to `http://localhost:3000/v1`
3. Test endpoints:
   - `GET /age-groups`
   - `GET /training-modules?ageGroupId={id}`
   - `GET /search?q=营养`
   - `POST /ai/generate` (requires OpenAI API key)

### Using cURL

```bash
# List age groups
curl http://localhost:3000/v1/age-groups

# Search content
curl "http://localhost:3000/v1/search?q=速度训练"

# Generate AI content
curl -X POST http://localhost:3000/v1/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "training_plan",
    "age_group_id": "uuid-here",
    "prompt": "生成一周训练计划，重点发展速度"
  }'
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env
```

#### 2. Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials in .env file
# Check database exists: psql -l
```

#### 3. Redis Connection Error

```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
redis-server
```

#### 4. Strapi Content Type Errors

- Delete `.cache` and `build` folders in `cms/`
- Run `npm run build` again
- Restart Strapi

#### 5. Mini Program Preview Issues

- Ensure WeChat Developer Tools is latest version
- Check `project.config.json` has correct `appid`
- Verify `dist` folder exists after `npm run dev:weapp`

## Development Workflow

### Adding New Features

1. **Define in Strapi**:
   - Create/modify content types in CMS
   - Update API permissions

2. **Update Backend**:
   - Add serverless function in `backend/functions/`
   - Update contracts in `/specs/*/contracts/`
   - Write tests in `backend/tests/`

3. **Update Frontend**:
   - Add page/component in `frontend/src/`
   - Create service integration in `frontend/src/services/`
   - Add tests in `frontend/tests/`

4. **Test**:
   - Unit tests: `npm run test`
   - E2E tests: `npm run test:e2e`
   - Manual testing in browser/mini-program

### Code Style

- **Frontend**: ESLint + Prettier (React/TypeScript rules)
- **Backend**: ESLint + Prettier (Node.js rules)
- Run linting: `npm run lint`
- Auto-fix: `npm run lint:fix`

## Deployment

### Production Build

#### Frontend

```bash
cd frontend

# Build for H5
npm run build:h5

# Build for WeChat Mini Program
npm run build:weapp

# Output in frontend/dist/
```

#### Backend

```bash
cd backend

# Deploy serverless functions
serverless deploy --stage production

# Or using cloud provider CLI (Tencent Cloud)
sls deploy --stage prod
```

#### CMS

```bash
cd cms

# Build for production
npm run build

# Start production server
npm run start
```

## Resources

### Documentation

- **Taro Framework**: https://taro-docs.jd.com/
- **Strapi CMS**: https://docs.strapi.io/
- **Serverless Framework**: https://www.serverless.com/framework/docs
- **WeChat Mini Program**: https://developers.weixin.qq.com/miniprogram/dev/framework/

### API Documentation

- **Content API**: See `/specs/001-badminton-knowledge-platform/contracts/content-api.yaml`
- **AI API**: See `/specs/001-badminton-knowledge-platform/contracts/ai-api.yaml`
- **Sharing API**: See `/specs/001-badminton-knowledge-platform/contracts/sharing-api.yaml`

### Support

For issues or questions:
1. Check `/specs/001-badminton-knowledge-platform/plan.md` for architecture details
2. Review `/specs/001-badminton-knowledge-platform/data-model.md` for data structure
3. Consult `/specs/001-badminton-knowledge-platform/research.md` for technology decisions

## Next Steps

After completing local setup:

1. ✅ Verify all services running (CMS, Backend, Frontend)
2. ✅ Create sample content in Strapi
3. ✅ Test API endpoints with Postman/cURL
4. ✅ Preview mini-program in WeChat Developer Tools
5. ⏭️ Proceed to `/speckit.tasks` to generate implementation tasks
