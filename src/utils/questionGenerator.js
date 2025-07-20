// Math question generator for treasure boxes

// Generate a math question based on depth level
export const generateMathQuestion = (depthLevel = 0) => {
  const questions = {
    0: [ // Easy questions for depth level 0
      {
        id: 'basic_addition',
        title: 'Basic Addition',
        story: 'A merchant has some coins in his pouch. Help him count the total!',
        hint: 'Use addition blocks to add the numbers together.',
        difficulty: 'Easy',
        num: Math.floor(Math.random() * 20) + 5,
        get answer() { return this.num + Math.floor(Math.random() * 15) + 3; },
        get description() { return `Calculate: ${this.num} + ${this.answer - this.num}`; }
      },
      {
        id: 'basic_subtraction',
        title: 'Basic Subtraction',
        story: 'A farmer had some apples, but some were eaten by birds. How many are left?',
        hint: 'Use subtraction blocks to find the difference.',
        difficulty: 'Easy',
        num: Math.floor(Math.random() * 30) + 15,
        get answer() { return this.num - Math.floor(Math.random() * 10) - 5; },
        get description() { return `Calculate: ${this.num} - ${this.num - this.answer}`; }
      },
      {
        id: 'basic_multiplication',
        title: 'Basic Multiplication',
        story: 'A baker makes bread in batches. How many loaves in total?',
        hint: 'Use multiplication blocks to find the total.',
        difficulty: 'Easy',
        num: Math.floor(Math.random() * 8) + 2,
        get answer() { return this.num * (Math.floor(Math.random() * 6) + 2); },
        get description() { return `Calculate: ${this.num} × ${this.answer / this.num}`; }
      }
    ],
    1: [ // Medium questions for depth level 1
      {
        id: 'pattern_sequence',
        title: 'Number Pattern',
        story: 'Ancient runes follow a mysterious pattern. What comes next?',
        hint: 'Look for the pattern and use loops to generate the sequence.',
        difficulty: 'Medium',
        start: Math.floor(Math.random() * 10) + 1,
        step: Math.floor(Math.random() * 5) + 2,
        get answer() { return this.start + (this.step * 4); },
        get description() { return `Find the 5th number in sequence: ${this.start}, ${this.start + this.step}, ${this.start + this.step * 2}, ${this.start + this.step * 3}, ?`; }
      },
      {
        id: 'factorial_small',
        title: 'Factorial Challenge',
        story: 'A wizard needs to arrange magical items. In how many ways can they be arranged?',
        hint: 'Calculate the factorial using loops.',
        difficulty: 'Medium',
        num: Math.floor(Math.random() * 3) + 4, // 4, 5, or 6
        get answer() { 
          let result = 1;
          for (let i = 1; i <= this.num; i++) {
            result *= i;
          }
          return result;
        },
        get description() { return `Calculate ${this.num}! (${this.num} factorial)`; }
      }
    ],
    2: [ // Hard questions for depth level 2+
      {
        id: 'fibonacci',
        title: 'Fibonacci Sequence',
        story: 'The ancient spiral pattern holds the key to the treasure. Find the nth Fibonacci number.',
        hint: 'Use loops to calculate the Fibonacci sequence.',
        difficulty: 'Hard',
        num: Math.floor(Math.random() * 5) + 8, // 8-12
        get answer() {
          if (this.num <= 1) return this.num;
          let a = 0, b = 1;
          for (let i = 2; i <= this.num; i++) {
            [a, b] = [b, a + b];
          }
          return b;
        },
        get description() { return `Find the ${this.num}th Fibonacci number`; }
      },
      {
        id: 'prime_check',
        title: 'Prime Number Mystery',
        story: 'The lock responds only to prime numbers. Is this number prime?',
        hint: 'Check if the number has any divisors other than 1 and itself.',
        difficulty: 'Hard',
        num: (() => {
          const primes = [17, 19, 23, 29, 31, 37, 41, 43, 47];
          const composites = [15, 21, 25, 27, 33, 35, 39, 45, 49];
          const allNumbers = [...primes, ...composites];
          return allNumbers[Math.floor(Math.random() * allNumbers.length)];
        })(),
        get answer() {
          if (this.num < 2) return 0; // Not prime
          for (let i = 2; i <= Math.sqrt(this.num); i++) {
            if (this.num % i === 0) return 0; // Not prime
          }
          return 1; // Prime
        },
        get description() { return `Is ${this.num} a prime number? Return 1 for yes, 0 for no`; }
      }
    ]
  };

  // Select appropriate difficulty based on depth level
  let questionSet;
  if (depthLevel === 0) {
    questionSet = questions[0];
  } else if (depthLevel === 1) {
    questionSet = questions[1];
  } else {
    questionSet = questions[2];
  }

  // Pick a random question from the set
  const randomIndex = Math.floor(Math.random() * questionSet.length);
  const selectedQuestion = questionSet[randomIndex];

  // Create a fresh instance to avoid reference issues
  const question = {
    id: selectedQuestion.id + '_' + Date.now(),
    title: selectedQuestion.title,
    story: selectedQuestion.story,
    hint: selectedQuestion.hint,
    difficulty: selectedQuestion.difficulty,
    num: selectedQuestion.num,
    start: selectedQuestion.start,
    step: selectedQuestion.step,
    answer: selectedQuestion.answer,
    description: selectedQuestion.description
  };

  return question;
};

// Generate a specific type of question
export const generateQuestionByType = (type, difficulty = 'Easy') => {
  // Implementation for specific question types if needed
  return generateMathQuestion(difficulty === 'Easy' ? 0 : difficulty === 'Medium' ? 1 : 2);
};