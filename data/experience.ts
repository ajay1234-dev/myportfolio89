export interface Experience {
  id: string;
  years: string;
  role: string;
  company: string;
  description: string;
  wins: string[];
  tech: string[];
}

export const experiences: Experience[] = [
  {
    id: "exp-1",
    years: "2025 — Present",
    role: "Cloud & DevOps Learner",
    company: "Independent Learning",
    description:
      "Currently focusing on cloud computing and DevOps practices, building scalable and automated deployment pipelines. Exploring infrastructure as code, CI/CD workflows, and cloud-native architectures using AWS.",
    wins: [
      "Learning CI/CD pipelines using GitHub Actions and AWS services",
      "Exploring infrastructure automation and deployment strategies",
      "Working with containerization and cloud-based scaling concepts",
    ],
    tech: ["AWS", "Docker", "GitHub Actions", "CI/CD", "Linux"],
  },
  {
    id: "exp-2",
    years: "2025",
    role: "Cloud & Full Stack Developer",
    company: "Project-Based Development",
    description:
      "Built and deployed full-stack applications integrated with cloud infrastructure. Focused on scalable backend systems, serverless architectures, and efficient data handling.",
    wins: [
      "Deployed applications using AWS EC2, Lambda, and S3",
      "Integrated cloud storage and APIs into real-world projects",
      "Designed scalable architectures for AI and web platforms",
    ],
    tech: ["AWS", "React", "Node.js", "Lambda", "DynamoDB", "S3"],
  },
  {
    id: "exp-3",
    years: "2024 — 2025",
    role: "Full Stack Developer",
    company: "Project-Based Development",
    description:
      "Developed multiple full-stack applications with focus on frontend-backend integration, real-time systems, and interactive UI design. Worked on integrating machine learning models into web applications.",
    wins: [
      "Built real-time dashboards and interactive platforms",
      "Integrated Flask-based ML models with React frontend",
      "Implemented authentication systems and REST APIs",
    ],
    tech: ["React", "Flask", "Node.js", "Firebase", "REST APIs"],
  },
  {
    id: "exp-4",
    years: "2023 — 2024",
    role: "Full Stack Development Learner",
    company: "Independent Learning",
    description:
      "Started the journey into full-stack development by learning core web technologies and building foundational projects. Focused on understanding frontend, backend, and database interactions.",
    wins: [
      "Built initial applications using React and Node.js",
      "Learned API development and database integration",
      "Strengthened fundamentals in JavaScript, HTML, and CSS",
    ],
    tech: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
  },
];