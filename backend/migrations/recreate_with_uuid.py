#!/usr/bin/env python3
"""
Script to completely recreate the database with UUID primary keys
Run this script from the backend directory: python migrations/recreate_with_uuid.py

WARNING: This will delete all existing data and recreate tables!
"""

import sys
import os
import uuid
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db

def recreate_with_uuid():
    """Recreate database with UUID primary keys"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🚨 WARNING: This will delete ALL existing data!")
            print("📋 This will:")
            print("1. Drop all existing tables")
            print("2. Recreate tables with UUID primary keys")
            print("3. You will need to re-add your data")
            print()
            
            # Drop all tables
            print("🔄 Dropping all tables...")
            db.drop_all()
            print("  ✅ All tables dropped")
            
            # Create all tables with new UUID schema
            print("🔄 Creating tables with UUID schema...")
            db.create_all()
            print("  ✅ Tables created with UUIDs")
            
            print("\n✅ Database recreated successfully with UUIDs!")
            print("🔧 Now you can:")
            print("  1. Register a new admin user")
            print("  2. Create new tasks with UUID IDs")
            print("  3. All new data will use UUIDs automatically")
            
        except Exception as e:
            print(f"❌ Recreation failed: {e}")
            raise

if __name__ == "__main__":
    print("🔄 Starting database recreation with UUIDs...")
    print("⚠️  This will DELETE ALL existing data!")
    
    response = input("Do you want to continue? This cannot be undone! (yes/no): ")
    if response.lower() in ['yes', 'y']:
        recreate_with_uuid()
    else:
        print("Recreation cancelled.")