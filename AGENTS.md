# Repository Guidelines

## Project Structure & Module Organization

Nutrio is a pnpm/Turborepo monorepo (Node 20+, pnpm 10). Applications live in `apps/`: `api` is the NestJS/TypeORM backend, `web` is the Next.js admin portal, and `pwa` is the field-user Next.js PWA. Shared code belongs in `packages/common` (types, enums, CASL), `packages/ui` (shadcn/Tailwind components), and `packages/modules` (feature modules). Backend features go in `apps/api/src/modules/<feature>/`; web routes use App Router groups under `apps/web/app/portal/`.

## Build, Test, and Development Commands

Run commands from the repository root:

```bash
pnpm dev                 # start all app dev servers through Turbo
pnpm build               # build every workspace
pnpm lint                # run workspace ESLint checks
pnpm typecheck           # run TypeScript checks
pnpm test                # build dependencies, then run tests
pnpm db:migrate          # apply API TypeORM migrations
pnpm --filter web test:e2e  # run Playwright web tests
```

Use filters to focus work, e.g. `pnpm --filter api test` or `pnpm --filter web dev`. Set API configuration in `apps/api/.env`; do not commit secrets.

## Coding Style & Naming Conventions

Write TypeScript and follow the local ESLint configuration; lint treats warnings as failures. Use Prettier with `pnpm format` before submitting TypeScript, TSX, or Markdown changes. Match existing two-space indentation and single-quote imports. Name React components in `PascalCase`, hooks as `useX`, files in kebab-case where the surrounding directory does, and Nest files by role: `*.module.ts`, `*.service.ts`, `*.controller.ts`, `*.entity.ts`, and `*.dto.ts`.

Reuse `@workspace/ui` components rather than adding app-local duplicates. Keep CASL changes synchronized between `apps/api/src/modules/auth/casl-ability.factory.ts` and `apps/web/lib/casl.ts`.

## Testing Guidelines

Use Jest for unit and API tests; colocate units as `*.spec.ts`. API end-to-end tests are in `apps/api/test/*.e2e-spec.ts`; web end-to-end tests are in `apps/web/e2e/*.spec.ts` and use Playwright. Add or update tests with behavior changes and run the narrowest relevant command first.

## Commit & Pull Request Guidelines

History follows Conventional Commit-style subjects, such as `feat: add inventory view`, `fix(api): allow preview origins`, and `chore: update config`. Keep commits focused. Pull requests should describe the user-visible change, list validation performed, link the relevant issue or OpenSpec change, and include screenshots for UI updates. Call out migrations, required environment variables, and any follow-up work.
