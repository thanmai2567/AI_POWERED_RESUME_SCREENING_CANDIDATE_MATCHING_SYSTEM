# Resume Matcher Backend

This is the backend for the Resume Matcher application, which provides AI-powered resume analysis and job matching capabilities.

## Features

- **Authentication**: Register and login endpoints with JWT token generation
- **Resume Processing**: PDF text extraction and AI analysis using Gemini API
- **Job Matching**: AI-powered matching algorithm with score calculation
- **Skills Analysis**: AI-powered skills analysis and career path recommendations

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017
   JWT_SECRET_KEY=your-secret-key-change-in-production
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. Start MongoDB:
   Make sure MongoDB is running on your system.

4. Run the application:
   ```
   python app.py
   ```

## API Endpoints

### Authentication
- `POST /api/register`: Register a new user
- `POST /api/login`: Login and get JWT token

### Resume Management
- `POST /api/resume/upload`: Upload and process a resume
- `GET /api/resume/user`: Get the current user's resume
- `GET /api/resume/<resume_id>/download`: Download a resume
- `GET /api/resumes`: Get all resumes (company only)

### Job Matching
- `POST /api/match`: Match resumes with a job description
- `GET /api/match/history`: Get match history (company only)

### Skills Analysis
- `GET /api/skills/analysis`: Get skills analysis for the current user's resume

## Data Models

### User
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "password": "string (hashed)",
  "collegeCode": "string",
  "type": "string (student/company)",
  "createdAt": "datetime"
}
```

### Resume
```json
{
  "_id": "string",
  "userId": "string",
  "name": "string",
  "email": "string",
  "suggestedRole": "string",
  "experience": "string",
  "skills": ["string"],
  "text": "string",
  "filePath": "string",
  "collegeCode": "string",
  "uploadDate": "datetime"
}
```

### Job Match
```json
{
  "_id": "string",
  "userId": "string",
  "jobDescription": "string",
  "collegeCode": "string",
  "matches": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "score": "number"
    }
  ],
  "date": "datetime"
}
``` 