# Project Notes

## API Naming

- The Java backend now uses camelCase for Web API request parameters and response fields.
- When adding or updating frontend API code, use camelCase in TypeScript request/response types to match the backend JSON shape.
- Do not introduce `snake_case` API fields unless the user explicitly says a specific endpoint still requires it.

## Backend Reference

- Related Java backend workspace: `/Users/grady/workplace/java/lingtuu`
- API module: `/Users/grady/workplace/java/lingtuu/lingtuu-api`
- Repository module: `/Users/grady/workplace/java/lingtuu/lingtuu-repository`
- When frontend API behavior is unclear, verify controller and schema definitions in the Java backend before changing request or response types.

## API Client

- Reuse the existing wrapper in `src/api/base/index.ts` instead of calling `axios` directly from feature modules.
- Prefer `appApi` for authenticated business APIs and `baseApi` only for base/unauthenticated endpoints.
- Keep feature API files thin: define TypeScript request/response types and call `get` / `post` / `put` / `delete` on the shared client.
- The shared client already unwraps the backend `ApiResult<T>` shape and handles default error messaging. Do not reimplement that logic in feature API files.

## Theme

- Reuse the existing theme system in `src/theme/theme.ts` and `src/theme/index.ts`.
- New components should follow the project theme tokens and `themeState` / `themeMap` wiring instead of hardcoding a separate visual system.
- When a component needs theme values, align with the current pattern based on Ant Design theme tokens and the centralized theme config.
