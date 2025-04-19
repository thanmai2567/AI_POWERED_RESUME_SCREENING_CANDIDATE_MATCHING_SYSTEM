// Mock user data
export const mockUsers = [
  {
    id: "user1",
    email: "student@example.com",
    password: "password",
    name: "John Student",
    collegeCode: "COLLEGE123",
    type: "student",
  },
  {
    id: "user2",
    email: "company@example.com",
    password: "password",
    name: "Acme Corp",
    collegeCode: "COLLEGE123",
    type: "company",
  },
]

// Mock resume data
export const mockResumes = [
  {
    _id: "resume1",
    userId: "user1",
    name: "John Student",
    email: "student@example.com",
    suggestedRole: "Frontend Developer",
    experience: "3 years of experience in web development",
    skills: ["React", "JavaScript", "HTML/CSS", "Git", "TypeScript"],
    collegeCode: "COLLEGE123",
    uploadDate: new Date("2023-05-15").toISOString(),
  },
  {
    _id: "resume2",
    userId: "user3",
    name: "Jane Doe",
    email: "jane@example.com",
    suggestedRole: "Full Stack Developer",
    experience: "4 years of experience in full stack development",
    skills: ["React", "Node.js", "MongoDB", "Express", "AWS"],
    collegeCode: "COLLEGE123",
    uploadDate: new Date("2023-06-20").toISOString(),
  },
  {
    _id: "resume3",
    userId: "user4",
    name: "Bob Smith",
    email: "bob@example.com",
    suggestedRole: "Data Scientist",
    experience: "2 years of experience in data analysis",
    skills: ["Python", "Machine Learning", "SQL", "Data Visualization", "Statistics"],
    collegeCode: "COLLEGE123",
    uploadDate: new Date("2023-07-10").toISOString(),
  },
  {
    _id: "resume4",
    userId: "user5",
    name: "Alice Johnson",
    email: "alice@example.com",
    suggestedRole: "UX/UI Designer",
    experience: "5 years of experience in design",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "Wireframing"],
    collegeCode: "COLLEGE123",
    uploadDate: new Date("2023-08-05").toISOString(),
  },
  {
    _id: "resume5",
    userId: "user6",
    name: "Charlie Brown",
    email: "charlie@example.com",
    suggestedRole: "DevOps Engineer",
    experience: "3 years of experience in cloud infrastructure",
    skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform"],
    collegeCode: "COLLEGE123",
    uploadDate: new Date("2023-09-15").toISOString(),
  },
]

// Mock job match history
export const mockMatchHistory = [
  {
    _id: "match1",
    userId: "user2",
    jobDescription:
      "We are looking for a Frontend Developer with experience in React, TypeScript, and modern web development practices. The ideal candidate should have strong problem-solving skills and be familiar with responsive design principles.",
    collegeCode: "COLLEGE123",
    matches: [
      {
        id: "resume1",
        name: "John Student",
        email: "student@example.com",
        score: 92,
      },
      {
        id: "resume2",
        name: "Jane Doe",
        email: "jane@example.com",
        score: 85,
      },
      {
        id: "resume4",
        name: "Alice Johnson",
        email: "alice@example.com",
        score: 70,
      },
    ],
    date: new Date("2023-10-10").toISOString(),
  },
  {
    _id: "match2",
    userId: "user2",
    jobDescription:
      "Seeking a Data Scientist with strong Python skills and experience in machine learning algorithms. The candidate should be able to work with large datasets and have knowledge of statistical analysis.",
    collegeCode: "COLLEGE123",
    matches: [
      {
        id: "resume3",
        name: "Bob Smith",
        email: "bob@example.com",
        score: 95,
      },
      {
        id: "resume5",
        name: "Charlie Brown",
        email: "charlie@example.com",
        score: 65,
      },
      {
        id: "resume2",
        name: "Jane Doe",
        email: "jane@example.com",
        score: 60,
      },
    ],
    date: new Date("2023-11-05").toISOString(),
  },
]

// Mock skills analysis
export const mockSkillsAnalysis = {
  skills: {
    strong: ["React", "JavaScript", "HTML/CSS", "Git"],
    improve: ["Python", "Data Structures", "System Design"],
  },
  careerPath: ["Frontend Developer", "Full Stack Developer", "UI/UX Engineer"],
  suggestions: [
    "Consider adding more backend projects to your portfolio",
    "Highlight your problem-solving skills more prominently",
    "Add quantifiable achievements to demonstrate impact",
  ],
}

// Mock job matching results
export const mockJobMatches = (jobDescription: string) => {
  return [
    {
      resume: {
        _id: "resume1",
        name: "John Student",
        email: "student@example.com",
        suggestedRole: "Frontend Developer",
      },
      score: 92,
      highlights: [
        "Strong experience with React and modern JavaScript",
        "Demonstrated ability to build responsive web applications",
        "Good understanding of frontend performance optimization",
      ],
    },
    {
      resume: {
        _id: "resume2",
        name: "Jane Doe",
        email: "jane@example.com",
        suggestedRole: "Full Stack Developer",
      },
      score: 85,
      highlights: [
        "Experience with both frontend and backend technologies",
        "Strong JavaScript skills including React and Node.js",
        "Has worked on similar projects in the past",
      ],
    },
    {
      resume: {
        _id: "resume3",
        name: "Bob Smith",
        email: "bob@example.com",
        suggestedRole: "Data Scientist",
      },
      score: 65,
      highlights: [
        "Has some relevant technical skills but different domain focus",
        "Strong analytical abilities that could transfer to this role",
        "Would need additional training in frontend technologies",
      ],
    },
    {
      resume: {
        _id: "resume4",
        name: "Alice Johnson",
        email: "alice@example.com",
        suggestedRole: "UX/UI Designer",
      },
      score: 70,
      highlights: [
        "Strong design skills that complement frontend development",
        "Experience with user-centered design principles",
        "Has worked with developers on implementing UI designs",
      ],
    },
    {
      resume: {
        _id: "resume5",
        name: "Charlie Brown",
        email: "charlie@example.com",
        suggestedRole: "DevOps Engineer",
      },
      score: 60,
      highlights: [
        "Technical background but different specialization",
        "Experience with deployment and infrastructure could be valuable",
        "Would need significant training in frontend technologies",
      ],
    },
  ]
}

// Mock authentication service
export const mockAuthService = {
  login: (email: string, password: string) => {
    const user = mockUsers.find((u) => u.email === email && u.password === password)
    if (user) {
      return {
        token: "mock-jwt-token",
        userType: user.type,
        collegeCode: user.collegeCode,
        userId: user.id,
      }
    }
    throw new Error("Invalid credentials")
  },

  getUserResume: (userId: string) => {
    return mockResumes.find((r) => r.userId === userId)
  },

  getResumesByCollegeCode: (collegeCode: string) => {
    return mockResumes.filter((r) => r.collegeCode === collegeCode)
  },

  getMatchHistory: (userId: string) => {
    return mockMatchHistory.filter((m) => m.userId === userId)
  },

  matchResumes: (jobDescription: string, collegeCode: string, topN: number) => {
    const matches = mockJobMatches(jobDescription)
    return matches.slice(0, topN)
  },
}
