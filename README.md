# Azure MCP FastMCP Server

A Model Context Protocol (MCP) server that provides Azure DevOps integration through a set of tools for managing projects, work items, teams, and policies.

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

### Team Tools

- **`listTeams`**: List teams for a project
- **`listTeamMembers`**: List team members for a specific team

### Policy Tools

- **`listPolicies`**: List branch policies for a project or repository
- **`getPolicyDetails`**: Get detailed policy information by configuration ID

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
