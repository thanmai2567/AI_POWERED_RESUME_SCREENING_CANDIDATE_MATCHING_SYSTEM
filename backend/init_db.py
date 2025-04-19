from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure MongoDB
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(mongo_uri)
db = client['resume_matcher']
users_collection = db['users']
resumes_collection = db['resumes']
job_matches_collection = db['job_matches']

# Clear existing data
users_collection.delete_many({})
resumes_collection.delete_many({})
job_matches_collection.delete_many({})

# Sample users
sample_users = [
    {
        '_id': 'user1',
        'name': 'John Student',
        'email': 'student@example.com',
        'password': generate_password_hash('password'),
        'collegeCode': 'COLLEGE123',
        'type': 'student',
        'createdAt': datetime.utcnow()
    },
    {
        '_id': 'user2',
        'name': 'Acme Corp',
        'email': 'company@example.com',
        'password': generate_password_hash('password'),
        'collegeCode': 'COLLEGE123',
        'type': 'company',
        'createdAt': datetime.utcnow()
    }
]

# Sample resumes
sample_resumes = [
    {
        '_id': 'resume1',
        'userId': 'user1',
        'name': 'John Student',
        'email': 'student@example.com',
        'suggestedRole': 'Frontend Developer',
        'experience': '3 years of experience in web development',
        'skills': ['React', 'JavaScript', 'HTML/CSS', 'Git', 'TypeScript'],
        'text': 'Sample resume text for John Student',
        'filePath': 'uploads/sample_resume1.pdf',
        'collegeCode': 'COLLEGE123',
        'uploadDate': datetime(2023, 5, 15)
    },
    {
        '_id': 'resume2',
        'userId': 'user3',
        'name': 'Jane Doe',
        'email': 'jane@example.com',
        'suggestedRole': 'Full Stack Developer',
        'experience': '4 years of experience in full stack development',
        'skills': ['React', 'Node.js', 'MongoDB', 'Express', 'AWS'],
        'text': 'Sample resume text for Jane Doe',
        'filePath': 'uploads/sample_resume2.pdf',
        'collegeCode': 'COLLEGE123',
        'uploadDate': datetime(2023, 6, 20)
    }
]

# Sample job matches
sample_job_matches = [
    {
        '_id': 'match1',
        'userId': 'user2',
        'jobDescription': 'We are looking for a Frontend Developer with experience in React, TypeScript, and modern web development practices. The ideal candidate should have strong problem-solving skills and be familiar with responsive design principles.',
        'collegeCode': 'COLLEGE123',
        'matches': [
            {
                'id': 'resume1',
                'name': 'John Student',
                'email': 'student@example.com',
                'score': 92
            },
            {
                'id': 'resume2',
                'name': 'Jane Doe',
                'email': 'jane@example.com',
                'score': 85
            }
        ],
        'date': datetime(2023, 10, 10)
    }
]

# Insert sample data
users_collection.insert_many(sample_users)
resumes_collection.insert_many(sample_resumes)
job_matches_collection.insert_many(sample_job_matches)

print("Database initialized with sample data.") 