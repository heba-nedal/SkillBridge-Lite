export type Opportunity = {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  responsibilities: string[];
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "ai-automation-intern",
    title: "AI Automation Intern",
    company: "TechFlow",
    description:
      "Support development of AI-powered workflows and automation solutions for business processes.",
    skills: ["Python", "AI", "Automation", "APIs"],
    responsibilities: [
      "Assist in building automated workflows for internal business processes",
      "Integrate AI services and third-party APIs",
      "Write and maintain Python scripts",
      "Document solutions and share findings with the team",
    ],
  },
  {
    id: "junior-frontend-developer",
    title: "Junior Frontend Developer",
    company: "PixelWorks",
    description: "Help build responsive web interfaces and interactive user experiences.",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    responsibilities: [
      "Build responsive pages and reusable interface components",
      "Implement designs accurately across devices",
      "Fix interface bugs and improve accessibility",
      "Collaborate with designers and backend developers",
    ],
  },
  {
    id: "iot-solutions-engineer",
    title: "IoT Solutions Engineer",
    company: "Connected Systems Lab",
    description:
      "Support development of connected systems using sensors, microcontrollers, and software.",
    skills: ["IoT", "Python", "ESP32", "APIs"],
    responsibilities: [
      "Prototype connected devices with ESP32 microcontrollers",
      "Collect and process sensor data",
      "Connect devices to software services through APIs",
      "Test and troubleshoot hardware and software integrations",
    ],
  },
];

export const getOpportunity = (id: string) => OPPORTUNITIES.find((o) => o.id === id);
