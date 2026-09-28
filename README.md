# Black Duck Sales Engineer Workspace

A private, locally hosted Sales Engineer workspace for preparing partner and prospective-client engagements, generating research-informed meeting plans, running structured discovery, capturing meeting evidence, and continuously regenerating account-planning deliverables.

> **Repository status:** Private development repository and deployment baseline. The application is under active development. Generated customer content, local databases, API credentials, logs, exports, and historical backup directories must not be committed.

## Table of Contents

- [Purpose](#purpose)
- [Validated End-to-End Workflow](#validated-end-to-end-workflow)
- [Current Architecture](#current-architecture)
- [Repository Structure](#repository-structure)
- [Major Application Modules](#major-application-modules)
- [Data and Persistence](#data-and-persistence)
- [Generated Deliverables](#generated-deliverables)
- [Configuration and Secrets](#configuration-and-secrets)
- [Local Installation](#local-installation)
- [Starting the Application](#starting-the-application)
- [Application URLs](#application-urls)
- [Health and Validation Checks](#health-and-validation-checks)
- [Git and GitHub Practices](#git-and-github-practices)
- [Files Intentionally Excluded from Git](#files-intentionally-excluded-from-git)
- [Current Baseline](#current-baseline)
- [Known Technical Debt](#known-technical-debt)
- [Recommended Refactoring Plan](#recommended-refactoring-plan)
- [Troubleshooting](#troubleshooting)
- [Security and Data Handling](#security-and-data-handling)

## Purpose

The workspace is designed to support a public-sector and enterprise Sales Engineer workflow without recreating CRM functionality. It combines meeting input, partner intelligence, prospective-client intelligence, structured qualification, technical discovery, and generated deliverables in one local application.

The application currently supports:

- AI-assisted partner and prospective-client research
- Independent partner and client research stages
- Research reconciliation and semantic de-duplication
- Research-informed call synthesis
- Structured Meeting Plans
- Live Meeting Execution with answer capture
- MEDDPICC qualification
- Adaptive QID and Why Now discovery
- Product discovery paths and adjacent-product analysis
- Context parsing and structured context sections
- Post-meeting LLM resynthesis
- Account Plan generation in Word format
- Executive Strategy Brief generation in PowerPoint format
- Research audit evidence and pipeline traceability
- Local SQLite persistence
- Local asset and resource libraries

## Validated End-to-End Workflow

The current baseline has been validated through the following workflow:

```text
AI Call Prep input
    ↓
1. Full Partner Research
    ↓
2. Full Prospective-Client Research
    ↓
3. Research Reconciliation
    ↓
4. Research-Informed Call Synthesis
    ↓
Record Saved to SQLite
    ↓
Initial Account Plan Generated
    ↓
Initial Strategy Brief Generated
    ↓
Meeting Plan Opened
    ↓
Meeting Execution
    ↓
Answers Saved and Verified
    ↓
5. Post-Meeting Resynthesis
    ↓
Meeting Plan Refreshed
    ↓
Account Plan Regenerated
    ↓
Strategy Brief Regenerated
```

The initial UI-generated workflow was validated with immediate Account Plan and Strategy Brief creation. The browser console reported `Initial deliverable generation success`, and the resulting Meeting Plan displayed both deliverable actions before any Meeting Execution answers were entered.

## Current Architecture

The workspace is a local Node.js and Express application with a browser-based frontend and SQLite persistence.

```text
Browser UI
    ↓
Express API routes
    ↓
Research and synthesis modules
    ↓
SQLite database
    ↓
DOCX and PPTX export generation
```

### Runtime model

- **Frontend:** Static HTML, CSS, and JavaScript served from `frontend/`
- **Backend:** Node.js with Express
- **Database:** SQLite
- **Document generation:** DOCX and PPTX export module
- **LLM integration:** Server-side model calls configured through environment variables
- **Default local address:** `http://127.0.0.1:3000`

## Repository Structure

```text
BD-SE-Workspace/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── server.js
├── Start.ps1
├── Start-SEWorkspace.ps1
│
├── frontend/
│   └── index.html
│
├── backend/
│   └── server.js
│
├── database/
│   └── schema.sql
│
├── call-prep.js
├── call-report-v4.js
├── discovery-framework-v10.js
├── history-v3.js
├── meddpicc-v16.js
├── meeting-plan-v7.js
├── meeting-records.js
├── partner-client-research.js
├── partner-prep-pipeline.js
├── post-meeting-resynthesis.js
├── research-audit.js
├── research-exports.js
├── se-library.js
├── v17-fixes.js
├── v20-content-quality.js
└── v8-ui.js
```

Runtime-only directories and files such as `node_modules/`, `exports/`, local databases, logs, credentials, and archived backups are intentionally excluded from Git.

## Major Application Modules

### `server.js`

Primary application entry point. It initializes Express, opens the SQLite database, registers API modules, serves the frontend, and listens on the local application port.

The route registration order matters. Feature routes must be registered before the catch-all API 404 handler.

### `backend/server.js`

A second server-related implementation currently exists under `backend/`. Its relationship to the root `server.js` must be confirmed before consolidation. Until that dependency review is complete, it should remain in the private repository.

### `frontend/index.html`

Contains the active browser interface and a substantial amount of inline JavaScript. It currently implements:

- Navigation
- AI Call Prep form
- Call Prep History
- Meeting Plan rendering
- Meeting Execution rendering
- Research Report rendering
- Answer capture
- Stage 5 save and resynthesis workflow
- Immediate initial deliverable generation
- Product, asset, and resource views

The file contains historically layered UI logic and is a primary candidate for modularization.

### `call-prep.js`

Supports AI Call Prep generation and related request handling. This file may represent an earlier or supporting call-preparation path and should be dependency-reviewed before removal.

### `partner-prep-pipeline.js`

Supports the partner preparation pipeline and orchestration logic.

### `partner-client-research.js`

Implements the audited partner-plus-prospective-client research workflow. The active generation route uses the four-stage pattern:

1. Partner research
2. Prospective-client research
3. Reconciliation
4. Call synthesis

### `research-audit.js`

Stores and retrieves stage-level audit evidence, including prompts, structured responses, timestamps, and pipeline records.

### `call-report-v4.js`

Provides the current call-report API used by Meeting Plan, Meeting Execution, Research Report, captured answers, and deliverable lookup.

### `history-v3.js`

Provides history, deduplication, deletion, and deliverable lookup. Deliverables are resolved from the latest matching row in the `research_exports` table rather than from URL columns stored directly on the call-prep record.

### `meeting-plan-v7.js`

Provides Meeting Plan and pipeline-evidence functionality.

### `meeting-records.js`

Supports meeting-record persistence or legacy meeting behavior. Its active dependency status must be confirmed before removal.

### `discovery-framework-v10.js`

Implements structured solution discovery, qualification paths, product relationships, and discovery coverage behavior.

### `meddpicc-v16.js`

Implements MEDDPICC structures and status progression, including:

- Metrics
- Economic Buyer
- Decision Criteria
- Decision Process
- Paper Process
- Identify or Implicate Pain
- Champion
- Competition

### `post-meeting-resynthesis.js`

Implements Stage 5 post-meeting resynthesis. The validated workflow:

1. Saves answers
2. Verifies persistence
3. Calls Stage 5 resynthesis
4. Updates the same call-prep record
5. Regenerates both deliverables
6. Reopens the refreshed Meeting Plan

### `research-exports.js`

Generates:

- Strategic Partner Account Plan as `.docx`
- Executive Partner Strategy Brief as `.pptx`

It writes generated files to the local exports directory and records their paths in the `research_exports` table.

### `se-library.js`

Provides shared Sales Engineer library behavior, helper functions, or common data used by the workspace.

### `v20-content-quality.js`

Implements the V20 content-quality layer, including:

- Context parsing
- Structured context sections
- V20 health endpoint
- Discovery catalog endpoint
- Twelve-product discovery catalog
- Composite source construction
- Consultant-style rendering support

### `v17-fixes.js` and `v8-ui.js`

These are historical enhancement layers. They may contain behavior still required by the active application even if their filenames reflect older versions. Do not delete them until route registration, imports, globals, and runtime behavior have been mapped.

## Data and Persistence

### Source-controlled database definition

```text
database/schema.sql
```

This file belongs in Git because it defines how a clean database should be created.

### Local runtime database

Typical local files include:

```text
database/workspace.db
database/workspace.db-shm
database/workspace.db-wal
```

These files do **not** belong in Git:

- `workspace.db` contains local application records and potentially sensitive meeting, account, partner, customer, and research data.
- `workspace.db-wal` is SQLite's write-ahead log.
- `workspace.db-shm` is SQLite's shared-memory coordination file.

A deployable application should create a fresh database from `database/schema.sql` or a future migration system.

## Generated Deliverables

Generated DOCX and PPTX files are runtime artifacts and are stored under `exports/`.

They must not be committed because they may contain:

- Partner names
- Customer or agency names
- Meeting context
- Research findings
- Captured answers
- MEDDPICC evidence
- Account strategies
- Internal recommendations

The `exports/` directory is intentionally ignored by Git.

## Configuration and Secrets

The server reads model configuration from environment variables. Do not commit API keys or secrets.

Expected variables include:

```text
BLACKDUCK_LLM_API_KEY
BLACKDUCK_LLM_MODEL
```

Use local user or system environment variables, a secure secrets manager, or deployment-platform secret configuration.

Never commit:

```text
.env
.env.*
API keys
access tokens
private certificates
customer credentials
```

## Local Installation

### Prerequisites

- Windows with PowerShell
- Node.js and npm
- Git
- Access to the configured LLM endpoint

### Install dependencies

From the repository root:

```powershell
npm install
```

### Database initialization

The repository contains `database/schema.sql`. The current local application may already create or open its database automatically. Before packaging for broader deployment, database initialization should be made explicit and repeatable through a migration or initialization command.

## Starting the Application

Use one of the supplied PowerShell launchers:

```powershell
.\Start-SEWorkspace.ps1
```

or:

```powershell
.\Start.ps1
```

The application can also be started directly:

```powershell
node server.js
```

Keep the Node process running while using the browser application.

## Application URLs

### Workspace

```text
http://127.0.0.1:3000
```

### V20 health check

```text
http://127.0.0.1:3000/api/v20/health
```

### V20 discovery catalog

```text
http://127.0.0.1:3000/api/v20/discovery-catalog
```

### Call-report API

```text
http://127.0.0.1:3000/api/call-report-v4
```

### Research-export API

```text
http://127.0.0.1:3000/api/research-exports
```

## Health and Validation Checks

### V20 health

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/v20/health"
```

### Discovery catalog

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/v20/discovery-catalog"
```

The validated catalog contains these product families:

- Black Duck SCA
- BDBA
- Coverity
- Polaris
- Seeker
- Defensics
- Software Risk Manager
- Code Sight
- Polaris Assist
- Signal
- ContextAI
- Continuous Dynamic

### Browser workflow validation

A complete browser acceptance test should verify:

1. AI Call Prep accepts Partner and Customer/Agency.
2. Format and Structure Context parses the context field.
3. Generate Call Script completes all four research stages.
4. The application displays `Generating Account Plan and Strategy Brief...`.
5. The browser console displays `Initial deliverable generation success`.
6. The Meeting Plan opens.
7. Account Plan and Strategy Brief actions appear immediately.
8. Meeting Execution saves and verifies at least one answer.
9. Stage 5 post-meeting resynthesis completes.
10. Both deliverables regenerate.

## Git and GitHub Practices

### Current repository model

- The local repository was initialized with Git.
- The known-good deployment baseline was committed.
- A baseline tag was created.
- The intended remote repository is private.

### Current baseline commits

```text
af3209f  Deployment baseline - V20 workspace with immediate deliverable generation
cebbb93  Remove SQLite runtime files from source control
```

### Baseline tag

```text
deployment-baseline-v1
```

### Recommended first push

After creating the private GitHub repository:

```powershell
git branch -M main
git remote add origin https://github.com/NaughtonJM/BD-SE-Workspace.git
git push -u origin main
git push origin deployment-baseline-v1
```

### Recommended branch strategy

```text
main          Known-good deployable baseline
develop       Integrated development work
repo-cleanup  Dependency mapping and repository simplification
feature/*     Isolated feature work
fix/*         Focused defect repair
```

## Files Intentionally Excluded from Git

The `.gitignore` should contain:

```gitignore
node_modules/
exports/
archive-pre-github/

*.log

workspace.db
*.db
*.sqlite
*.sqlite3
*.db-shm
*.db-wal

.env
.env.*

.vscode/
.idea/
```

These exclusions prevent dependencies, generated content, local data, credentials, logs, and backups from being uploaded.

## Current Baseline

The current deployment baseline has validated:

- Four-stage audited research generation
- Meeting Plan rendering
- Meeting Execution rendering
- Answer persistence
- Same-record Stage 5 resynthesis
- MEDDPICC refresh
- Discovery path refresh
- Immediate initial Account Plan generation
- Immediate initial Strategy Brief generation
- Post-meeting deliverable regeneration
- Research audit persistence
- V20 context parsing
- V20 discovery catalog

## Known Technical Debt

The repository is functional but not yet fully productized.

### Large inline frontend

`frontend/index.html` contains many generations of inline UI and workflow code. This creates risks:

- Hard-to-isolate syntax failures
- Global-function collisions
- Multiple overrides of the same function
- Difficult testing
- Difficult code review
- High regression risk during string-based patching

### Historical version modules

Files such as `v8-ui.js`, `v17-fixes.js`, and `v20-content-quality.js` reflect iterative development. They should be mapped and consolidated only after the baseline is safely pushed.

### Duplicate server entry points

Both `server.js` and `backend/server.js` exist. Their roles must be confirmed before removing either file.

### Patch-oriented development history

The application was built through a sequence of focused patches. The next engineering phase should replace string-based patching with modular source files, automated tests, and repeatable builds.

### Hardcoded presentation identity

Some frontend and export code may contain a hardcoded presenter name. This should move to configuration or a user profile.

### Database migrations

The application should have an explicit database initialization and migration workflow rather than relying only on the existing local database state.

### Test coverage

Automated tests should cover:

- API health
- Database initialization
- Four-stage generation
- Research export creation
- History/export association
- Context parsing
- Discovery catalog integrity
- Answer persistence
- Stage 5 resynthesis
- Frontend JavaScript syntax

## Recommended Refactoring Plan

### Phase 1: Preserve the baseline

- Push the current private repository.
- Push `deployment-baseline-v1`.
- Confirm a fresh clone can install dependencies.
- Confirm secrets and runtime data are absent.

### Phase 2: Dependency mapping

- Enumerate every `require()` in `server.js`.
- Map every API route to its source file.
- Map frontend global functions and overrides.
- Identify modules not loaded by the active server.
- Confirm whether `backend/server.js` is required.

### Phase 3: Frontend modularization

Suggested target:

```text
frontend/
├── index.html
├── css/
│   └── app.css
└── js/
    ├── api.js
    ├── navigation.js
    ├── call-prep.js
    ├── history.js
    ├── meeting-plan.js
    ├── meeting-execution.js
    ├── research-report.js
    ├── context-intelligence.js
    └── deliverables.js
```

### Phase 4: Backend organization

Suggested target:

```text
src/
├── server.js
├── config/
├── db/
│   ├── schema.sql
│   └── migrations/
├── routes/
├── services/
│   ├── research/
│   ├── synthesis/
│   ├── discovery/
│   └── exports/
└── lib/
```

### Phase 5: Deployment packaging

- Add automated database initialization.
- Add configuration validation.
- Add a production start script.
- Add health checks.
- Add CI validation for Node syntax and tests.
- Add release packaging.
- Document supported operating systems and Node versions.

## Troubleshooting

### Page shows branding but no navigation or content

Likely cause: an inline JavaScript syntax error in `frontend/index.html`.

Check the browser Developer Console for:

```text
Uncaught SyntaxError
Invalid or unexpected token
```

Validate inline scripts before committing modifications.

### `(intermediate value)(...) is not a function`

Likely cause: an IIFE begins immediately after a previous expression without a terminating semicolon.

Example boundary:

```javascript
someFunction = async function () { ... };
(function () { ... })();
```

### Generation appears to hang

The four-stage LLM workflow may not return incremental output. Check the server process, browser status, and API response rather than repeatedly clicking Generate.

### Direct API generation creates no initial exports

Calling only the audited generation endpoint creates the research record but bypasses the browser's subsequent `v18GenerateDeliverables(id)` call. Use the browser Generate workflow for the complete initial flow, or explicitly call the export endpoint in automation.

### Deliverables appear only after Meeting Execution

The intended Option B behavior is:

- Initial deliverables immediately after browser-generated call prep
- Refined deliverables after Meeting Execution and Stage 5

Confirm the browser console reports `Initial deliverable generation success`.

### SQLite files appear in Git

Ensure `.gitignore` includes:

```gitignore
*.db
*.db-shm
*.db-wal
```

If already tracked:

```powershell
git rm --cached database/workspace.db-shm
git rm --cached database/workspace.db-wal
```

## Security and Data Handling

This repository should remain private until the code and data-handling model are fully reviewed.

Before adding collaborators or changing visibility:

- Scan Git history for credentials.
- Confirm no customer exports exist in commits.
- Confirm no SQLite data exists in commits.
- Confirm no internal URLs or tokens are embedded in source.
- Confirm environment variables are documented but not populated.
- Confirm generated research and meeting content remain local.
- Review hardcoded customer, partner, agency, and presenter examples.

## Ownership and Intended Use

This workspace is a Sales Engineer productivity application intended to support structured partner discovery, public-sector account planning, technical qualification, and professional deliverable generation.

It is not intended to replace Salesforce or another CRM. Its role is to add intelligence and execution support around the Sales Engineer workflow.

## License

No license has been selected. Because the repository is private and may contain company-specific implementation details, do not add an open-source license until ownership, reuse, and distribution rights are confirmed.
