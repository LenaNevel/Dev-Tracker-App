# Dev Tracker App — Backend

This is the Flask REST API for Dev Tracker App.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
# edit .env for your secrets
flask db upgrade
flask run
