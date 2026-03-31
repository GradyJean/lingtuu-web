# Story Character Design Handoff

## Context
- This document summarizes the design decisions discussed for the story character panel in `StoryDetail.vue`.
- Goal: preserve context across machines/sessions so implementation can continue without relying on chat history.

## Page Constraints
- The story workspace uses `WorkContainer` with `left / center / right` panes.
- The center pane must remain the chapter text editor at all times.
- Character management belongs only in the left pane.
- The left pane is resizable, so the character UI must stay compact and suited for narrow widths.

## Final Direction
- `Character.vue` should be a compact left-side navigation panel, not a full standalone page.
- The left panel should focus on browsing and selecting characters, not on full in-place editing.
- Detailed character editing should open in a Drawer.
- AI-assisted naming/content generation should open in a separate Drawer.

## Left Panel Layout
- Header:
  - Title: `角色`
  - Primary action: `新建`
- Main content:
  - Grouped character name list
  - Grouping is derived from `tags`
  - List items show only the character name
- No default search box
  - Reason: for a single novel, search is usually lower value than grouped browsing
  - Search would also consume too much vertical space in the left panel

## Character Grouping
- Backend `tags` is a `string[]`
- Example values:
  - `性别:男`
  - `年龄:22岁`
  - `主角:男主`
  - `主角:女主`
  - `阵营:反派`
- Frontend should parse tags as `key:value`
- Grouping should be derived from selected tag keys, primarily category-like tags

## Suggested Grouping Rule
- Prefer `主角:*` for primary grouping
- If missing, optionally fall back to other category tags such as `阵营:*`
- If no grouping tag is found, place the character in `未分类`

## Character Detail Interaction
- Clicking a character in the left list opens a character detail Drawer
- The detail Drawer is the main place for editing:
  - `name`
  - `description`
  - `tags`
  - `visibility`
  - `source`
- Deletion should live inside the detail Drawer, not in the left list
- Deletion should require confirmation

## Why Delete Is Not In The List
- The left pane is narrow and easy to misclick
- The list is a navigation surface, not an action surface
- A persistent `X` delete affordance would make the list noisy and unsafe

## AI Function Placement
- AI functionality should not permanently occupy the left panel
- AI should open in a separate Drawer
- Reason:
  - the user needs to review generated results
  - the user needs to choose which fields to apply
  - this is a multi-step workflow better suited to an isolated panel

## AI Workflow
- Open AI Drawer from the character detail Drawer
- AI prompt area is editable by the user
- AI returns structured JSON in a predefined shape
- The UI renders candidates from that JSON
- The user checks which fields to apply
- Selected fields are filled back into the current character form

## AI Response Direction
- AI should not return only a plain string
- It should return structured candidate data so the user can selectively apply fields
- Example direction:

```json
{
  "candidates": [
    {
      "name": "沈砚",
      "description": "出身世家，气质克制冷静。",
      "tags": ["主角:男主", "性别:男", "气质:清冷"]
    }
  ]
}
```

## Drawer Placement
- Ant Design Vue Drawer should not attach to the page body if that causes it to stick to the far left edge
- Preferred approach:
  - use `get-container`
  - mount the Drawer inside the workspace container
- This keeps the Drawer aligned with the actual work area and avoids colliding with fixed left-side UI

## Backend Reference
- Controller:
  - `D:\workspace\java\lingtuu\lingtuu-api\src\main\java\com\qm\lingtuu\controller\ApiStoryCharacterController.java`
- Schema:
  - `D:\workspace\java\lingtuu\lingtuu-api\src\main\java\com\qm\lingtuu\schema\llm\ApiStoryCharacterSchema.java`

## Backend API Notes
- Endpoints available:
  - create
  - delete
  - update
  - findById
  - findByPage
- JSON fields use camelCase
- `tags` is a plain `List<String>`
- Example story character fields:
  - `id`
  - `name`
  - `description`
  - `tags`
  - `visibility`
  - `storyId`
  - `source`
  - `createdAt`
  - `updatedAt`

## Frontend Data Handling Notes
- Frontend should keep API request/response types in camelCase
- `tags` should be parsed into an internal key/value representation for rendering and grouping
- Before submit, key/value tags should be serialized back to the backend string array format

## Suggested Component Split
- `Character.vue`
  - left-side grouped character list
- `CharacterDetailDrawer.vue`
  - full character edit form
- `CharacterAiDrawer.vue`
  - AI prompt input, candidate rendering, selective apply

## Current Related File
- `D:\workspace\node\lingtuu-web\src\views\story\StoryDetail.vue`

## Current StoryDetail State
- Left menu has:
  - `chapter`
  - `character`
- `Character.vue` is already wired into the left slot with:
  - `v-if="pageState.left.character"`
- `pageState` has been typed explicitly to avoid TS index errors

## Recommended Next Implementation Steps
1. Implement `Character.vue` as a grouped name list using local mock data first
2. Add `CharacterDetailDrawer.vue` and wire open/close from list item click
3. Add tag parsing/grouping helpers
4. Add `src/api/story/character.ts` using the shared API client
5. Replace mock data with backend list/detail/create/update/delete
6. Add `CharacterAiDrawer.vue` with a strict JSON response contract
