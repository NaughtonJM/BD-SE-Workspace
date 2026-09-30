# Black Duck SE Workspace

## Executive Intelligence Platform

Features

- Executive Strategy
- Executive Narrative
- Boardroom Briefing
- Conversation Intelligence
- Vision Capability
- Solution Discovery
- Stage Management
- Competitive Intelligence
- Highspot Resource Center
- Product Knowledge Hub

## Prerequisites

- Windows 10/11
- Node.js
- Git

## Installation

git clone https://github.com/NaughtonJM/BD-SE-Workspace.git

cd BD-SE-Workspace

git checkout feature/se-workspace-executive-intelligence-platform

npm install

.\Start-SEWorkspace.ps1

## First Run

Open:

http://localhost:3000

Navigate to:

Administration

Configure:

- BLACKDUCK_LLM_MODEL
- BLACKDUCK_LLM_API_KEY

The AI Configuration Manager stores these as Windows User Environment Variables.

The API key is:

- Never stored in Git
- Never stored in SQLite
- Never returned to the browser
- Local to the workstation

## Resource Center

Includes:

- Datasheets
- Sales Presentations
- Product Videos
- Battlecards
- Competitive Intelligence
- Implementation Services

## Major Modules

- Executive Strategy
- Executive Narrative
- Boardroom Briefing
- Conversation Intelligence
- Vision Capability
- Solution Discovery Pool
- Stage Management
- Highspot Resource Center
- Highspot Catalog
- Competitive Intelligence

## Notes

Runtime databases, exports, logs, and local workstation artifacts are intentionally excluded from source control.


## AI Configuration

Open:

Administration
? AI Configuration Manager

Configure:

### BLACKDUCK_LLM_MODEL

Enter the exact model identifier configured in your LLM gateway.

Examples:

- gpt-5
- gpt-5-mini
- gpt-4.1
- claude-sonnet-4
- gemini-2.5-pro

Example:

BLACKDUCK_LLM_MODEL=gpt-5

### BLACKDUCK_LLM_API_KEY

Enter the API key associated with the configured model endpoint.

Example:

BLACKDUCK_LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

The API key is:

- Never stored in Git
- Never stored in SQLite
- Never returned to the browser
- Stored as a Windows User Environment Variable
- Local to the workstation

### Validation

Administration
? AI Configuration Manager
? Validate Configuration

Expected Result:

? Configuration valid
? Model detected
? API key present

