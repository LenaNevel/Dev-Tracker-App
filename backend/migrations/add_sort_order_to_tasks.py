#!/usr/bin/env python3
"""
Migration script to add sort_order column to tasks table
Run this script from the backend directory: python migrations/add_sort_order_to_tasks.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import Task, TaskStatus

def migrate_add_sort_order():
    """Add sort_order column to tasks and set initial values"""
    app = create_app()
    
    with app.app_context():
        try:
            # Add the column (this will fail if it already exists)
            with db.engine.connect() as conn:
                conn.execute(db.text('ALTER TABLE task ADD COLUMN sort_order FLOAT NOT NULL DEFAULT 1000.0'))
                conn.commit()
            print("✅ Added sort_order column to tasks table")
            
            # Set initial sort_order values for existing tasks
            # Group by status and assign incremental values
            for status in TaskStatus:
                tasks = Task.query.filter_by(status=status, is_deleted=False).order_by(Task.created_at).all()
                
                for i, task in enumerate(tasks):
                    # Start at 1000 and increment by 1000 for each task
                    task.sort_order = 1000.0 + (i * 1000.0)
                
                print(f"✅ Updated {len(tasks)} tasks in {status.value} status")
            
            db.session.commit()
            print("✅ Migration completed successfully!")
            
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("⚠️  sort_order column already exists, skipping column creation")
                
                # Still update existing tasks that might not have sort_order set
                tasks_without_order = Task.query.filter(
                    (Task.sort_order == None) | (Task.sort_order == 0)
                ).all()
                
                if tasks_without_order:
                    print(f"🔧 Found {len(tasks_without_order)} tasks without sort_order, updating...")
                    
                    for status in TaskStatus:
                        tasks = Task.query.filter_by(status=status, is_deleted=False).filter(
                            (Task.sort_order == None) | (Task.sort_order == 0)
                        ).order_by(Task.created_at).all()
                        
                        for i, task in enumerate(tasks):
                            # Find the highest sort_order for this status
                            max_order = db.session.query(db.func.max(Task.sort_order)).filter_by(
                                status=status, is_deleted=False
                            ).scalar() or 0
                            
                            task.sort_order = max_order + 1000.0 + (i * 1000.0)
                        
                        if tasks:
                            print(f"✅ Updated {len(tasks)} tasks in {status.value} status")
                    
                    db.session.commit()
                    print("✅ Updated tasks without sort_order!")
                else:
                    print("✅ All tasks already have sort_order values")
            else:
                print(f"❌ Migration failed: {e}")
                db.session.rollback()
                raise

if __name__ == "__main__":
    migrate_add_sort_order()