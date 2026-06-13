const Database = require('better-sqlite3');
const OpenAI = require('openai');

const dbPath = '/app/data/ai_interviews.db';
const db = new Database(dbPath);

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY environment variable is missing inside the container!");
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function main() {
  console.log("Starting re-evaluation...");
  
  // Find all responses that failed AI evaluation (i.e. score is 0 and feedback is the failure message)
  const failedResponses = db.prepare(`
    SELECT r.id, r.student_answer, q.criteria, q.text as question_text
    FROM ai_responses r
    JOIN ai_questions q ON r.question_id = q.id
    WHERE r.ai_feedback = 'Evaluation failed due to an AI error.'
  `).all();
  
  console.log(`Found ${failedResponses.length} responses to re-evaluate.`);
  
  for (const resp of failedResponses) {
    console.log(`Evaluating answer for response ID: ${resp.id}`);
    console.log(`Question: ${resp.question_text}`);
    console.log(`Answer: ${resp.student_answer}`);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert interviewer. Evaluate the student's answer based on the provided criteria. Provide a score from 0 to 100 and brief constructive feedback. Return only JSON format: { \"score\": number, \"feedback\": \"string\" }"
          },
          {
            role: "user",
            content: `Criteria: ${resp.criteria}\n\nStudent Answer: ${resp.student_answer}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const result = JSON.parse(content);
      console.log(`Result: score=${result.score}, feedback=${result.feedback}`);
      
      db.prepare('UPDATE ai_responses SET ai_score = ?, ai_feedback = ? WHERE id = ?')
        .run(result.score, result.feedback, resp.id);
        
      console.log(`Updated response ID ${resp.id} successfully.`);
    } catch (error) {
      console.error(`Failed to evaluate response ID ${resp.id}:`, error.message);
    }
    
    // Brief sleep to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("Re-evaluation completed!");
}

main().catch(err => {
  console.error("Unhandled error in main:", err);
});
