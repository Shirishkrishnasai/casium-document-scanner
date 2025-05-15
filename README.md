# Casium Document Scanner (AI + FastAPI + OpenAI Vision)

This project allows users to upload identity documents like passports, driver licenses, and EAD cards. It uses OpenAI Vision (`gpt-4o`) to:
- Classify the document type
- Extract relevant fields
- Normalize the data (dates, names)
- Display and update the results via a React-based frontend

---

## How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/shirishkrishnasai/casium-document-scanner.git
cd casium-document-scanner
```

### 2. Setup Python Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 3. Add your `.env` file

Create a `.env` file in the `backend` directory:

```
OPENAI_API_KEY=sk-...
```

> **Important:**  
> To use AI capabilities like classification and field extraction, you must have an **OpenAI API key**.
> - Get it from: [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)  
> - Click **"Create new secret key"**, then copy and paste it above.

### 4. Run the Backend

```bash
uvicorn app.main:app --reload
```

The backend will be live at: `http://localhost:8000`

---

### 5. Setup React Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## AI Model & Design Choices

### Model Used: `gpt-4o`

We chose GPT-4o (Omni) for this task due to its **multimodal capabilities**, which make it ideal for working directly with images:

- **Document type classification** using the actual document scan
- **Field extraction** from layout-aware context
- Handles **ambiguous or fuzzy data** (like mixed name fields or variable date formats)
- Offers **lower latency and cost** than GPT-4-vision
- Strong contextual understanding of structured document layouts

---

## Dataset Design & Testing Strategy

### 1. Manual Dataset Creation
We created a **simulated dataset** of identity documents for testing:

- Fake names, dates, and numbers
- Blurred or publicly available template scans
- Expandable using tools like Faker or mock APIs

### 2. Validation Strategy

We validate extracted content by:
- Checking extracted keys against expected fields per document type
- Verifying date formats using regex or `datetime.strptime`
- Checking name disambiguation when full name is provided

---

## Standardizing Dates Across Formats

The backend attempts to normalize ambiguous date formats:

- Tries common formats: `MM/DD/YYYY`, `DD-MM-YYYY`, etc.
- If successful, converts to `YYYY-MM-DD`
- Falls back to raw value if parsing fails

---

## Name Disambiguation Logic

If only a full name is found:

- Splits on the first space:
  - `"John Doe"` becomes `first_name = John`, `last_name = Doe`
- Edge cases (like `Mary Ann Smith`) default to raw format if uncertain

---

## Directory Structure

```
casium-document-scanner/
├── backend/
│   ├── app/
│   │   ├── api/               # FastAPI route handlers
│   │   ├── core/              # Configs, settings
│   │   ├── db/                # Database models and session
│   │   ├── models/            # Pydantic models
│   │   ├── services/          # Business logic
│   │   └── main.py            # FastAPI entrypoint
│   ├── tests/                 # Unit tests for backend
│   ├── .env                   # Environment config file
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── __tests__/         # Frontend test files
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Route-level components
│   │   ├── services/          # API interaction logic
│   │   └── types/             # TypeScript types
│   ├── package.json           # Frontend dependencies and scripts
│   └── tsconfig.json          # TypeScript config
│
└── README.md                  # Project overview

```

---

## Dependencies

### Backend (FastAPI + OpenAI + SQLAlchemy + Vision Tools)

```
fastapi
uvicorn
python-multipart
pydantic
pillow
sqlalchemy
aiosqlite
langchain
openai
python-dotenv
pdf2image
aiofiles
asyncpg
greenlet
```

Install via:

```bash
pip install -r requirements.txt
```

---

### Frontend (React + TailwindCSS + Axios + Vite)

```
react
typescript
axios
vite
tailwindcss
```

Install with:

```bash
npm install
```

---

## Testing

### Backend

- Test framework: `pytest`
- Coverage: > 85%
- Covers:
  - `/process-document` logic
  - Field normalization
  - API routes
  - Schema validation

Run tests:

```bash
cd backend
pytest --cov=app
```

### Frontend

- Test framework: `Jest` + `React Testing Library`
- Covers:
  - File uploads
  - Document viewer
  - Document list selection
  - Field editing flow

Run tests:

```bash
cd frontend
npm test
```

## Demo Video

You can view a sample testing video of this project here:  
🎥 [Casium Document Scanner - Demo Video](https://drive.google.com/file/d/1TdER9SZb6dqpV0AC5E8mpqlNKmNv0w2o/view?usp=drivesdk)
