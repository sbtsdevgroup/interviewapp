import Database from 'better-sqlite3';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = join(process.cwd(), 'data', 'ai_interviews.db');
const db = new Database(dbPath);

const questions = [
  // SECTION 1: Pre-Assessment Readiness Checklist
  {
    text: "Confirm your readiness and agreement with the following before beginning this assessment. Check all that apply / confirm before proceeding:\n1. I am in a quiet environment where I can focus for the next 40-45 minutes without interruption.\n2. My internet connection is stable and I have reliable access to the LMS platform.\n3. I have read and understood the candidate instructions and the Assessment Integrity Policy, and I understand that all responses must be in clear, professional English.\n4. I confirm that I will not use any AI tools, translation software, or outside assistance, and I will not share any assessment content with other candidates.\n5. I am ready to begin and will complete all sections without closing or pausing the assessment.",
    criteria: "All items must be confirmed. The student must check all boxes to proceed.",
    category: "Section 1: Pre-Assessment Readiness Checklist",
    type: "checklist",
    options: ["Quiet environment", "Stable internet", "Understand instructions & integrity policy", "No AI / translation / sharing tools", "Ready to complete all sections"]
  },
  // SECTION 2: Communication & English Proficiency
  {
    text: "Provide your full name (first, middle, and last). If you have been assigned an agent name for your BPO role, include it as well. Then briefly describe your educational or professional background in 3-5 sentences.",
    criteria: "Look for full name (and agent name if any) and a description of background in 3-5 complete sentences. Evaluate grammar, professional tone, and sentence structure.",
    category: "Section 2: Communication & English Proficiency",
    type: "long-text",
    options: null
  },
  {
    text: "In your own words, what does customer service mean to you? Explain in 3-5 sentences.",
    criteria: "Look for empathy, customer satisfaction, active listening, and problem-solving elements. Answer must be 3-5 complete sentences with professional grammar.",
    category: "Section 2: Communication & English Proficiency",
    type: "long-text",
    options: null
  },
  {
    text: "Read the following statement and rewrite it in your own words in 2-3 sentences: 'The customer is upset because their issue has not been resolved after multiple follow-ups.'",
    criteria: "Paraphrase should be clear, professional, and capture the core elements: customer frustration, unresolved issue, and repeated follow-ups, without copying the statement word-for-word.",
    category: "Section 2: Communication & English Proficiency",
    type: "long-text",
    options: null
  },
  {
    text: "Describe a real or hypothetical situation where you had to explain something clearly to someone who did not understand it at first. What was the situation, what did you do, and what was the outcome? Write in 4-6 sentences.",
    criteria: "Should describe a situation, action taken to simplify/explain, and a clear positive/constructive outcome. Must be 4-6 complete sentences with professional expression.",
    category: "Section 2: Communication & English Proficiency",
    type: "long-text",
    options: null
  },
  {
    text: "Which of the following BEST demonstrates professional communication during a customer interaction?",
    criteria: "Correct: B (Speaking clearly, using the customer's name, and confirming understanding before offering a solution)",
    category: "Section 2: Communication & English Proficiency",
    type: "multiple-choice",
    options: [
      "Using casual or informal language to make the customer feel comfortable",
      "Speaking clearly, using the customer's name, and confirming understanding before offering a solution",
      "Speaking as quickly as possible to reduce Average Handle Time",
      "Avoiding any small talk and going straight to the issue"
    ]
  },
  {
    text: "A customer speaks very fast and you miss part of what they said. What is the MOST professional response?",
    criteria: "Correct: B (Ask them to repeat themselves using a professional, apologetic tone)",
    category: "Section 2: Communication & English Proficiency",
    type: "multiple-choice",
    options: [
      "Guess what they said and respond based on your assumption",
      "Ask them to repeat themselves using a professional, apologetic tone",
      "Put them on hold and wait for them to slow down",
      "Transfer them to a colleague who may have better listening skills"
    ]
  },
  {
    text: "Which of the following BEST describes 'active listening' in a BPO context?",
    criteria: "Correct: B (Summarizing what the customer said before offering a solution and confirming understanding)",
    category: "Section 2: Communication & English Proficiency",
    type: "multiple-choice",
    options: [
      "Nodding and saying 'yes' repeatedly to show engagement",
      "Summarizing what the customer said before offering a solution and confirming understanding",
      "Staying completely silent until the customer finishes, then immediately solving the problem",
      "Multitasking while the customer speaks so you can prepare your response faster"
    ]
  },
  // SECTION 3: Customer Service & Behavioral Skills
  {
    text: "A customer is angry and raising their voice because they believe they were charged incorrectly. What is the BEST first action?",
    criteria: "Correct: C (Acknowledge their frustration calmly, apologize for the experience, and begin reviewing their account)",
    category: "Section 3: Customer Service & Behavioral Skills",
    type: "multiple-choice",
    options: [
      "Immediately place them on hold and review the account in silence",
      "Match their urgency and speak louder to be heard over them",
      "Acknowledge their frustration calmly, apologize for the experience, and begin reviewing their account",
      "Tell them to lower their voice before you can assist them"
    ]
  },
  {
    text: "Which of the following BEST demonstrates ownership and accountability after making a mistake on a customer account?",
    criteria: "Correct: B (Apologizing sincerely, correcting the error, explaining what happened, and documenting it to prevent recurrence)",
    category: "Section 3: Customer Service & Behavioral Skills",
    type: "multiple-choice",
    options: [
      "Blaming the system or a previous agent for the error",
      "Apologizing sincerely, correcting the error, explaining what happened, and documenting it to prevent recurrence",
      "Waiting to see if the customer notices before taking any action",
      "Transferring the call so a supervisor can handle the fallout"
    ]
  },
  {
    text: "How do you BEST handle a situation where multiple tasks demand your attention simultaneously on a call?",
    criteria: "Correct: B (Prioritize the most urgent task, communicate transparently with the customer, and manage time efficiently)",
    category: "Section 3: Customer Service & Behavioral Skills",
    type: "multiple-choice",
    options: [
      "Focus entirely on one task at a time and ask the customer to wait",
      "Prioritize the most urgent task, communicate transparently with the customer, and manage time efficiently",
      "Ask a colleague to handle the secondary tasks while you stay on the call",
      "Apologize and tell the customer you will call them back"
    ]
  },
  {
    text: "If your supervisor gives you feedback that your performance in a specific area needs improvement, what is the MOST professional response?",
    criteria: "Correct: B (Thank your supervisor, ask for specific examples, and create a plan to address the gap)",
    category: "Section 3: Customer Service & Behavioral Skills",
    type: "multiple-choice",
    options: [
      "Defend your performance and explain why the metrics are unfair",
      "Thank your supervisor, ask for specific examples, and create a plan to address the gap",
      "Agree in the moment but continue doing things the same way",
      "Become discouraged and disengage from your work"
    ]
  },
  {
    text: "Describe a time you made a mistake at work, in training, or at school. What did you do immediately after you realized the mistake, and what did you learn from it?",
    criteria: "Must explain mistake, immediate action taken to correct or escalate, and key lesson learned. Answer in 3-5 sentences with clear professional tone.",
    category: "Section 3: Customer Service & Behavioral Skills",
    type: "long-text",
    options: null
  },
  {
    text: "A customer contacts you for the fourth time about the same unresolved issue. They are frustrated and feel ignored. How would you handle this interaction from beginning to end?",
    criteria: "Must cover: de-escalation, acknowledging repeated frustration, taking personal ownership, detailed investigation, explaining clear next steps, and follow-through. Answer in 3-5 sentences.",
    category: "Section 3: Customer Service & Behavioral Skills",
    type: "long-text",
    options: null
  },
  // SECTION 4: BPO Readiness & Work Ethic
  {
    text: "BPO technical support roles often operate 24 hours a day across rotating shifts. Non-technical BPO roles typically operate on a standard 40-hour work week. Which statement BEST reflects your understanding of BPO work?",
    criteria: "Correct: B (BPO roles involve structured performance metrics, shift accountability, and consistent professional standards regardless of hours worked)",
    category: "Section 4: BPO Readiness & Work Ethic",
    type: "multiple-choice",
    options: [
      "BPO work is a standard 9-to-5 job with predictable hours and minimal customer interaction",
      "BPO roles involve structured performance metrics, shift accountability, and consistent professional standards regardless of hours worked",
      "BPO work is casual and flexible — agents can choose when to log in and how long to stay on calls",
      "Performance in BPO is measured only by the number of calls completed per day"
    ]
  },
  {
    text: "You are scheduled for a shift but face an unexpected personal emergency the morning of. What is the MOST responsible action?",
    criteria: "Correct: B (Contact your supervisor as early as possible, explain the situation professionally, and follow your company's absence notification policy)",
    category: "Section 4: BPO Readiness & Work Ethic",
    type: "multiple-choice",
    options: [
      "Simply not show up — your personal life comes first",
      "Contact your supervisor as early as possible, explain the situation professionally, and follow your company's absence notification policy",
      "Send a text message to a colleague and ask them to cover without informing your supervisor",
      "Come in late without notifying anyone and explain afterward"
    ]
  },
  {
    text: "BPO work often involves handling repetitive tasks — answering similar calls, filling out the same forms, and following the same scripts daily. How do you BEST stay focused and motivated in this environment?",
    criteria: "Correct: A (Focus on the variety within each customer interaction and personal performance goals to maintain engagement)",
    category: "Section 4: BPO Readiness & Work Ethic",
    type: "multiple-choice",
    options: [
      "Focus on the variety within each customer interaction and personal performance goals to maintain engagement",
      "Remind yourself it is temporary and look for other jobs in your spare time",
      "Automate as much of the work as possible to reduce mental effort",
      "Rely on your team members to keep you motivated when you feel disengaged"
    ]
  },
  {
    text: "What does it mean to be 'KPI-driven' in a BPO environment?",
    criteria: "Correct: B (Understanding and actively working toward measurable performance targets such as AHT, FCR, CSAT, and attendance)",
    category: "Section 4: BPO Readiness & Work Ethic",
    type: "multiple-choice",
    options: [
      "Being focused on completing tasks as quickly as possible regardless of quality",
      "Understanding and actively working toward measurable performance targets such as AHT, FCR, CSAT, and attendance",
      "Relying on your manager to track your performance for you",
      "Only focusing on metrics during formal reviews or evaluations"
    ]
  },
  {
    text: "Which of the following behaviors BEST demonstrates a strong BPO work ethic?",
    criteria: "Correct: B (Consistently meeting KPIs, communicating proactively with your team, maintaining professionalism, and seeking continuous improvement)",
    category: "Section 4: BPO Readiness & Work Ethic",
    type: "multiple-choice",
    options: [
      "Arriving exactly on time, doing the minimum required, and leaving promptly at the end of shift",
      "Consistently meeting KPIs, communicating proactively with your team, maintaining professionalism, and seeking continuous improvement",
      "Focusing exclusively on your individual metrics without regard for team performance",
      "Being popular with colleagues and well-liked by customers regardless of performance data"
    ]
  },
  // SECTION 5: Technology & Digital Proficiency
  {
    text: "What computer applications or tools are MOST commonly used in a BPO environment?",
    criteria: "Correct: B (Email clients, web browsers, CRM systems, Microsoft Office or Google Suite, and telephony platforms)",
    category: "Section 5: Technology & Digital Proficiency",
    type: "multiple-choice",
    options: [
      "Gaming platforms, design software, and video editing tools",
      "Email clients, web browsers, CRM systems, Microsoft Office or Google Suite, and telephony platforms",
      "Social media management tools and content scheduling platforms",
      "Accounting software and enterprise resource planning (ERP) systems"
    ]
  },
  {
    text: "A BPO agent must often listen to a customer, type notes in the CRM, and navigate multiple screens simultaneously. Which statement BEST describes this requirement?",
    criteria: "Correct: B (This is a core BPO competency — agents are expected to multitask efficiently from day one with proper training)",
    category: "Section 5: Technology & Digital Proficiency",
    type: "multiple-choice",
    options: [
      "This is an advanced skill that only senior agents are expected to perform",
      "This is a core BPO competency — agents are expected to multitask efficiently from day one with proper training",
      "This only applies to agents in technical support roles",
      "Agents should choose one task to focus on and complete the others after the call ends"
    ]
  },
  {
    text: "You are on a call and your CRM system freezes. You cannot access the customer's account. What should you do?",
    criteria: "Correct: B (Apologize to the customer, explain you are experiencing a brief technical issue, ask them to hold briefly, notify IT, and document the issue)",
    category: "Section 5: Technology & Digital Proficiency",
    type: "multiple-choice",
    options: [
      "End the call and tell the customer to call back when systems are working",
      "Apologize to the customer, explain you are experiencing a brief technical issue, ask them to hold briefly, notify IT, and document the issue",
      "Continue the call without the CRM and try to remember the details afterward",
      "Transfer the call immediately without explanation"
    ]
  },
  {
    text: "My current level with Microsoft Office Suite (Word, Excel, Outlook) is:",
    criteria: "Completion question. Collects student's self-assessed proficiency. Any choice is awarded full completion marks.",
    category: "Section 5: Technology & Digital Proficiency",
    type: "multiple-choice",
    options: [
      "I have never used it",
      "I can open and read files but struggle with basic tasks",
      "I can complete standard tasks (emails, spreadsheets, documents) independently",
      "I use advanced features regularly and could train others on basic use"
    ]
  },
  {
    text: "My experience with CRM software (Salesforce, Zoho, HubSpot, or similar) is:",
    criteria: "Completion question. Collects student's self-assessed CRM experience. Any choice is awarded full completion marks.",
    category: "Section 5: Technology & Digital Proficiency",
    type: "multiple-choice",
    options: [
      "No experience — I have never used a CRM",
      "I have been introduced to a CRM but need guidance to navigate it",
      "I can log calls, update records, and search accounts independently",
      "I am proficient and comfortable training others on CRM basics"
    ]
  },
  {
    text: "My ability to type accurately while listening and speaking during a live interaction is:",
    criteria: "Completion question. Collects student's self-assessed multitasking typing ability. Any choice is awarded full completion marks.",
    category: "Section 5: Technology & Digital Proficiency",
    type: "multiple-choice",
    options: [
      "I type slowly and make frequent errors that require correction",
      "I can type at a moderate pace with occasional errors",
      "I can document in real time during a call with reasonable accuracy",
      "I type quickly and accurately with very few errors even under pressure"
    ]
  },
  // SECTION 6: Availability & Shift Flexibility
  {
    text: "Which of the following BEST describes your current availability to work?",
    criteria: "Completion question. Used for shift assignment matching. Any choice is awarded full completion marks.",
    category: "Section 6: Availability & Shift Flexibility",
    type: "multiple-choice",
    options: [
      "Weekdays only, standard daytime hours (8am–5pm)",
      "Flexible — I am available for any shift including evenings, nights, and weekends",
      "Evenings and weekends only",
      "Part-time only — fewer than 30 hours per week"
    ]
  },
  {
    text: "SBTS BPO operations may require night shifts, rotating schedules, or weekend availability depending on the client. How do you feel about this?",
    criteria: "Completion question. Used for operational flexibility alignment. Any choice is awarded full completion marks.",
    category: "Section 6: Availability & Shift Flexibility",
    type: "multiple-choice",
    options: [
      "I am fully open to any shift and understand this is part of BPO work",
      "I prefer daytime hours but can occasionally work evenings",
      "I am not available for night shifts or weekends under any circumstances",
      "I have not thought about shift flexibility yet"
    ]
  },
  {
    text: "If you are offered a full-time BPO position requiring 40 hours per week with a rotating schedule, which statement BEST reflects your situation?",
    criteria: "Completion question. Checks full-time commitment. Any choice is awarded full completion marks.",
    category: "Section 6: Availability & Shift Flexibility",
    type: "multiple-choice",
    options: [
      "I am fully committed and can start immediately with no scheduling conflicts",
      "I can commit but may need 2–4 weeks to arrange personal obligations",
      "I am interested but cannot commit to full-time hours at this time",
      "I am only interested in part-time or freelance arrangements"
    ]
  },
  {
    text: "Technical BPO support roles at SBTS operate 24 hours a day. If assigned to an overnight shift (e.g., 10pm–6am), how would you prepare?",
    criteria: "Completion question. Checks overnight preparedness. Any choice is awarded full completion marks.",
    category: "Section 6: Availability & Shift Flexibility",
    type: "multiple-choice",
    options: [
      "Adjust my sleep schedule in advance, ensure a quiet work environment, and treat it with the same professionalism as a daytime shift",
      "It would be difficult — I rely on natural energy and do not perform well at night",
      "I would request a shift change immediately after starting",
      "I would not accept an overnight assignment under any circumstances"
    ]
  },
  // SECTION 8: Professionalism, Ethics & Compliance
  {
    text: "It is acceptable to share a customer's account information with a third party if the customer seems to give verbal permission during a call.",
    criteria: "Correct: False (Ethics/confidentiality protocol strictly forbids sharing customer details with third parties without formal verified authorization)",
    category: "Section 8: Professionalism, Ethics & Compliance",
    type: "true-false",
    options: ["True", "False"]
  },
  {
    text: "GDPR and similar data privacy laws apply to BPO companies that handle customer data on behalf of clients.",
    criteria: "Correct: True (BPOs are considered data processors and must comply with relevant data privacy frameworks)",
    category: "Section 8: Professionalism, Ethics & Compliance",
    type: "true-false",
    options: ["True", "False"]
  },
  {
    text: "If a supervisor is unavailable, an agent is permitted to make unauthorized exceptions to company policy to resolve a customer's issue.",
    criteria: "Correct: False (Policy exceptions must follow proper delegation and escalation procedures even if supervisors are busy)",
    category: "Section 8: Professionalism, Ethics & Compliance",
    type: "true-false",
    options: ["True", "False"]
  },
  {
    text: "Maintaining a professional appearance and attitude — even when working remotely — is part of a BPO agent's responsibilities.",
    criteria: "Correct: True (Professionalism standards, dress codes, and background noise management apply to remote work environments)",
    category: "Section 8: Professionalism, Ethics & Compliance",
    type: "true-false",
    options: ["True", "False"]
  },
  {
    text: "Call recordings in a BPO environment are primarily used for quality monitoring and coaching, not to penalize employees without cause.",
    criteria: "Correct: True (Recordings support quality assurance audits, compliance standards, and continuous skill coaching)",
    category: "Section 8: Professionalism, Ethics & Compliance",
    type: "true-false",
    options: ["True", "False"]
  },
  {
    text: "A colleague asks you to clock them in because they are running late. What should you do?",
    criteria: "Correct: B (Decline and remind them to contact their supervisor directly about the late arrival)",
    category: "Section 8: Professionalism, Ethics & Compliance",
    type: "multiple-choice",
    options: [
      "Clock them in as a favor — it is not a big deal",
      "Decline and remind them to contact their supervisor directly about the late arrival",
      "Clock them in but tell them they owe you a favor",
      "Report them to HR immediately without saying anything to them first"
    ]
  },
  {
    text: "Which of the following BEST describes appropriate professional conduct during a contentious customer interaction?",
    criteria: "Correct: B (Maintain a neutral, calm tone, avoid interrupting, follow escalation protocol, and document the interaction accurately)",
    category: "Section 8: Professionalism, Ethics & Compliance",
    type: "multiple-choice",
    options: [
      "Match the customer's emotional intensity to show engagement",
      "Maintain a neutral, calm tone, avoid interrupting, follow escalation protocol, and document the interaction accurately",
      "End the call quickly to protect your AHT metric",
      "Agree with the customer to de-escalate, even if it means making promises you cannot keep"
    ]
  },
  {
    text: "You are assigned a workplace policy you personally disagree with. What is the MOST professional response?",
    criteria: "Correct: B (Follow the policy while raising your concern through the appropriate internal channel)",
    category: "Section 8: Professionalism, Ethics & Compliance",
    type: "multiple-choice",
    options: [
      "Refuse to follow it and explain your reasoning to customers",
      "Follow the policy while raising your concern through the appropriate internal channel",
      "Ignore the policy when no one is watching",
      "Convince your teammates to disregard it as well"
    ]
  },
  {
    text: "Why is confidentiality important when handling customer data in a BPO setting? Give one specific example of what a data breach could look like in a call center environment.",
    criteria: "Written response on security/privacy. Check for: 1. Understanding of data protection (confidentiality, trust, identity theft risk). 2. A realistic example (e.g., writing down card numbers, discussing client credentials with outsiders, exposing screens). Complete sentences, professional tone.",
    category: "Section 8: Professionalism, Ethics & Compliance",
    type: "long-text",
    options: null
  },
  {
    text: "Have you ever had to follow a rule or policy you disagreed with at work, in training, or at school? Describe the situation and how you handled it professionally.",
    criteria: "Written response on professional compliance. Evaluate: 1. Maturity and professional restraint. 2. Following standard escalation channels. 3. Execution of the policy despite personal disagreement. Check grammar and complete sentences.",
    category: "Section 8: Professionalism, Ethics & Compliance",
    type: "long-text",
    options: null
  },
  // SECTION 7: Written Role-Play Simulation
  {
    text: "SCENARIO A (Technical Support Simulation):\nYou receive a call from a customer who says: 'I've been without internet for two days and no one has helped me. I've called three times already and I'm done being patient. I need this fixed NOW!'\nWrite your complete response as the support agent — from your opening greeting through to your closing statement. Include how you greet the customer, how you acknowledge their frustration, what clarifying questions you ask, and how you close the call professionally.",
    criteria: "Role-Play written simulation. Grade out of 10 points. Check for: 1. Professional opening greeting (e.g., 'Thank you for calling Technical Support, my name is...'). 2. Empathetic acknowledgment of the 2-day outage and frustration. 3. Taking ownership (avoiding blaming internal teams). 4. Clear troubleshooting path/clarifying questions. 5. Reassuring closing statement.",
    category: "Section 7: Written Role-Play Simulation",
    type: "long-text",
    options: null
  },
  {
    text: "SCENARIO B (Billing Support Simulation):\nA customer calls and says: 'I was charged twice for the same service this month. I've already emailed support and nobody got back to me. I want my money back today.'\nWrite your complete response as the support agent — from greeting to closing. Address the customer's frustration, gather the information you need, explain what steps you are taking, and close the call professionally.",
    criteria: "Role-Play written simulation. Grade out of 10 points. Check for: 1. Warm greeting and empathy statement regarding the billing error. 2. Apology for the delayed email response. 3. Specific information gathering (account ID, invoice number). 4. Clear explanation of refund/dispute process. 5. Reassuring professional closing.",
    category: "Section 7: Written Role-Play Simulation",
    type: "long-text",
    options: null
  },
  // SECTION 9: Role Readiness & Career Goals
  {
    text: "Which BPO role do you feel MOST prepared to step into immediately after completing your SBTS training?",
    criteria: "Diagnostic placement matching question. No correct/incorrect response, evaluated for placement direction. Full completion marks awarded.",
    category: "Section 9: Role Readiness & Career Goals",
    type: "multiple-choice",
    options: [
      "Inbound Customer Service Agent",
      "Outbound Sales / Telemarketing Agent",
      "Technical Support Agent",
      "Quality Assurance (QA) Analyst"
    ]
  },
  {
    text: "What is your PRIMARY motivation for pursuing a BPO career role at this time?",
    criteria: "Diagnostic motivation matching. Evaluates candidate career maturity (long-term vs short-term outlook). Full completion marks awarded.",
    category: "Section 9: Role Readiness & Career Goals",
    type: "multiple-choice",
    options: [
      "It is the only available option in my area",
      "I want to build a long-term career in BPO operations and grow into a leadership role",
      "I need income temporarily while I pursue other goals",
      "I was placed here by my training program without a personal preference"
    ]
  },
  {
    text: "Where do you see yourself within the BPO industry in the next 12–24 months?",
    criteria: "Diagnostic ambition alignment. Assesses career advancement focus. Full completion marks awarded.",
    category: "Section 9: Role Readiness & Career Goals",
    type: "multiple-choice",
    options: [
      "In the same entry-level role, focused on stability",
      "Promoted to Senior Agent, Team Lead, or QA Analyst with expanded responsibilities",
      "Transitioning out of BPO to a different field entirely",
      "I have not thought about it yet"
    ]
  },
  {
    text: "Which of the following questions would be MOST appropriate to ask an assessor or placement coordinator at the end of this process?",
    criteria: "Correct: B ('What does success look like in the first 90 days for someone placed in this role?')",
    category: "Section 9: Role Readiness & Career Goals",
    type: "multiple-choice",
    options: [
      "'How many days off do I get per month?'",
      "'What does success look like in the first 90 days for someone placed in this role?'",
      "'Is the pay negotiable before I've even started?'",
      "'Can I work from home instead of coming in?'"
    ]
  },
  {
    text: "Rank the BPO role types based on which you feel MOST prepared for right now.",
    criteria: "Ranking completion matching. Any ranking response awards full marks.",
    category: "Section 9: Role Readiness & Career Goals",
    type: "ranking",
    options: [
      "Inbound Customer Service Agent",
      "Outbound Sales / Telemarketing Agent",
      "Technical Support Agent",
      "Quality Assurance (QA) Analyst",
      "Team Lead / Senior Agent"
    ]
  },
  {
    text: "Rank the following schedule types in order of your preference, where 1 = most preferred and 3 = least preferred.",
    criteria: "Ranking completion matching. Any ranking response awards full marks.",
    category: "Section 9: Role Readiness & Career Goals",
    type: "ranking",
    options: [
      "Full-time day schedule",
      "Full-time night schedule",
      "Flexible / rotational shift schedule"
    ]
  },
  {
    text: "What motivated you to complete the SBTS BPO training program, and what do you hope to achieve in your first 90 days in a BPO role?",
    criteria: "Short answer placement evaluation. Review for: 1. Personal motivation and alignment with training goals. 2. Clear objectives for the 90-day onboarding period (e.g. learning tools, meeting KPIs, team integration). Complete sentences, clear grammar.",
    category: "Section 9: Role Readiness & Career Goals",
    type: "long-text",
    options: null
  },
  {
    text: "What do you consider your top two professional strengths that would make you a strong BPO agent or team member? Briefly explain each.",
    criteria: "Short answer strengths evaluation. Check for: 1. Relevancy to BPO success (communication, empathy, resilience, multitasking, typing, etc.). 2. Concrete explanation for each strength. Grammar and sentence structure.",
    category: "Section 9: Role Readiness & Career Goals",
    type: "long-text",
    options: null
  },
  {
    text: "Is there anything about your training experience, background, language skills, or personal strengths you would like us to know that was not captured elsewhere in this assessment?",
    criteria: "Additional context. Diagnostic question. Any response or none (provided it's grammatically correct if written) is acceptable.",
    category: "Section 9: Role Readiness & Career Goals",
    type: "long-text",
    options: null
  },
  {
    text: "Read the following customer service statement aloud. Focus on clear pronunciation, natural pacing, and a neutral, friendly tone:\n\n\"Thank you for calling customer support. My name is Jordan. I understand how frustrating it can be when your service is interrupted, and I will do everything I can to get this resolved for you quickly.\"",
    criteria: "Read aloud test. Compare the candidate's spoken transcription against the target script. Assess pronunciation clarity, missing words, and overall tone neutrality.",
    category: "Section 10: Verbal English & Accent Placement",
    type: "accent",
    options: null
  },
  {
    text: "Read the following technical support statement aloud. Ensure you pronounce all technical terms clearly and maintain a professional customer service pace:\n\n\"To troubleshoot your connection, please try restarting both your modem and your router. Unplug their power cables, wait for thirty seconds, and then plug them back in. Once the lights stabilize, please let me know if your internet connection is restored.\"",
    criteria: "Read aloud test. Compare the spoken text with the target script. Look for clear articulation of technical terms (modem, router, troubleshoot) and steady, professional pace.",
    category: "Section 10: Verbal English & Accent Placement",
    type: "accent",
    options: null
  },
  {
    text: "Read the following statement aloud. Focus on clear pronunciation, warm tone, and natural phrasing:\n\n\"Hello, thank you for reaching out to us today. My name is Sarah. I would be happy to assist you with updating your account information and setting up your billing preferences. May I please have your full name and account number to get started?\"",
    criteria: "Read aloud test. Compare spoken response with target script. Check for proper intonation of friendly greeting and questions.",
    category: "Section 10: Verbal English & Accent Placement",
    type: "accent",
    options: null
  },
  {
    text: "Read the following statement aloud. Articulate the words clearly and maintain a professional, empathetic customer service tone:\n\n\"I apologize for the inconvenience you have experienced with our shipping delivery delays. Our logistics team is working hard to deliver your package by tomorrow afternoon. I will send a confirmation email with a new tracking link right away.\"",
    criteria: "Read aloud test. Assess pronunciation accuracy, pace, and BPO agent customer empathy traits.",
    category: "Section 10: Verbal English & Accent Placement",
    type: "accent",
    options: null
  },
  {
    text: "Read the following troubleshooting instructions aloud. Pronounce technical terms and instructions clearly:\n\n\"To update your account password, click on the profile icon in the top right corner of the website dashboard. Select Account Settings, then security. Enter your new password and click Save Changes. Please let me know if you need help with this.\"",
    criteria: "Read aloud test. Evaluate articulation of directions and clarity of technical terms.",
    category: "Section 10: Verbal English & Accent Placement",
    type: "accent",
    options: null
  },
  {
    text: "Read the following statement aloud. Maintain steady breathing and professional delivery:\n\n\"Thank you for calling. I appreciate your patience during this high volume period. I can certainly confirm that your payment has been successfully processed and your subscription is active. Is there anything else I can assist you with today?\"",
    criteria: "Read aloud test. Assess delivery pace, clarity of keywords (processed, subscription), and customer service presence.",
    category: "Section 10: Verbal English & Accent Placement",
    type: "accent",
    options: null
  },
  {
    text: "Read the following statement aloud. Maintain a professional, reassuring tone:\n\n\"We understand how important this service is for your daily BPO operations. Our engineering team is currently investigating the server downtime, and we expect all services to be fully online within the next hour. Thank you for your cooperation.\"",
    criteria: "Read aloud test. Look for reassurance traits, clarity of technical recovery updates, and professional pacing.",
    category: "Section 10: Verbal English & Accent Placement",
    type: "accent",
    options: null
  },
  {
    text: "Read the following scheduling choices script aloud. Pronounce time slots and days of the week clearly:\n\n\"I can absolutely help you schedule a follow-up appointment with our technical team. They are available on Monday morning at nine o'clock or Wednesday afternoon at three o'clock. Which of those times would work best for your schedule?\"",
    criteria: "Read aloud test. Verify clear pronunciation of days, times, and friendly schedule coordination phrasing.",
    category: "Section 10: Verbal English & Accent Placement",
    type: "accent",
    options: null
  },
  {
    text: "Read the following security instructions script aloud. Ensure you sound clear and authoritative yet helpful:\n\n\"Please make sure you have your account username and registration details ready before calling our customer care line. This will help our support agents verify your identity quickly and keep your account details secure.\"",
    criteria: "Read aloud test. Evaluate candidate pronunciation speed, key terms articulation, and helpful security tone.",
    category: "Section 10: Verbal English & Accent Placement",
    type: "accent",
    options: null
  },
  {
    text: "Read the following feedback acknowledgement script aloud. Maintain a professional customer experience tone:\n\n\"Thank you for your feedback regarding our training program curriculum. We are constantly updating our courses to provide the best possible learning experience for our students. Your comments have been shared with our administration team.\"",
    criteria: "Read aloud test. Grade reading accuracy against target script, professional gratitude tone, and pacing consistency.",
    category: "Section 10: Verbal English & Accent Placement",
    type: "accent",
    options: null
  }
];

function seed() {
  console.log('Clearing existing AI questions...');
  db.prepare('DELETE FROM ai_questions').run();

  console.log('Seeding BPO Unified Assessment questions...');
  const insert = db.prepare(`
    INSERT INTO ai_questions (id, text, criteria, category, type, options, is_published)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  let insertedCount = 0;
  const transaction = db.transaction((qs) => {
    for (const q of qs) {
      const optionsJson = q.options ? JSON.stringify(q.options) : null;
      insert.run(uuidv4(), q.text, q.criteria, q.category, q.type, optionsJson);
      insertedCount++;
    }
  });

  transaction(questions);

  console.log(`Seed completed. Inserted ${insertedCount} questions.`);
  const finalCount = (db.prepare('SELECT COUNT(*) as count FROM ai_questions').get() as any).count;
  console.log(`Total questions in database: ${finalCount}`);
  db.close();
}

try {
  seed();
} catch (error) {
  console.error('Seed failed:', error);
  process.exit(1);
}
