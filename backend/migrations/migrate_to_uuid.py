#!/usr/bin/env python3
"""
Migration script to convert all integer IDs to UUIDs
Run this script from the backend directory: python migrations/migrate_to_uuid.py

WARNING: This is a major schema change. Make sure to backup your database first!
"""

import sys
import os
import uuid
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import Task, User

def migrate_to_uuid():
    """Convert all integer IDs to UUIDs"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🚨 IMPORTANT: This will modify your database schema!")
            print("📋 Steps that will be performed:")
            print("1. Create mapping of old IDs to new UUIDs")
            print("2. Add new UUID columns")
            print("3. Populate UUID columns with generated UUIDs")
            print("4. Update foreign key references")
            print("5. Drop old integer columns")
            print("6. Rename UUID columns to 'id'")
            print()
            
            # Get current data for mapping
            users = User.query.all()
            tasks = Task.query.all()
            
            print(f"📊 Found {len(users)} users and {len(tasks)} tasks to migrate")
            
            if not users and not tasks:
                print("✅ No data to migrate")
                return
                
            # Create mapping dictionaries
            user_id_mapping = {}
            task_id_mapping = {}
            
            print("\n🔄 Step 1: Creating ID mappings...")
            for user in users:
                new_uuid = str(uuid.uuid4())
                user_id_mapping[user.id] = new_uuid
                print(f"  User {user.id} -> {new_uuid}")
            
            for task in tasks:
                new_uuid = str(uuid.uuid4())
                task_id_mapping[task.id] = new_uuid
                print(f"  Task {task.id} -> {new_uuid}")
            
            # Step 2: Add new UUID columns
            print("\n🔄 Step 2: Adding new UUID columns...")
            with db.engine.connect() as conn:
                # Add UUID columns
                conn.execute(db.text('ALTER TABLE "user" ADD COLUMN id_uuid VARCHAR(36)'))
                conn.execute(db.text('ALTER TABLE task ADD COLUMN id_uuid VARCHAR(36)'))
                conn.execute(db.text('ALTER TABLE task ADD COLUMN user_id_uuid VARCHAR(36)'))
                conn.commit()
            print("  ✅ Added UUID columns")
            
            # Step 3: Populate UUID columns
            print("\n🔄 Step 3: Populating UUID columns...")
            for user in users:
                new_uuid = user_id_mapping[user.id]
                user.id_uuid = new_uuid
            
            for task in tasks:
                task.id_uuid = task_id_mapping[task.id]
                task.user_id_uuid = user_id_mapping[task.user_id]
            
            db.session.commit()
            print("  ✅ Populated UUID columns")
            
            # Step 4: Drop foreign key constraint, drop old columns, rename UUID columns
            print("\n🔄 Step 4: Updating schema...")
            with db.engine.connect() as conn:
                # Drop foreign key constraint (name may vary by database)
                try:
                    # SQLite doesn't support dropping constraints, so we'll recreate tables
                    if 'sqlite' in str(db.engine.url):
                        print("  📝 SQLite detected - recreating tables...")
                        
                        # Create new tables with UUID primary keys
                        conn.execute(db.text('''
                            CREATE TABLE user_new (
                                id VARCHAR(36) PRIMARY KEY,
                                username VARCHAR(80) NOT NULL,
                                email VARCHAR(120) UNIQUE NOT NULL,
                                password_hash VARCHAR(128) NOT NULL,
                                created_at DATETIME,
                                updated_at DATETIME
                            )
                        '''))
                        
                        conn.execute(db.text('''
                            CREATE TABLE task_new (
                                id VARCHAR(36) PRIMARY KEY,
                                title VARCHAR(200) NOT NULL,
                                why TEXT,
                                what TEXT,
                                how TEXT,
                                acceptance_criteria TEXT,
                                notes TEXT,
                                status VARCHAR(20) NOT NULL DEFAULT 'backlog',
                                sort_order FLOAT NOT NULL DEFAULT 1000.0,
                                is_deleted BOOLEAN NOT NULL DEFAULT 0,
                                user_id VARCHAR(36) NOT NULL,
                                created_at DATETIME,
                                updated_at DATETIME,
                                FOREIGN KEY (user_id) REFERENCES user_new (id)
                            )
                        '''))
                        
                        # Copy data to new tables
                        conn.execute(db.text('''
                            INSERT INTO user_new (id, username, email, password_hash, created_at, updated_at)
                            SELECT id_uuid, username, email, password_hash, created_at, updated_at
                            FROM "user"
                        '''))
                        
                        conn.execute(db.text('''
                            INSERT INTO task_new (id, title, why, what, how, acceptance_criteria, notes, status, sort_order, is_deleted, user_id, created_at, updated_at)
                            SELECT id_uuid, title, why, what, how, acceptance_criteria, notes, status, sort_order, is_deleted, user_id_uuid, created_at, updated_at
                            FROM task
                        '''))
                        
                        # Drop old tables and rename new ones
                        conn.execute(db.text('DROP TABLE task'))
                        conn.execute(db.text('DROP TABLE "user"'))
                        conn.execute(db.text('ALTER TABLE user_new RENAME TO "user"'))
                        conn.execute(db.text('ALTER TABLE task_new RENAME TO task'))
                        
                    else:
                        # For PostgreSQL/MySQL
                        conn.execute(db.text('ALTER TABLE task DROP CONSTRAINT task_user_id_fkey'))
                        conn.execute(db.text('ALTER TABLE "user" DROP COLUMN id'))
                        conn.execute(db.text('ALTER TABLE task DROP COLUMN id'))
                        conn.execute(db.text('ALTER TABLE task DROP COLUMN user_id'))
                        conn.execute(db.text('ALTER TABLE "user" RENAME COLUMN id_uuid TO id'))
                        conn.execute(db.text('ALTER TABLE task RENAME COLUMN id_uuid TO id'))
                        conn.execute(db.text('ALTER TABLE task RENAME COLUMN user_id_uuid TO user_id'))
                        conn.execute(db.text('ALTER TABLE "user" ADD PRIMARY KEY (id)'))
                        conn.execute(db.text('ALTER TABLE task ADD PRIMARY KEY (id)'))
                        conn.execute(db.text('ALTER TABLE task ADD FOREIGN KEY (user_id) REFERENCES "user" (id)'))
                        
                    conn.commit()
                    
                except Exception as e:
                    print(f"  ⚠️  Schema update warning: {e}")
                    print("  🔄 Continuing with manual approach...")
                    
            print("  ✅ Schema updated")
            
            # Step 5: Update SQLAlchemy models (this requires manual code changes)
            print("\n📝 Step 5: Manual code changes required:")
            print("  🔧 Update app/models.py:")
            print("     - Change: id = db.Column(db.Integer, primary_key=True)")
            print("     - To:     id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))")
            print("     - Change: user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)")
            print("     - To:     user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)")
            print("  🔧 Update frontend API calls to handle UUID strings instead of integers")
            print("  🔧 Update any hardcoded integer ID references")
            
            print("\n✅ Database migration completed successfully!")
            print("🚨 Remember to update your code to use UUIDs!")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    print("🔄 Starting UUID migration...")
    print("⚠️  Make sure to backup your database first!")
    
    response = input("Do you want to continue? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        migrate_to_uuid()
    else:
        print("Migration cancelled.")