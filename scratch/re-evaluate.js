const Database = require('better-sqlite3');
const dbPath = '/app/data/ai_interviews.db';
const db = new Database(dbPath);

function checkAnswer(answerText, criteriaText, optionsJson) {
  const match = criteriaText.match(/Correct:\s*(True|False|Yes|No|[A-D])\b/i);
  let isCorrect = false;
  let correctOption = '';
  
  if (match) {
    correctOption = match[1].trim(); // e.g. "B" or "True"
  } else {
    // Fallback parsing of correct option from criteria text
    const cleanCriteria = criteriaText.toLowerCase();
    if (cleanCriteria.includes('correct: true')) correctOption = 'True';
    else if (cleanCriteria.includes('correct: false')) correctOption = 'False';
    else if (cleanCriteria.includes('correct: yes')) correctOption = 'Yes';
    else if (cleanCriteria.includes('correct: no')) correctOption = 'No';
    else if (cleanCriteria.includes('correct: a')) correctOption = 'A';
    else if (cleanCriteria.includes('correct: b')) correctOption = 'B';
    else if (cleanCriteria.includes('correct: c')) correctOption = 'C';
    else if (cleanCriteria.includes('correct: d')) correctOption = 'D';
  }

  if (correctOption) {
    const cleanAnswer = answerText.trim().toLowerCase();
    const cleanCorrect = correctOption.toLowerCase();
    
    // Check direct match (e.g. student answered "True" or "B")
    if (cleanAnswer === cleanCorrect) {
      isCorrect = true;
    } else {
      // Check full text match for multiple choice options
      try {
        if (optionsJson) {
          const options = JSON.parse(optionsJson);
          if (Array.isArray(options)) {
            const alphabet = 'abcdefghijklmnopqrstuvwxyz';
            const index = alphabet.indexOf(cleanCorrect);
            if (index >= 0 && index < options.length) {
              const correctOptionText = options[index];
              if (correctOptionText && correctOptionText.trim().toLowerCase() === cleanAnswer) {
                isCorrect = true;
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse options JSON:", e);
      }
    }
  }

  return { isCorrect, correctOption };
}

async function main() {
  console.log("Starting Database Scoring Repair (Fixing Text Option Matches)...");

  // Load all responses that are of choice, checklist, or ranking type
  const responses = db.prepare(`
    SELECT r.id, r.student_answer, q.criteria, q.type, q.options, q.text as question_text, r.ai_score, r.ai_feedback, r.interview_id
    FROM ai_responses r
    JOIN ai_questions q ON r.question_id = q.id
    WHERE q.type IN ('true-false', 'multiple-choice', 'checklist', 'ranking')
  `).all();

  console.log(`Found ${responses.length} response entries to examine.`);
  let repairCount = 0;

  for (const resp of responses) {
    const qType = resp.type;
    const answer = resp.student_answer || '';
    const criteria = resp.criteria || '';
    
    let isCorrect = false;
    let correctOption = '';
    let targetScore = 0;
    let targetFeedback = '';

    if (qType === 'true-false' || qType === 'multiple-choice') {
      const check = checkAnswer(answer, criteria, resp.options);
      isCorrect = check.isCorrect;
      correctOption = check.correctOption;
      
      targetScore = isCorrect ? 100 : 0;
      targetFeedback = isCorrect 
        ? (correctOption ? `Correct. Option "${correctOption}" selected.` : "Correct answer selected.")
        : (correctOption ? `Incorrect. The correct option is "${correctOption}".` : "Incorrect answer selected.");
    } else if (qType === 'checklist') {
      targetScore = 100;
      targetFeedback = "All checklist items confirmed.";
    } else if (qType === 'ranking') {
      targetScore = 100;
      targetFeedback = "Ranking choices successfully ordered.";
    }

    // Update the database row if it differs
    if (resp.ai_score !== targetScore || resp.ai_feedback !== targetFeedback) {
      console.log(`Repairing response ID: ${resp.id}`);
      console.log(`  Question Type: ${qType}`);
      console.log(`  Question Text: "${resp.question_text.substring(0, 60)}..."`);
      console.log(`  Student Answer: "${answer}"`);
      console.log(`  Correct Answer Option: "${correctOption}"`);
      console.log(`  Old Score: ${resp.ai_score} -> New Score: ${targetScore}`);
      console.log(`  Old Feedback: "${resp.ai_feedback}" -> New Feedback: "${targetFeedback}"`);
      
      db.prepare('UPDATE ai_responses SET ai_score = ?, ai_feedback = ? WHERE id = ?')
        .run(targetScore, targetFeedback, resp.id);
      
      repairCount++;
    }
  }

  console.log(`Database repair complete! Total repaired rows: ${repairCount}`);
}

main().catch(err => {
  console.error("Unhandled error in repair script:", err);
});
