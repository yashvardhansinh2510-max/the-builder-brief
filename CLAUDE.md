# The Builder Brief — Claude Code Configuration

## Mandatory Skills — Run Before Any Task

Before starting ANY task (coding, reviewing, planning, debugging, or
architectural decisions), invoke these skills in this order:

1. **superpowers** — use `superpowers:brainstorming` for new features,
   `superpowers:systematic-debugging` for bugs, `superpowers:executing-plans`
   for implementation work
2. **code-review** — invoke `code-review:code-review` after every logical
   chunk of code is written or modified
3. **gstack** — invoke `gstack` before any architectural decision, stack
   change, or deployment configuration change

These are non-negotiable. Do not skip them even for "small" changes.

## Stack

pnpm monorepo. See `replit.md` for commands.

- Frontend: React + Vite → `artifacts/specflow-newsletter/`
- API: Express 5 → `artifacts/api-server/`
- DB: PostgreSQL + Drizzle ORM → `lib/db/`
- Email: Resend
- Auth: Clerk
- Deploy: Vercel

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
