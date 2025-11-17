import requests
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

@dataclass
class ClickUpUser:
    """Represents a ClickUp user"""
    id: int
    username: str
    email: str
    color: str
    profile_picture: Optional[str] = None

@dataclass
class ClickUpStatus:
    """Represents a task status"""
    status: str
    color: str
    type: str
    orderindex: int

@dataclass
class ClickUpPriority:
    """Represents task priority"""
    id: str
    priority: str
    color: str
    orderindex: str

@dataclass
class ClickUpTask:
    """Represents a ClickUp task with all its properties"""
    id: str
    name: str
    text_content: str
    description: str
    status: ClickUpStatus
    orderindex: str
    date_created: str
    date_updated: str
    date_closed: Optional[str]
    date_done: Optional[str]
    creator: ClickUpUser
    assignees: List[ClickUpUser]
    watchers: List[ClickUpUser]
    checklists: List[Dict[str, Any]]
    tags: List[Dict[str, Any]]
    parent: Optional[str]
    priority: Optional[ClickUpPriority]
    due_date: Optional[str]
    start_date: Optional[str]
    points: Optional[int]
    time_estimate: Optional[int]
    time_spent: Optional[int]
    custom_fields: List[Dict[str, Any]]
    dependencies: List[str]
    linked_tasks: List[str]
    team_id: str
    url: str
    permission_level: str
    list_info: Dict[str, Any]
    project_info: Dict[str, Any]
    folder_info: Dict[str, Any]
    space_info: Dict[str, Any]

class ClickUpAPI:
    """ClickUp API client for fetching tasks"""
    
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.base_url = "https://api.clickup.com/api/v2"
        self.headers = {
            "Authorization": api_token,
            "Content-Type": "application/json"
        }
    
    def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make a request to the ClickUp API"""
        url = f"{self.base_url}{endpoint}"
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_teams(self) -> List[Dict[str, Any]]:
        """Get all teams/workspaces"""
        return self._make_request("/team")["teams"]
    
    def get_spaces(self, team_id: str) -> List[Dict[str, Any]]:
        """Get all spaces for a team"""
        return self._make_request(f"/team/{team_id}/space")["spaces"]
    
    def get_folders(self, space_id: str) -> List[Dict[str, Any]]:
        """Get all folders in a space"""
        return self._make_request(f"/space/{space_id}/folder")["folders"]
    
    def get_lists(self, folder_id: str) -> List[Dict[str, Any]]:
        """Get all lists in a folder"""
        return self._make_request(f"/folder/{folder_id}/list")["lists"]
    
    def get_folderless_lists(self, space_id: str) -> List[Dict[str, Any]]:
        """Get lists that aren't in folders"""
        return self._make_request(f"/space/{space_id}/list")["lists"]
    
    def get_tasks_from_list(self, list_id: str, **params) -> List[Dict[str, Any]]:
        """Get all tasks from a specific list"""
        return self._make_request(f"/list/{list_id}/task", params)["tasks"]
    
    def get_tasks_from_team(self, team_id: str, **params) -> List[Dict[str, Any]]:
        """Get all tasks from a team"""
        return self._make_request(f"/team/{team_id}/task", params)["tasks"]
    
    def get_task(self, task_id: str) -> Dict[str, Any]:
        """Get a specific task by ID"""
        return self._make_request(f"/task/{task_id}")
    
    def _parse_user(self, user_data: Dict[str, Any]) -> ClickUpUser:
        """Parse user data into ClickUpUser object"""
        return ClickUpUser(
            id=user_data.get("id"),
            username=user_data.get("username", ""),
            email=user_data.get("email", ""),
            color=user_data.get("color", ""),
            profile_picture=user_data.get("profilePicture")
        )
    
    def _parse_status(self, status_data: Dict[str, Any]) -> ClickUpStatus:
        """Parse status data into ClickUpStatus object"""
        return ClickUpStatus(
            status=status_data.get("status", ""),
            color=status_data.get("color", ""),
            type=status_data.get("type", ""),
            orderindex=status_data.get("orderindex", 0)
        )
    
    def _parse_priority(self, priority_data: Optional[Dict[str, Any]]) -> Optional[ClickUpPriority]:
        """Parse priority data into ClickUpPriority object"""
        if not priority_data:
            return None
        return ClickUpPriority(
            id=priority_data.get("id", ""),
            priority=priority_data.get("priority", ""),
            color=priority_data.get("color", ""),
            orderindex=priority_data.get("orderindex", "")
        )
    
    def parse_task(self, task_data: Dict[str, Any]) -> ClickUpTask:
        """Parse raw task data into ClickUpTask object"""
        return ClickUpTask(
            id=task_data.get("id", ""),
            name=task_data.get("name", ""),
            text_content=task_data.get("text_content", ""),
            description=task_data.get("description", ""),
            status=self._parse_status(task_data.get("status", {})),
            orderindex=task_data.get("orderindex", ""),
            date_created=task_data.get("date_created", ""),
            date_updated=task_data.get("date_updated", ""),
            date_closed=task_data.get("date_closed"),
            date_done=task_data.get("date_done"),
            creator=self._parse_user(task_data.get("creator", {})),
            assignees=[self._parse_user(user) for user in task_data.get("assignees", [])],
            watchers=[self._parse_user(user) for user in task_data.get("watchers", [])],
            checklists=task_data.get("checklists", []),
            tags=task_data.get("tags", []),
            parent=task_data.get("parent"),
            priority=self._parse_priority(task_data.get("priority")),
            due_date=task_data.get("due_date"),
            start_date=task_data.get("start_date"),
            points=task_data.get("points"),
            time_estimate=task_data.get("time_estimate"),
            time_spent=task_data.get("time_spent"),
            custom_fields=task_data.get("custom_fields", []),
            dependencies=task_data.get("dependencies", []),
            linked_tasks=task_data.get("linked_tasks", []),
            team_id=task_data.get("team_id", ""),
            url=task_data.get("url", ""),
            permission_level=task_data.get("permission_level", ""),
            list_info=task_data.get("list", {}),
            project_info=task_data.get("project", {}),
            folder_info=task_data.get("folder", {}),
            space_info=task_data.get("space", {})
        )
    
    def get_all_tasks_as_objects(self, team_id: str, **params) -> List[ClickUpTask]:
        """Get all tasks from a team and return as ClickUpTask objects"""
        raw_tasks = self.get_tasks_from_team(team_id, **params)
        return [self.parse_task(task) for task in raw_tasks]
    
    def get_list_tasks_as_objects(self, list_id: str, **params) -> List[ClickUpTask]:
        """Get all tasks from a list and return as ClickUpTask objects"""
        raw_tasks = self.get_tasks_from_list(list_id, **params)
        return [self.parse_task(task) for task in raw_tasks]

# Example usage
if __name__ == "__main__":
    # Initialize the API client
    API_TOKEN = "pk_162298770_TTFOD6EK7IPQ39DI7OGZTT78PQTCBGC4"
    clickup = ClickUpAPI(API_TOKEN)
    
    try:
        # Get teams first
        teams = clickup.get_teams()
        print(f"Found {len(teams)} teams")
        
        if teams:
            team_id = teams[0]["id"]
            print(f"Using team: {teams[0]['name']}")
            
            # Get tasks from the team
            tasks = clickup.get_all_tasks_as_objects(
                team_id=team_id, 
                include_closed='true',  # Include completed tasks
                subtasks='true',       # Include subtasks
                page=0               # Pagination
            )
            
            print(f"\nFound {len(tasks)} tasks")
            
            # Print task info
            for task in tasks:  
                print(f"\nTask: {task.name}")
                print(f"  ID: {task.id}")
                print(f"  Status: {task.status.status}")
                print(f"  Parent: {task.parent}")
                print(f"  Dependencies: {task.dependencies}")
                print(f"  Linked Tasks: {task.linked_tasks}")
                print(f"  Assignees: {[user.username for user in task.assignees]}")
                print(f"  Due Date: {task.due_date}")
                print(f"  Priority: {task.priority.priority if task.priority else 'None'}")
            
            # Count open tasks
            open_tasks = [task for task in tasks if task.status.type != "closed"]
            print(f"\nOpen tasks: {len(open_tasks)}")
            
            # Count tasks assigned to "me"
            my_tasks = [task for task in tasks 
                       if any(user.email == "strugglingstudent090@gmail.com" for user in task.assignees)]
            print(f"My tasks: {len(my_tasks)}")
            
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
    except Exception as e:
        print(f"Error: {e}")