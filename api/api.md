# Lingtuu API Documentation

**Module:** lingtuu-api  
**Note:** All JSON field names use **snake_case** naming strategy (configured via `ObjectMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)`)

---

## Overview

| Controller | Base Path | Endpoints |
|------------|-----------|-----------|
| ApiChapterController | `/api/chapter` | 6 |
| ApiLlmModelController | `/api/llm/model` | 1 |
| ApiStoryController | `/api/story` | 5 |

**Total: 14 API endpoints**

---

## Common Types

### Response Wrapper: `Result<T>`
```json
{
  "code": "integer",
  "message": "string",
  "data": "T"
}
```

### Paginated Response: `PageResult<T>`
```json
{
  "list": ["T"],
  "total": "long",
  "page_num": "integer",
  "page_size": "integer"
}
```

### Pagination Input: `PageInput`
```json
{
  "page_num": "integer",
  "page_size": "integer"
}
```

---

## 1. Chapter API (`/api/chapter`)

### 1.1 Create Chapter

```http
PUT /api/chapter
Content-Type: application/json
```

**Request Body:**
```json
{
  "story_id": "string (required, max 200)",
  "parent_id": "string (optional)",
  "title": "string (required, max 200)",
  "type": "VOLUME | CHAPTER (required)"
}
```

**Response:** `Result<ApiChapterSchema.Output>`

---

### 1.2 Delete Chapter

```http
DELETE /api/chapter/{id}
```

**Path Parameters:**
- `id`: string

**Response:** `Result<Boolean>`

---

### 1.3 Update Chapter

```http
POST /api/chapter
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "string (required)",
  "title": "string (required, max 200)",
  "sort_order": "integer (optional)",
  "status": "DRAFT | WRITING | COMPLETED (optional)"
}
```

**Response:** `Result<Boolean>`

---

### 1.4 Update Chapter Content

```http
POST /api/chapter/content
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "string (required)",
  "content": "string (optional, max 20000)",
  "word_count": "integer (optional, min 0)"
}
```

**Response:** `Result<Boolean>`

---

### 1.5 Find Chapter by ID

```http
GET /api/chapter/{id}
```

**Path Parameters:**
- `id`: string

**Response:** `Result<ApiChapterSchema.Output>`

---

### 1.6 Paginated Query Chapters

```http
GET /api/chapter
```

**Query Parameters:**
```json
{
  "story_id": "string (required)",
  "title": "string (optional, max 200, fuzzy search)",
  "page_num": "integer",
  "page_size": "integer"
}
```

**Response:** `Result<PageResult<ApiChapterSchema.Output>>`

---

### Chapter DTOs

#### ApiChapterSchema.Output
```json
{
  "id": "string",
  "story_id": "string",
  "parent_id": "string",
  "title": "string",
  "type": "VOLUME | CHAPTER",
  "sort_order": "integer",
  "status": "DRAFT | WRITING | COMPLETED",
  "word_count": "integer",
  "created_at": "LocalDateTime",
  "updated_at": "LocalDateTime"
}
```

---

## 2. LLM Model API (`/api/llm/model`)

### 2.1 Paginated Query Models

```http
GET /api/llm/model
```

**Query Parameters:**
```json
{
  "display_name": "string (optional)",
  "page_num": "integer",
  "page_size": "integer"
}
```

**Response:** `Result<PageResult<ApiLlmModelSchema.Output>>`

---

### LLM Model DTOs

#### ApiLlmModelSchema.Output
```json
{
  "id": "string",
  "display_name": "string",
  "created_at": "LocalDateTime",
  "updated_at": "LocalDateTime"
}
```

---

## 3. Story API (`/api/story`)

### 3.1 Create Story

```http
PUT /api/story
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "string (required, max 200)",
  "type": "SCRIPT | SHORT | LONG | VIDEO (required)",
  "perspective": "FIRST | THIRD (required)",
  "target_reader": "FEMALE | MALE | ALL (required)"
}
```

**Response:** `Result<ApiStorySchema.Output>`

---

### 3.2 Delete Story

```http
DELETE /api/story/{id}
```

**Path Parameters:**
- `id`: string

**Response:** `Result<Boolean>`

---

### 3.3 Update Story

```http
POST /api/story
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "string (required)",
  "title": "string (optional, max 200)",
  "tags": ["string"] (optional, max 50 items)",
  "outline": "string (optional)",
  "type": "SCRIPT | SHORT | LONG | VIDEO (optional)",
  "perspective": "FIRST | THIRD (optional)",
  "target_reader": "FEMALE | MALE | ALL (optional)",
  "status": "DRAFT | WRITING | COMPLETED (optional)"
}
```

**Response:** `Result<Boolean>`

---

### 3.4 Find Story by ID

```http
GET /api/story/{id}
```

**Path Parameters:**
- `id`: string

**Response:** `Result<ApiStorySchema.StoryMetaOutput>`

---

### 3.5 Paginated Query Stories

```http
GET /api/story
```

**Query Parameters:**
```json
{
  "title": "string (optional, max 200)",
  "page_num": "integer",
  "page_size": "integer"
}
```

**Response:** `Result<PageResult<ApiStorySchema.Output>>`

---

### Story DTOs

#### ApiStorySchema.Output
```json
{
  "id": "string",
  "title": "string",
  "status": "string",
  "created_at": "LocalDateTime",
  "updated_at": "LocalDateTime"
}
```

#### ApiStorySchema.StoryMetaOutput
```json
{
  "id": "string",
  "title": "string",
  "tags": ["string"],
  "outline": "string",
  "type": "SCRIPT | SHORT | LONG | VIDEO",
  "perspective": "FIRST | THIRD",
  "target_reader": "FEMALE | MALE | ALL",
  "status": "DRAFT | WRITING | COMPLETED"
}
```

---

## Enum Reference

### Chapter Type
| Value | Description |
|-------|-------------|
| `VOLUME` | Volume/卷 |
| `CHAPTER` | Chapter/章 |

### Chapter Status
| Value | Description |
|-------|-------------|
| `DRAFT` | Draft/草稿 |
| `WRITING` | Writing/写作中 |
| `COMPLETED` | Completed/已完成 |

### Story Type
| Value | Description |
|-------|-------------|
| `SCRIPT` | Script/剧本 |
| `SHORT` | Short Story/短篇 |
| `LONG` | Long Story/长篇 |
| `VIDEO` | Video/视频 |

### Story Perspective
| Value | Description |
|-------|-------------|
| `FIRST` | First Person/第一人称 |
| `THIRD` | Third Person/第三人称 |

### Story Target Reader
| Value | Description |
|-------|-------------|
| `FEMALE` | Female/女频 |
| `MALE` | Male/男频 |
| `ALL` | All/通用 |

### Story Status
| Value | Description |
|-------|-------------|
| `DRAFT` | Draft/草稿 |
| `WRITING` | Writing/写作中 |
| `COMPLETED` | Completed/已完成 |
