"""
Router para tareas (/api/tasks)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_db

router = APIRouter(prefix="/tasks", tags=["tasks"])


class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    created_at: datetime = datetime.utcnow()


class TaskList(BaseModel):
    total: int
    tasks: List[Task]


@router.get("/", response_model=TaskList)
async def list_tasks(db: Session = Depends(get_db)):
    return {"total": 0, "tasks": []}


@router.post("/", response_model=Task)
async def create_task(payload: dict, db: Session = Depends(get_db)):
    return Task(
        id=1,
        title=payload.get("title", "Nueva tarea"),
        description=payload.get("description"),
        status=payload.get("status", "pending"),
        priority=payload.get("priority", "medium"),
    )


@router.patch("/{task_id}", response_model=Task)
async def update_task(task_id: int, payload: dict, db: Session = Depends(get_db)):
    return Task(
        id=task_id,
        title=payload.get("title", "Tarea demo"),
        description=payload.get("description"),
        status=payload.get("status", "pending"),
        priority=payload.get("priority", "medium"),
    )


@router.post("/{task_id}/complete", response_model=Task)
async def complete_task(task_id: int, db: Session = Depends(get_db)):
    return Task(
        id=task_id,
        title="Tarea demo",
        description="",
        status="completed",
        priority="medium",
    )
