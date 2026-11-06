import { Opportunity } from "./opportunity";

/** Helper: a Date `days` from today (used so sample deadlines always look fresh). */
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  return d;
}

/**
 * Sample opportunities shown the first time the app runs, so the board
 * is never empty. NOTE: these are demo entries for the live demo -
 * replace/DELETE them from your own database once real posts come in.
 */
export async function seedOpportunities() {
  const samples = [
    {
      title: "Google Summer of Code 2027 - Contributor Applications",
      organisation: "Google Open Source",
      type: "Internship" as const,
      description:
        "Work with real open-source organisations over 12 weeks, remotely, with a mentor stipend from Google. Great for students who want their first remote software engineering experience.",
      link: "https://summerofcode.withgoogle.com",
      deadline: daysFromNow(25),
    },
    {
      title: "Smart India Hackathon 2026 - Student Registration",
      organisation: "Ministry of Education, Govt. of India",
      type: "Hackathon" as const,
      description:
        "India's biggest hackathon. Teams solve problem statements posted by ministries and industries; winners get prizes and productisation offers. Register as a 6-member team.",
      link: "https://www.sih.gov.in",
      deadline: daysFromNow(12),
    },
    {
      title: "Amazon SDE Internship - Summer 2027 (On-campus)",
      organisation: "Amazon",
      type: "Internship" as const,
      description:
        "Two-month summer internship for pre-final year students. Online assessments in DSA, followed by two technical interviews. Stipend and PPO chance based on performance.",
      link: "https://www.amazon.jobs",
      deadline: daysFromNow(30),
    },
    {
      title: "Imagine Cup 2026 - Global Student Tech Competition",
      organisation: "Microsoft",
      type: "Hackathon" as const,
      description:
        "Build a project with Azure AI services and compete with student teams worldwide. Regional winners advance to the world finals and get mentorship from Microsoft engineers.",
      link: "https://imaginecup.microsoft.com",
      deadline: daysFromNow(18),
    },
    {
      title: "Reliance Foundation Undergraduate Scholarships",
      organisation: "Reliance Foundation",
      type: "Scholarship" as const,
      description:
        "Up to Rs. 2 lakh over the course of the degree for first-year undergraduates with family income below Rs. 15 lakh. Merit-cum-need based, includes a leadership development programme.",
      link: "https://www.reliancefoundation.org/scholarships",
      deadline: daysFromNow(15),
    },
    {
      title: "TechFest IIT Bombay 2026",
      organisation: "IIT Bombay",
      type: "Event" as const,
      description:
        "Asia's largest science and technology festival: robotics competitions, coding contests, exhibitions and keynote talks. Travel and accommodation available for outstation participants.",
      link: "https://www.techfest.org",
      deadline: daysFromNow(9),
    },
    {
      title: "Prime Minister's Research Fellowship (PMRF)",
      organisation: "Ministry of Education",
      type: "Scholarship" as const,
      description:
        "Direct admission to PhD programmes in IITs/IISc with a fellowship of up to Rs. 80 lakh over five years, for students with strong academic records from recognized institutions.",
      link: "https://pmrf.in",
      deadline: daysFromNow(35),
    },
    {
      title: "ETHIndia 2026 - Web3 Hackathon",
      organisation: "Devfolio",
      type: "Hackathon" as const,
      description:
        "Two-day flagship Ethereum hackathon. Build dApps with mentors from leading protocols; bounties, travel grants and swag for all selected hackers.",
      link: "https://ethindia.co",
      deadline: daysFromNow(16),
    },
    {
      title: "Zoho Corporation - Off-campus Software Developer Drive",
      organisation: "Zoho",
      type: "Internship" as const,
      description:
        "Off-campus recruitment for 2027 batch engineering students. Rounds: aptitude, programming (C/Java/Python), advanced coding and technical interview. Work location: Chennai/Tenkasi.",
      link: "https://www.zoho.com/careers",
      deadline: daysFromNow(21),
    },
    {
      title: "GDG DevFest 2026 - Chennai Edition",
      organisation: "Google Developer Groups",
      type: "Event" as const,
      description:
        "One-day community conference with sessions on Android, web, AI and cloud, plus hands-on codelabs. Free entry; limited seats - reserve your spot early.",
      link: "https://devfest.withgoogle.com",
      deadline: daysFromNow(6),
    },
  ];

  await Opportunity.insertMany(samples);
  console.log(`[db] Seeded ${samples.length} sample opportunities.`);
}
