import { gradeObjectiveResponse } from './objective-scoring';
import { gradeWithoutModel } from './response-grading';
import { extractQuotedScript, gradeReadingAccuracy } from './reading-score';
import { scoreInterview } from './interview-score';
import { parseWrittenChecklist, scoreWrittenChecklist } from './written-scoring';

const READINESS_OPTIONS = [
  'Quiet environment',
  'Stable internet',
  'Understand instructions & integrity policy',
  'No AI / translation / sharing tools',
  'Ready to complete all sections',
];
const READINESS_CRITERIA =
  'All items must be confirmed. The student must check all boxes to proceed.';

const SCRIPT =
  'Thank you for calling customer support. My name is Jordan.';
const ACCENT_QUESTION = `Read the following statement aloud:\n\n"${SCRIPT}"`;

describe('objective grading', () => {
  it('awards 100 when the selected choice matches the answer key', () => {
    const result = gradeObjectiveResponse(
      'multiple-choice',
      'Speaking clearly, using the customer\'s name, and confirming understanding before offering a solution',
      'Correct: B (Speaking clearly, using the customer\'s name, and confirming understanding before offering a solution)',
      [
        'Speaking quickly',
        'Speaking clearly, using the customer\'s name, and confirming understanding before offering a solution',
        'Using slang',
        'Ending the call',
      ],
    );
    expect(result?.score).toBe(100);
  });

  it('scores a blank choice as 0', () => {
    const result = gradeObjectiveResponse(
      'true-false',
      'No response (Time expired)',
      'Correct: False',
      ['True', 'False'],
    );
    expect(result).toEqual({ score: 0, feedback: 'No response submitted.' });
  });

  it('awards the readiness checklist only when every option is selected', () => {
    const complete = gradeObjectiveResponse(
      'checklist',
      READINESS_OPTIONS.join(', '),
      READINESS_CRITERIA,
      READINESS_OPTIONS,
    );
    const partial = gradeObjectiveResponse(
      'checklist',
      READINESS_OPTIONS[0],
      READINESS_CRITERIA,
      READINESS_OPTIONS,
    );
    const blank = gradeObjectiveResponse('checklist', '', READINESS_CRITERIA, READINESS_OPTIONS);

    expect(complete?.score).toBe(100);
    expect(partial?.score).toBe(0);
    expect(blank?.score).toBe(0);
  });

  it('scores a checklist with no answer key as 0', () => {
    const result = gradeObjectiveResponse(
      'checklist',
      'Average Handle Time (AHT)',
      'Review the selected items.',
      ['Average Handle Time (AHT)', 'Lunch break duration'],
    );
    expect(result?.score).toBe(0);
  });
});

describe('completion grading', () => {
  it('awards full marks for a submitted ranking and withholds them when blank', () => {
    const submitted = gradeWithoutModel({
      qType: 'ranking',
      answer: 'Technical Support Agent, Inbound Customer Service Agent',
      criteria: 'Ranking completion matching. Any ranking response awards full marks.',
      options: null,
      questionText: 'Rank the roles.',
    });
    const blank = gradeWithoutModel({
      qType: 'ranking',
      answer: '',
      criteria: 'Any ranking response awards full marks.',
      options: null,
      questionText: 'Rank the roles.',
    });

    expect(submitted?.score).toBe(100);
    expect(blank?.score).toBe(0);
  });

  it('treats a completion long-text item as full marks and leaves a normal written item for the model', () => {
    const completion = gradeWithoutModel({
      qType: 'long-text',
      answer: 'I finished the training and want to mention my bilingual calls.',
      criteria:
        'Additional context. Diagnostic question. Any response or none (provided it is grammatically correct if written) is acceptable.',
      options: null,
      questionText: 'Is there anything else we should know?',
    });
    const written = gradeWithoutModel({
      qType: 'long-text',
      answer: 'Customer service means solving the problem with care.',
      criteria: 'Look for empathy, customer satisfaction, active listening, and problem-solving.',
      options: null,
      questionText: 'What does customer service mean to you?',
    });

    expect(completion?.score).toBe(100);
    expect(written).toBeNull();
  });
});

describe('reading accuracy', () => {
  it('extracts the quoted script', () => {
    expect(extractQuotedScript(ACCENT_QUESTION)).toBe(SCRIPT);
  });

  it('scores a full read, a missing word, an empty transcript, and ignores extra words', () => {
    expect(gradeReadingAccuracy(SCRIPT, ACCENT_QUESTION).score).toBe(100);

    const missing = gradeReadingAccuracy(
      'Thank you for customer support. My name is Jordan.',
      ACCENT_QUESTION,
    );
    expect(missing.score).toBe(90);
    expect(missing.feedback).toBe('Reading accuracy: 9 of 10 script words in order.');

    const empty = gradeReadingAccuracy('', ACCENT_QUESTION);
    expect(empty.score).toBe(0);
    expect(empty.feedback).toBe('Reading accuracy: 0 of 10 script words in order.');

    const extra = gradeReadingAccuracy(
      'Thank you so much for calling customer support. My name is Jordan today.',
      ACCENT_QUESTION,
    );
    expect(extra.score).toBe(100);
  });
});

describe('interview totals', () => {
  it('weights objective, written, and reading 40/40/20', () => {
    const breakdown = scoreInterview([
      { type: 'multiple-choice', criteria: 'Correct: B', ai_score: 100 },
      { type: 'true-false', criteria: 'Correct: False', ai_score: 0 },
      { type: 'long-text', criteria: 'Look for empathy.', ai_score: 80 },
      { type: 'accent', criteria: 'Read aloud.', ai_score: 60 },
    ]);

    expect(breakdown).toEqual({
      overall: 64,
      objective: 50,
      written: 80,
      reading: 60,
    });
  });

  it('drops a missing reading bucket and renormalizes', () => {
    const breakdown = scoreInterview([
      { type: 'multiple-choice', criteria: 'Correct: A', ai_score: 50 },
      { type: 'long-text', criteria: 'Look for empathy.', ai_score: 80 },
    ]);

    expect(breakdown.reading).toBeNull();
    expect(breakdown.overall).toBe(65);
  });

  it('skips a null written score', () => {
    const breakdown = scoreInterview([
      { type: 'multiple-choice', criteria: 'Correct: A', ai_score: 100 },
      { type: 'long-text', criteria: 'Look for empathy.', ai_score: null },
      { type: 'long-text', criteria: 'Look for a result.', ai_score: 80 },
      { type: 'accent', criteria: 'Read aloud.', ai_score: 50 },
    ]);

    expect(breakdown.written).toBe(80);
    expect(breakdown.overall).toBe(82);
  });
});

describe('written checklist parser', () => {
  it('scales met points to a 0-100 score', () => {
    const checklist = parseWrittenChecklist({
      points: [
        { label: 'Greeting', met: true },
        { label: 'Empathy', met: true },
        { label: 'Closing', met: false },
        { label: 'Ownership', met: false },
      ],
      feedback: 'The greeting and empathy were present.',
    });

    expect(checklist).not.toBeNull();
    expect(scoreWrittenChecklist(checklist!).score).toBe(50);
  });

  it('rejects a numeric score such as 8 out of 10', () => {
    expect(parseWrittenChecklist({ score: 8, feedback: '8 out of 10' })).toBeNull();
    expect(parseWrittenChecklist({ points: [{ label: 'Greeting', met: 'yes' }] })).toBeNull();
    expect(parseWrittenChecklist({ points: [] })).toBeNull();
  });
});
