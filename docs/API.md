# API Documentation

## ClickUp API Integration

### Overview

This application integrates with ClickUp's REST API v2 to fetch and manage tasks. The integration is primarily handled through the `useClickUp` hook located in `src/shared/hooks/useClickUp.ts`.

### Authentication

ClickUp API uses token-based authentication. The API token is passed in the `Authorization` header of all requests.

**Header Format:**
```
Authorization: <your-api-token>
Content-Type: application/json
```

**Getting an API Token:**
1. Log into ClickUp
2. Go to Settings → Apps → API
3. Generate a new API token
4. Copy and securely store the token

⚠️ **Security Note**: Never commit API tokens to version control. Use environment variables in production.

### Endpoints

#### GET /team

Fetches all teams accessible to the API token.

**Endpoint:** `https://api.clickup.com/api/v2/team`

**Headers:**
- `Authorization`: Your ClickUp API token
- `Content-Type`: application/json

**Response:**
```typescript
{
  teams: Team[]
}
```

**Team Interface:**
```typescript
interface Team {
  id: string;
  name: string;
  color?: string;
}
```

**Usage:**
```typescript
const { fetchTeams, teams } = useClickUp(apiToken);
await fetchTeams();
// teams array now contains all accessible teams
```

#### GET /team/{teamId}/task

Fetches tasks for a specific team.

**Endpoint:** `https://api.clickup.com/api/v2/team/{teamId}/task`

**Headers:**
- `Authorization`: Your ClickUp API token
- `Content-Type`: application/json

**Query Parameters:**
- `include_closed` (boolean): Include closed/completed tasks (default: false)
- `subtasks` (boolean): Include subtasks (default: true)
- Additional filters can be added as needed

**Example Request:**
```
GET /team/123456/task?include_closed=false&subtasks=true
```

**Response:**
```typescript
{
  tasks: ClickUpTask[]
}
```

**ClickUpTask Interface:**
See `src/shared/types/clickup.ts` for complete type definition.

**Usage:**
```typescript
const { fetchTasks, tasks } = useClickUp(apiToken);
await fetchTasks(teamId, { include_closed: 'false', subtasks: 'true' });
// tasks array now contains all tasks for the team
```

### Custom Hooks API

#### useClickUp

Main hook for ClickUp API integration.

**Signature:**
```typescript
export const useClickUp = (apiToken: string) => {
  // Returns:
  {
    teams: Team[];
    tasks: ClickUpTask[];
    loading: boolean;
    error: string;
    fetchTeams: () => Promise<void>;
    fetchTasks: (teamId: string, params?: Record<string, string>) => Promise<void>;
    getMyTasks: (userEmail: string) => ClickUpTask[];
    getTasksByStatus: (status: string) => ClickUpTask[];
    getOverdueTasks: () => ClickUpTask[];
  }
}
```

**Parameters:**
- `apiToken: string` - Your ClickUp API token

**Returns:**

- **teams**: Array of Team objects fetched from ClickUp
- **tasks**: Array of ClickUpTask objects
- **loading**: Boolean indicating if an API request is in progress
- **error**: String containing error message if request fails
- **fetchTeams()**: Async function to fetch all teams
- **fetchTasks(teamId, params?)**: Async function to fetch tasks for a team
  - `teamId`: The ID of the team to fetch tasks from
  - `params`: Optional query parameters (e.g., `{ include_closed: 'false' }`)
- **getMyTasks(email)**: Filter tasks by assignee email
- **getTasksByStatus(status)**: Filter tasks by status name
- **getOverdueTasks()**: Get all tasks past their due date

**Example Usage:**
```typescript
import { useClickUp } from '@/shared/hooks/useClickUp';

function MyComponent() {
  const apiToken = 'pk_your_token_here';
  const { 
    teams, 
    tasks, 
    loading, 
    error, 
    fetchTeams, 
    fetchTasks 
  } = useClickUp(apiToken);

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleTeamSelect = (teamId: string) => {
    fetchTasks(teamId);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {teams.map(team => (
        <button key={team.id} onClick={() => handleTeamSelect(team.id)}>
          {team.name}
        </button>
      ))}
    </div>
  );
}
```

### Data Transformation

Tasks fetched from ClickUp are transformed to the internal task format used by the dependency graph.

**Conversion Function:**
Located in `TaskDependencyMapContainer.tsx` - `convertClickUpTasksToGraphTasks()`

**Transformation Rules:**

1. **Status Mapping:**
   ```typescript
   {
     'to do': 'todo',
     'in progress': 'in-progress',
     'complete': 'done',
     'blocked': 'blocked'
   }
   ```

2. **Priority Mapping:**
   ```typescript
   {
     'urgent': 'urgent',
     'high': 'high',
     'normal': 'normal',
     'low': 'low',
     'none': 'none'
   }
   ```

3. **Date Calculation:**
   - If `due_date` exists: `startDay = (dueDate - today) / (1000 * 60 * 60 * 24)`
   - If no `due_date`: Tasks are spread across 7 days based on index

4. **Duration Calculation:**
   - If `start_date` exists: `duration = (dueDate - startDate) / (1000 * 60 * 60 * 24) + 1`
   - Default: 1 day

5. **Owner Extraction:**
   - Uses first assignee's `username`
   - Fallback to `'Unassigned'` if no assignees

6. **Parent Relationship:**
   - Maps ClickUp's `parent` field to `parentId`

### Error Handling

The `useClickUp` hook includes error handling:

- Network errors are caught and stored in `error` state
- HTTP errors (non-200 responses) throw errors with status codes
- Error messages are user-friendly strings

**Example Error Handling:**
```typescript
const { error, fetchTasks } = useClickUp(apiToken);

try {
  await fetchTasks(teamId);
} catch (err) {
  console.error('Failed to fetch tasks:', err);
  // Error is automatically stored in error state
}
```

### Rate Limiting

ClickUp API has rate limits:
- **Free tier**: 100 requests per minute
- **Paid tiers**: Higher limits

The current implementation doesn't include rate limiting logic. For production use, consider:
- Implementing request queuing
- Adding exponential backoff for retries
- Caching responses to reduce API calls

### Future Enhancements

Potential API improvements:

1. **Write Operations**: Currently only reads from ClickUp. Future support for:
   - Creating tasks
   - Updating tasks
   - Deleting tasks
   - Managing dependencies

2. **Webhooks**: Real-time updates when tasks change in ClickUp

3. **Batch Operations**: Efficiently fetch multiple resources

4. **Filtering**: Support for ClickUp's advanced filtering options

5. **Pagination**: Handle large task lists with pagination

