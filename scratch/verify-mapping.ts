import { PROGRAM_NAME_MAP } from '../backend/src/students/students.service';

console.log('Testing PROGRAM_NAME_MAP mapping values:');
for (const [id, name] of Object.entries(PROGRAM_NAME_MAP)) {
  console.log(`ID ${id} -> ${name}`);
}

const mockSelectedProgram = 4;
const trackName = PROGRAM_NAME_MAP[Number(mockSelectedProgram)] || `Program ${mockSelectedProgram}`;
console.log(`Mock Resolution Test: ID ${mockSelectedProgram} resolved to -> "${trackName}"`);

if (trackName === 'Business Process & Operations (BP Series)') {
  console.log('Verification Success!');
} else {
  console.log('Verification Failed!');
  process.exit(1);
}
