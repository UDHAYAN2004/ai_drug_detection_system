# Windows Setup Guide — AI Drug Detection System (Simple Step-by-Step)

## 1. Install Python

1. Go to https://www.python.org/downloads/
2. Download **Python 3.11 or newer**
3. During installation enable **“Add Python to PATH”**
4. Verify installation:

```
python --version
```

You should see something like:

```
Python 3.11.x
```

---

## 2. Install PostgreSQL (Database)

1. Download from: https://www.postgresql.org/download/windows/
2. Install PostgreSQL.
3. During installation:

   * Username: `postgres`
   * Set a password (remember it)
4. Default port will be:

```
5432
```

---

## 3. Install Tesseract OCR

1. Download from:
   https://github.com/UB-Mannheim/tesseract/wiki

2. Install to:

```
C:\Program Files\Tesseract-OCR
```

3. Enable **Add to PATH**

4. Verify installation:

```
tesseract --version
```

---

## 4. Install Poppler (PDF Support)

1. Download from:
   https://github.com/oschwartz10612/poppler-windows/releases/

2. Extract to:

```
C:\poppler
```

3. Add this to system PATH:

```
C:\poppler\Library\bin
```

Steps:

* Search **Environment Variables**
* Click **Edit System Environment Variables**
* Click **Environment Variables**
* Select **Path**
* Click **Edit**
* Click **New**
* Paste:

```
C:\poppler\Library\bin
```

Click **OK**

---

## 5. Open Command Prompt

Press:

```
Windows + X
```

Open **Command Prompt / Terminal**

---

## 6. Go to Project Folder

Example:

```
cd C:\Users\Udhayan\Desktop\ai_drug_detection_system
```

---

## 7. Create Virtual Environment

```
python -m venv venv
```

Activate it:

```
venv\Scripts\activate
```

You will see:

```
(venv)
```

---

## 8. Install Dependencies

```
pip install -r requirements.txt
```

If error occurs:

```
pip install psycopg2-binary --no-cache-dir
```

---

## 9. Create Environment File

```
copy .env.example .env
```

Open it:

```
notepad .env
```

Edit these values:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_drug_detection_db
SECRET_KEY=myverystrongsecretkey123456789
```

Example:

```
DATABASE_URL=postgresql://postgres:1234@localhost:5432/ai_drug_detection_db
```

Save the file.

---

## 10. Create Database

```
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE ai_drug_detection_db;"
```

Enter your PostgreSQL password.

---

## 11. Run Database Migration

```
alembic upgrade head
```

---

## 12. Start the Server

```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 13. Open API Documentation

Open browser and visit:

```
http://localhost:8000/docs
```

Swagger API documentation will open.

---

## Run Tests (Optional)

```
pytest tests/ -v
```

---

## Quick Start Next Time

```
cd project-folder
venv\Scripts\activate
uvicorn app.main:app --reload
```

---

## Troubleshooting

Tesseract Error:

Add to `.env`

```
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

PostgreSQL Not Running:

Press:

```
Win + R
```

Type:

```
services.msc
```

Start service:

```
postgresql-x64-16
```

---

## API Links

Swagger UI:

```
http://localhost:8000/docs
```

ReDoc:

```
http://localhost:8000/redoc
```
