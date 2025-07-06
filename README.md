# Azure MCP FastMCP Server

A Model Context Protocol (MCP) server that provides Azure DevOps integration through a set of tools for managing projects, work items, teams.

## 🚀 Features

- **Standalone Executable**: No dependencies required when using npx
- **Azure DevOps Integration**: Full access to Azure DevOps REST API
- **MCP Protocol**: Compatible with any MCP client
- **Multiple Tools**: Projects, Work Items, Teams, and Policies management

## 📦 Installation

### Using npx (Recommended)

```bash
# No installation required - runs directly
npx -y @ahmedrowaihi/azure-mcp-fastmcp
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/ahmedrowaihi/azure-mcp-fastmcp.git
cd azure-mcp-fastmcp

# Install dependencies
bun install

# Build the project
bun run build

# Run the built server
bun run dist/main.js
```

## 🔧 Configuration

### Environment Variables

The server requires the following environment variables:

```bash
# Required: Your Azure DevOps organization URL
AZURE_ORG_URL=https://dev.azure.com/yourorg

# Required: Your Azure DevOps Personal Access Token (PAT)
AZURE_PERSONAL_ACCESS_TOKEN=your_pat_here
```

### Setting Environment Variables

#### Method 1: Direct Environment Variables

```bash
AZURE_ORG_URL=https://dev.azure.com/yourorg \
AZURE_PERSONAL_ACCESS_TOKEN=your_token \
npx -y @ahmedrowaihi/azure-mcp-fastmcp
```

#### Method 2: Using .env File

Create a `.env` file in your project root:

```env
AZURE_ORG_URL=https://dev.azure.com/yourorg
AZURE_PERSONAL_ACCESS_TOKEN=your_token
```

Then run:

```bash
npx dotenv -e .env -- npx -y @ahmedrowaihi/azure-mcp-fastmcp
```

#### Method 3: System Environment Variables

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
export AZURE_ORG_URL="https://dev.azure.com/yourorg"
export AZURE_PERSONAL_ACCESS_TOKEN="your_token"
```

## 🛠️ Available Tools

### Project Tools

- **`listProjects`**: List all Azure DevOps projects in your organization

### Work Item Tools

- **`listWorkItems`**: List work items by IDs
- **`getWorkItemDetails`**: Get detailed information for a specific work item
- **`createWorkItem`**: Create a new work item
- **`updateWorkItem`**: Update an existing work item
- **`listWorkItemTypes`**: List available work item types for a project
- **`listWorkItemQueries`**: List work item queries for a project
- **`bulkCreateWorkItems`**: Bulk create Epics, Features, User Stories, and Tasks (with parent/child relationships)
- **`bulkUpdateWorkItems`**: Bulk update work items (assign, change state, set iteration, add comment, or custom field)
- **`destroyWorkItems`**: Permanently delete (destroy) a list of work items
- **`queryWorkItems`**: Query work items using WIQL (Work Item Query Language)
- **`executeQuery`**: Execute a saved work item query by ID
- **`assignWorkItem`**: Assign a work item to a team member
- **`transitionWorkItem`**: Transition a work item to a new state
- **`addComment`**: Add a comment to a work item
- **`getComments`**: Get comments for a work item
- **`linkWorkItems`**: Link an existing child work item to a parent by URL
- **`unlinkWorkItems`**: Unlink a child work item from a parent by URL
- **Formatting tools**: Improved output formatting for summaries, lists, and bulk operations

### Iteration & Sprint Tools

- **`listProjectIterations`**: List all project-level iteration nodes for a project
- **`getTeamIterations`**: List all iterations (sprints) currently assigned to a team
- **`createTeamIteration`**: Create a team iteration (sprint) for a project and team
- **`deleteTeamIterations`**: Delete one or more team iterations by ID
- **`assignToIteration`**: Assign a work item to a team iteration (sprint)
- **`getIterationWorkItems`**: List all work items assigned to a specific team iteration
- **`updateProjectIterationDates`**: Update the start and end dates for a project-level iteration node
- **`getProjectIterationNodeById`**: Fetch a project-level iteration node by its numeric ID (for debugging)

### Team Tools

- **`listTeams`**: List teams for a project
- **`listTeamMembers`**: List team members for a specific team
- **`getTeamCapacity`**: Get team capacity for an iteration

## 🔐 Azure DevOps Permissions

Your Personal Access Token (PAT) needs the following permissions:

- **Code**: Read (for repository access)
- **Work Items**: Read & Write (for work item management)
- **Project and Team**: Read (for project and team information)
- **Policy**: Read (for branch policy access)

## 🚀 Usage Examples

### Basic Usage

```bash
# Start the MCP server
npx -y @ahmedrowaihi/azure-mcp-fastmcp
```

### With MCP Client Configuration

If using an MCP client like Claude Desktop, add to your configuration:

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "npx",
      "args": ["-y", "@ahmedrowaihi/azure-mcp-fastmcp"],
      "env": {
        "AZURE_ORG_URL": "https://dev.azure.com/yourorg",
        "AZURE_PERSONAL_ACCESS_TOKEN": "your_token"
      }
    }
  }
}
```

### Bulk Create Work Items

```json
{
  "project": "MyProject",
  "epics": [
    {
      "title": "Epic 1",
      "features": [
        {
          "title": "Feature A",
          "user_stories": [
            {
              "title": "Story 1",
              "tasks": [{ "title": "Task X" }, { "title": "Task Y" }]
            }
          ]
        }
      ]
    }
  ]
}
```

### Assign Work Item to Iteration

```json
{
  "id": 12345,
  "iterationId": "MyProject\\Iteration 1"
}
```

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) (JavaScript runtime)
- Node.js 18+ (for compatibility)

### Development Commands

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Start development server
bun run dev

# Run the built server
bun run dist/main.js
```

### Project Structure

```
├── azure/           # Azure DevOps services and connection
├── formatters/      # Data formatting utilities
├── mcp/            # MCP server and tools
├── dist/           # Built executable (generated)
├── main.ts         # Entry point
└── package.json    # Project configuration
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Note**: This MCP server is designed to be a standalone executable that doesn't require installing dependencies when used with npx. All dependencies are bundled into the final executable for optimal user experience.

---

## ⚠️ Known Issues

- **Iteration Node Update Limitation:**
  Updating project-level iteration node dates (start/end) via the Azure DevOps SDK fails with "Iteration node not found" even when the node is confirmed to exist and is fetchable by ID. All tested path formats fail for update/fetch by path, but fetching by ID works. This may be an SDK bug, REST/SOAP mismatch, or permissions issue. If you encounter this, consider using the Azure DevOps REST API directly or check for updates to the SDK.
