#!/usr/bin/env python3
"""
Seed script to create test tasks for testing delete functionality.
Run this script to add 3 test tasks to the database.
"""

import sys
import os
from datetime import datetime

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models import Task, User, TaskStatus

def seed_test_tasks():
    """Create test tasks for the authenticated user."""
    app = create_app()
    
    with app.app_context():
        # Get the first user (you'll need to be logged in as this user)
        user = User.query.first()
        if not user:
            print("❌ No users found in database. Please register a user first.")
            return
        
        print(f"🔍 Adding test tasks for user: {user.username} (ID: {user.id})")
        
        test_tasks = [
            {
                "title": "Fix bug in login flow",
                "why": "Users can't log in after registration",
                "what": "Investigate auth token handling",
                "how": "Check JWT creation and frontend login logic",
                "acceptance_criteria": "New users can log in immediately",
                "status": TaskStatus.BACKLOG
            },
            {
                "title": "Design new dashboard layout",
                "why": "Current layout looks too sparse",
                "what": "Sketch new layout with more informative widgets",
                "how": "Use Figma or similar tool",
                "acceptance_criteria": "Includes sections for upcoming tasks and stats",
                "status": TaskStatus.IN_PROGRESS
            },
            {
                "title": "Add drag-and-drop support",
                "why": "Improve task prioritization",
                "what": "Implement drag-and-drop between columns",
                "how": "Use react-beautiful-dnd or equivalent",
                "acceptance_criteria": "Tasks can be moved smoothly between columns",
                "status": TaskStatus.DONE
            }
        ]
        
        created_tasks = []
        for task_data in test_tasks:
            # Check if task already exists
            existing_task = Task.query.filter_by(
                title=task_data["title"],
                user_id=user.id,
                is_deleted=False
            ).first()
            
            if existing_task:
                print(f"⚠️  Task '{task_data['title']}' already exists, skipping...")
                continue
            
            # Create new task
            task = Task(
                title=task_data["title"],
                why=task_data["why"],
                what=task_data["what"],
                how=task_data["how"],
                acceptance_criteria=task_data["acceptance_criteria"],
                status=task_data["status"],
                user_id=user.id,
                created_at=datetime.utcnow()
            )
            
            task.save()
            created_tasks.append(task)
            print(f"✅ Created task: '{task.title}' (Status: {task.status.value})")
        
        if created_tasks:
            print(f"\n🎉 Successfully created {len(created_tasks)} test tasks!")
            print("\n📋 Test Tasks Created:")
            for task in created_tasks:
                print(f"   • {task.title} ({task.status.value})")
            print(f"\n🔗 You can now test delete functionality in the UI with user: {user.username}")
        else:
            print("\n⚠️  No new tasks were created (they may already exist)")

if __name__ == "__main__":
    seed_test_tasks()