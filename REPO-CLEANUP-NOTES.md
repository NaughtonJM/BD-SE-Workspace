# Repo Cleanup Candidates

## Verified Production

server.js

call-prep.js
call-report-v4.js
history-v3.js
meeting-plan-v7.js

partner-client-research.js
partner-prep-pipeline.js
research-audit.js
research-exports.js

meddpicc-v16.js
discovery-framework-v10.js
post-meeting-resynthesis.js

se-library.js
v20-content-quality.js

## Legacy Candidate

backend/server.js

Reason:
Only referenced by Start.ps1

## Review Candidates

v17-fixes.js
v8-ui.js

Reason:
Not imported by server.js
Still expose API routes

## Future Work

Modularize frontend/index.html

Investigate duplicate GET /api/health

Retire Start.ps1

Standardize on Start-SEWorkspace.ps1
