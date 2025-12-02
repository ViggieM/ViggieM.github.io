## Development Commands

All commands use `pnpm` as the package manager:

- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server at `localhost:4321`
- `pnpm build` - Build production site to `./dist/`
- `pnpm preview` - Preview production build locally
- `pnpm astro check` - Run Astro's type checking
- `pnpm astro ...` - Run other Astro CLI commands

## Architecture

- Always use the `@` alias when importing from `src/`
- Global site data is centralized in `src/consts.ts`
