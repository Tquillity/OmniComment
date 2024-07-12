// puzzleGenerator.js
const puzzles = [
  { question: "1 + 1 = ?", answer: "2" },
  { question: "2 x 4 = ?", answer: "8" },
  { question: "10 - 3 = ?", answer: "7" },
  { question: "15 / 3 = ?", answer: "5" },
  { question: "2^3 = ?", answer: "8" },
  { question: "√9 = ?", answer: "3" },
  { question: "5 + 7 = ?", answer: "12" },
  { question: "20 - 8 = ?", answer: "12" },
  { question: "4 x 6 = ?", answer: "24" },
  { question: "18 / 2 = ?", answer: "9" }
];

export function getRandomPuzzle() {
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

export function checkPuzzleAnswer(question, userAnswer) {
  const puzzle = puzzles.find(p => p.question === question);
  return puzzle && puzzle.answer === userAnswer;
}