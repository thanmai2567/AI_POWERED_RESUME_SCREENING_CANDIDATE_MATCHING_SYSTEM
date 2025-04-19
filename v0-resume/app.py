from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime, timedelta
import PyPDF2
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)

# Configure MongoDB
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(mongo_uri)
db = client['resume_matcher']
users_collection = db['users']
resumes_collection = db['resumes']
job_matches_collection = db['job_matches']

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

# Configure file uploads
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max upload

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    # Check if user already exists
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'message': 'User already exists'}), 400
    
    # Create new user
    new_user = {
        '_id': str(uuid.uuid4()),
        'name': data['name'],
        'email': data['email'],
        'password': generate_password_hash(data['password']),
        'collegeCode': data['collegeCode'],
        'type': data['type'],
        'createdAt': datetime.utcnow()
    }
    
    users_collection.insert_one(new_user)
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    user = users_collection.find_one({'email': data['email']})
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user['_id'])
    
    return jsonify({
        'token': access_token,
        'userType': user['type'],
        'collegeCode': user['collegeCode']
    }), 200

# Resume routes
@app.route('/api/resume/upload', methods=['POST'])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()
    user = users_collection.find_one({'_id': user_id})
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if 'resume' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['resume']
    
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{user_id}_{filename}")
        file.save(file_path)
        
        # Extract text from PDF
        text = extract_text_from_pdf(file_path)
        
        # Use Gemini API to extract information
        resume_info = extract_resume_info(text, user['collegeCode'])
        
        # Check if user already has a resume
        existing_resume = resumes_collection.find_one({'userId': user_id})
        
        if existing_resume:
            # Update existing resume
            resumes_collection.update_one(
                {'userId': user_id},
                {'$set': {
                    'name': resume_info['name'],
                    'email': resume_info['email'],
                    'suggestedRole': resume_info['suggestedRole'],
                    'experience': resume_info['experience'],
                    'skills': resume_info['skills'],
                    'text': text,
                    'filePath': file_path,
                    'collegeCode': user['collegeCode'],
                    'uploadDate': datetime.utcnow()
                }}
            )
            resume_id = existing_resume['_id']
        else:
            # Create new resume entry
            resume_id = str(uuid.uuid4())
            resumes_collection.insert_one({
                '_id': resume_id,
                'userId': user_id,
                'name': resume_info['name'],
                'email': resume_info['email'],
                'suggestedRole': resume_info['suggestedRole'],
                'experience': resume_info['experience'],
                'skills': resume_info['skills'],
                'text': text,
                'filePath': file_path,
                'collegeCode': user['collegeCode'],
                'uploadDate': datetime.utcnow()
            })
        
        return jsonify({
            '_id': resume_id,
            'name': resume_info['name'],
            'email': resume_info['email'],
            'suggestedRole': resume_info['suggestedRole'],
            'experience': resume_info['experience'],
            'skills': resume_info['skills'],
            'collegeCode': user['collegeCode'],
            'uploadDate': datetime.utcnow()
        }), 200
    
    return jsonify({'message': 'File type not allowed'}), 400

@app.route('/api/resume/user', methods=['GET'])
@jwt_required()
def get_user_resume():
    user_id = get_jwt_identity()
    
    resume = resumes_collection.find_one({'userId': user_id})
    
    if not resume:
        return jsonify({'message': 'No resume found'}), 404
    
    return jsonify({
        '_id': resume['_id'],
        'name': resume['name'],
        'email': resume['email'],
        'suggestedRole': resume['suggestedRole'],
        'experience': resume['experience'],
        'skills': resume['skills'],
        'collegeCode': resume['collegeCode'],
        'uploadDate': resume['uploadDate']
    }), 200

@app.route('/api/resume/<resume_id>/download', methods=['GET'])
@jwt_required()
def download_resume(resume_id):
    resume = resumes_collection.find_one({'_id': resume_id})
    
    if not resume:
        return jsonify({'message': 'Resume not found'}), 404
    
    # Check if user is authorized (company with matching college code or resume owner)
    user_id = get_jwt_identity()
    user = users_collection.find_one({'_id': user_id})
    
    if user['type'] == 'company' and user['collegeCode'] != resume['collegeCode']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    if user['type'] == 'student' and user['_id'] != resume['userId']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        return send_file(resume['filePath'], as_attachment=True)
    except:
        return jsonify({'message': 'Error downloading file'}), 500

@app.route('/api/resumes', methods=['GET'])
@jwt_required()
def get_resumes():
    user_id = get_jwt_identity()
    user = users_collection.find_one({'_id': user_id})
    
    if not user or user['type'] != 'company':
        return jsonify({'message': 'Unauthorized'}), 403
    
    college_code = request.args.get('collegeCode', user['collegeCode'])
    
    # Get all resumes with matching college code
    resumes = list(resumes_collection.find({'collegeCode': college_code}))
    
    # Format response
    formatted_resumes = []
    for resume in resumes:
        formatted_resumes.append({
            '_id': resume['_id'],
            'name': resume['name'],
            'email': resume['email'],
            'suggestedRole': resume['suggestedRole'],
            'collegeCode': resume['collegeCode'],
            'uploadDate': resume['uploadDate']
        })
    
    return jsonify(formatted_resumes), 200

# Job matching routes
@app.route('/api/match', methods=['POST'])
@jwt_required()
def match_resumes():
    user_id = get_jwt_identity()
    user = users_collection.find_one({'_id': user_id})
    
    if not user or user['type'] != 'company':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.json
    job_description = data['jobDescription']
    college_code = data.get('collegeCode', user['collegeCode'])
    top_n = data.get('topN', 5)
    
    # Get all resumes with matching college code
    resumes = list(resumes_collection.find({'collegeCode': college_code}))
    
    if not resumes:
        return jsonify({'message': 'No resumes found for this college code'}), 404
    
    # Use Gemini API to match resumes
    matches = match_resumes_with_job(job_description, resumes, top_n)
    
    # Save match history
    match_history = {
        '_id': str(uuid.uuid4()),
        'userId': user_id,
        'jobDescription': job_description,
        'collegeCode': college_code,
        'matches': [
            {
                'id': match['resume']['_id'],
                'name': match['resume']['name'],
                'email': match['resume']['email'],
                'score': match['score']
            } for match in matches
        ],
        'date': datetime.utcnow()
    }
    
    job_matches_collection.insert_one(match_history)
    
    return jsonify({
        'matches': matches,
        'historyId': match_history['_id']
    }), 200

@app.route('/api/match/history', methods=['GET'])
@jwt_required()
def get_match_history():
    user_id = get_jwt_identity()
    user = users_collection.find_one({'_id': user_id})
    
    if not user or user['type'] != 'company':
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get match history for user
    history = list(job_matches_collection.find({'userId': user_id}).sort('date', -1))
    
    return jsonify(history), 200

# Helper functions
def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()
    return text

def extract_resume_info(text, college_code):
    prompt = f"""
    Extract the following information from this resume text:
    1. Full Name
    2. Email Address
    3. Suggested Role (based on skills and experience)
    4. Experience Summary (brief)
    5. Key Skills (list)
    
    Resume Text:
    {text}
    
    Format the response as a JSON object with the following keys:
    name, email, suggestedRole, experience, skills
    """
    
    response = model.generate_content(prompt)
    
    try:
        # Parse the response to extract JSON
        response_text = response.text
        # Find JSON content between ```json and ```
        import re
        import json
        json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
        
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find any JSON-like structure
            json_str = response_text
        
        resume_info = json.loads(json_str)
        
        # Ensure all required fields are present
        required_fields = ['name', 'email', 'suggestedRole', 'experience', 'skills']
        for field in required_fields:
            if field not in resume_info:
                resume_info[field] = "Not found"
        
        return resume_info
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        # Return default values if parsing fails
        return {
            'name': "Name not found",
            'email': "Email not found",
            'suggestedRole': "Role not determined",
            'experience': "Experience not extracted",
            'skills': []
        }

def match_resumes_with_job(job_description, resumes, top_n):
    matches = []
    
    for resume in resumes:
        prompt = f"""
        Job Description:
        {job_description}
        
        Resume Information:
        Name: {resume['name']}
        Email: {resume['email']}
        Suggested Role: {resume['suggestedRole']}
        Experience: {resume['experience']}
        Skills: {', '.join(resume['skills']) if isinstance(resume['skills'], list) else resume['skills']}
        
        Full Resume Text:
        {resume['text']}
        
        Task:
        1. Calculate a match score (0-100) between this resume and the job description
        2. Provide 3 key highlights explaining why this candidate matches or doesn't match the job
        
        Format the response as a JSON object with the following keys:
        score (number), highlights (array of strings)
        """
        
        response = model.generate_content(prompt)
        
        try:
            # Parse the response to extract JSON
            response_text = response.text
            # Find JSON content between ```json and ```
            import re
            import json
            json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(1)
            else:
                # Try to find any JSON-like structure
                json_str = response_text
            
            match_info = json.loads(json_str)
            
            # Ensure all required fields are present
            if 'score' not in match_info:
                match_info['score'] = 0
            if 'highlights' not in match_info:
                match_info['highlights'] = []
            
            matches.append({
                'resume': {
                    '_id': resume['_id'],
                    'name': resume['name'],
                    'email': resume['email'],
                    'suggestedRole': resume['suggestedRole']
                },
                'score': match_info['score'],
                'highlights': match_info['highlights']
            })
        except Exception as e:
            print(f"Error parsing Gemini response for matching: {e}")
            # Add with default values if parsing fails
            matches.append({
                'resume': {
                    '_id': resume['_id'],
                    'name': resume['name'],
                    'email': resume['email'],
                    'suggestedRole': resume['suggestedRole']
                },
                'score': 0,
                'highlights': ["Error processing match"]
            })
    
    # Sort matches by score (descending) and take top N
    matches.sort(key=lambda x: x['score'], reverse=True)
    return matches[:top_n]

# Add this import at the top
from flask import send_file

if __name__ == '__main__':
    app.run(debug=True)
