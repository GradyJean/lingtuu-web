# Project Notes

## API Naming

- The Java backend uses Jackson `ObjectMapper` configured for `snake_case`.
- When adding or updating frontend API code, use `snake_case` for request parameters and response fields to match the backend JSON shape.
- Do not assume camelCase mapping in TypeScript API types unless the user explicitly says that behavior changed.

## API Client

- Reuse the existing wrapper in `src/api/base/index.ts` instead of calling `axios` directly from feature modules.
- Prefer `appApi` for authenticated business APIs and `baseApi` only for base/unauthenticated endpoints.
- Keep feature API files thin: define TypeScript request/response types and call `get` / `post` / `put` / `delete` on the shared client.
- The shared client already unwraps the backend `ApiResult<T>` shape and handles default error messaging. Do not reimplement that logic in feature API files.

## Theme

- Reuse the existing theme system in `src/theme/theme.ts` and `src/theme/index.ts`.
- New components should follow the project theme tokens and `themeState` / `themeMap` wiring instead of hardcoding a separate visual system.
- When a component needs theme values, align with the current pattern based on Ant Design theme tokens and the centralized theme config.
