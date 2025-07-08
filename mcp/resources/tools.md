# Tools

## Project Tools

- **`project-list`**: List all Azure DevOps projects in your organization

## Work Item Tools

- **`workItem-list`**: List work items using various filters or WIQL
- **`workItem-create`**: Create a new work item
- **`workItem-update`**: Update an existing work item
- **`workItem-bulk-create`**: Bulk create work items with parent/child relationships
- **`workItem-bulk-update`**: Bulk update work items (assign, change state, set iteration, or custom field)
- **`workItem-delete`**: Permanently delete (destroy) a list of work items
- **`workItem-query`**: Query work items using WIQL (Work Item Query Language)
- **`workItem-bulk-query`**: Execute multiple WIQL queries in parallel
- **`workItem-execute-query`**: Execute a saved work item query by ID
- **`workItem-assign`**: Assign a work item to a team member
- **`workItem-transition`**: Transition a work item to a new state
- **`workItem-link`**: Link an existing child work item to a parent by URL
- **`workItem-unlink`**: Unlink a child work item from a parent by URL
- **`workItem-list-states`**: Get available states for a specific work item type
- **`workItem-type-list`**: List all work item types for a project (summary view)
- **`workItem-type-get`**: Get full details for a specific work item type (detailed view)

## Work Item Type Tools

- **`workItem-type-list`**: Returns a summary of all work item types for a project, including their names, descriptions, and a summary of required/optional fields.

  - **Parameters:** `{ "project": "MyProject" }`
  - **Returns:** Array of types, e.g.
    ```json
    [
      {
        "name": "Epic",
        "description": "...",
        "fields": [
          { "name": "Title", "referenceName": "System.Title", "type": "string", "required": true },
          { "name": "Description", "referenceName": "System.Description", "type": "string", "required": false }
        ]
      },
      ...
    ]
    ```

- **`workItem-type-get`**: Returns full details for a specific work item type, including all available fields, their required/optional status, descriptions, and allowed values.
  - **Parameters:** `{ "project": "MyProject", "type": "Epic" }`
  - **Returns:** Detailed field information for the type, e.g.
    ```json
    {
      "name": "Epic",
      "description": "...",
      "fields": [
        { "name": "Title", "referenceName": "System.Title", "type": "string", "required": true, "description": "..." },
        { "name": "Description", "referenceName": "System.Description", "type": "string", "required": false, "description": "..." },
        ...
      ]
    }
    ```

## Iteration & Sprint Tools

- **`iteration-list`**: List all iterations (sprints) currently assigned to a team
- **`iteration-create`**: Create a team iteration (sprint) for a project and team
- **`iteration-delete`**: Delete one or more team iterations by ID
- **`iteration-assign`**: Assign a work item to a team iteration (sprint)
- **`iteration-list-work-items`**: List all work items assigned to a specific team iteration
- **`iteration-update-dates`**: Update the start and end dates for a project-level iteration node
- **`iteration-list-project`**: List all project-level iteration nodes for a project
- **`iteration-get-by-id`**: Fetch a project-level iteration node by its numeric ID (for debugging)

## Team Tools

- **`team-list`**: List teams for a project
- **`team-list-members`**: List team members for a specific team
- **`team-capacity`**: Get team capacity for an iteration

## Wiki Tools

- **`wiki-list`**: List all wikis in a project.

  - **Parameters:** `{ "project": "MyProject" }` (optional)
  - **Returns:** Array of wikis for the project.

- **`wiki-get`**: Get details for a specific wiki by ID.

  - **Parameters:** `{ "wikiId": "wiki-guid", "project": "MyProject" }` (`project` optional)
  - **Returns:** Wiki details.

- **`wiki-create`**: Create a new wiki in a project.

  - **Parameters:** `{ "params": { ...wiki creation fields... }, "project": "MyProject" }`
  - **Returns:** The created wiki.

- **`wiki-update`**: Update a wiki's properties.

  - **Parameters:** `{ "params": { ...wiki update fields... }, "wikiId": "wiki-guid", "project": "MyProject" }`
  - **Returns:** The updated wiki.

- **`wiki-delete`**: Delete a wiki by ID.

  - **Parameters:** `{ "wikiId": "wiki-guid", "project": "MyProject" }` (`project` optional)
  - **Returns:** Result of the delete operation.

- **`wiki-page-list`**: List all pages in a wiki as a flat array.

  - **Parameters:** `{ "project": "MyProject", "wikiId": "wiki-guid" }`
  - **Returns:** Array of all pages (`WikiPageDetail`) in the wiki, always as a plain array.

- **`wiki-page-get`**: Get the content of a wiki page as text.
  - **Parameters:** `{ "project": "MyProject", "wikiId": "wiki-guid", "path": "/Page/Path" }`
  - **Returns:** The page content as text.
