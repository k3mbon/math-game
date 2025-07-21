// Math question generator for treasure boxes with enhanced difficulty progression

// Generate a math question based on depth level with improved scaling
export const generateMathQuestion = (depthLevel = 0) => {
  // Enhanced difficulty scaling - more levels and smoother progression
  const difficultyLevel = Math.min(Math.floor(depthLevel / 2), 4); // 5 difficulty levels (0-4)
  
  const questions = {
    0: [ // Very Easy questions for depth level 0-1
      {
        id: 'basic_addition',
        title: 'Basic Addition',
        story: 'A merchant has some coins in his pouch. Help him count the total!',
        hint: 'Use addition blocks to add the numbers together.',
        difficulty: 'Easy',
        num: Math.floor(Math.random() * 10) + 1,
        get answer() { return this.num + Math.floor(Math.random() * 10) + 1; },
        get description() { return `🧮 Calculate: ${this.num} + ${this.answer - this.num}`; }
      },
      {
        id: 'basic_subtraction',
        title: 'Basic Subtraction',
        story: 'A farmer had some apples, but some were eaten by birds. How many are left?',
        hint: 'Use subtraction blocks to find the difference.',
        difficulty: 'Easy',
        num: Math.floor(Math.random() * 15) + 10,
        get answer() { return this.num - Math.floor(Math.random() * 8) - 2; },
        get description() { return `🍎 Calculate: ${this.num} - ${this.num - this.answer}`; }
      },
      {
        id: 'basic_multiplication',
        title: 'Basic Multiplication',
        story: 'A baker makes bread in batches. How many loaves in total?',
        hint: 'Use multiplication blocks to find the total.',
        difficulty: 'Easy',
        num: Math.floor(Math.random() * 5) + 2,
        get answer() { return this.num * (Math.floor(Math.random() * 4) + 2); },
        get description() { return `🍞 Calculate: ${this.num} × ${this.answer / this.num}`; }
      }
    ],
    1: [ // Easy-Medium questions for depth level 2-3
      {
        id: 'counting_skip',
        title: '🐸 Skip Counting',
        story: 'Help the frog hop across lily pads by counting in steps!',
        hint: 'Count by the same number each time.',
        difficulty: 'Easy-Medium',
        start: Math.floor(Math.random() * 5) + 1,
        step: Math.floor(Math.random() * 3) + 2,
        get answer() { return this.start + (this.step * 3); },
        get description() { return `🐸 Continue the pattern: ${this.start}, ${this.start + this.step}, ${this.start + this.step * 2}, ?`; }
      },
      {
        id: 'simple_division',
        title: '🍕 Pizza Sharing',
        story: 'Share pizza slices equally among friends!',
        hint: 'Divide the total by the number of friends.',
        difficulty: 'Easy-Medium',
        num: (() => {
          const divisors = [2, 3, 4, 5];
          const divisor = divisors[Math.floor(Math.random() * divisors.length)];
          const quotient = Math.floor(Math.random() * 8) + 2;
          return { total: divisor * quotient, friends: divisor, answer: quotient };
        })(),
        get answer() { return this.num.answer; },
        get description() { return `🍕 Share ${this.num.total} pizza slices among ${this.num.friends} friends. How many slices each?`; }
      },
      {
        id: 'pattern_sequence',
        title: '✨ Magic Number Pattern',
        story: 'The magical crystals follow a special pattern. What comes next?',
        hint: 'Look for the pattern and use loops to generate the sequence.',
        difficulty: 'Easy-Medium',
        start: Math.floor(Math.random() * 8) + 1,
        step: Math.floor(Math.random() * 4) + 2,
        get answer() { return this.start + (this.step * 4); },
        get description() { return `✨ Find the 5th number: ${this.start}, ${this.start + this.step}, ${this.start + this.step * 2}, ${this.start + this.step * 3}, ?`; }
      }
    ],
    2: [ // Medium questions for depth level 4-5
      {
        id: 'two_step_problems',
        title: '🎪 Carnival Math',
        story: 'At the carnival, solve this two-step puzzle to win a prize!',
        hint: 'Break the problem into two steps.',
        difficulty: 'Medium',
        num: (() => {
          const step1 = Math.floor(Math.random() * 15) + 5;
          const step2 = Math.floor(Math.random() * 10) + 3;
          return { first: step1, second: step2, total: step1 + step2 };
        })(),
        get answer() { return this.num.total * 2; },
        get description() { return `🎪 You have ${this.num.first} tickets, win ${this.num.second} more, then double your total. How many tickets now?`; }
      },
      {
        id: 'factorial_small',
        title: '🧙‍♂️ Wizard Arrangements',
        story: 'A wizard needs to arrange magical items. In how many ways can they be arranged?',
        hint: 'Calculate the factorial using loops.',
        difficulty: 'Medium',
        num: Math.floor(Math.random() * 2) + 4, // 4 or 5
        get answer() { 
          let result = 1;
          for (let i = 1; i <= this.num; i++) {
            result *= i;
          }
          return result;
        },
        get description() { return `🧙‍♂️ Calculate ${this.num}! (${this.num} factorial)`; }
      },
      {
        id: 'area_rectangle',
        title: '🏡 Garden Planning',
        story: 'Help design a rectangular garden by finding its area!',
        hint: 'Multiply length times width.',
        difficulty: 'Medium',
        length: Math.floor(Math.random() * 8) + 3,
        width: Math.floor(Math.random() * 6) + 2,
        get answer() { return this.length * this.width; },
        get description() { return `🏡 Find the area of a garden ${this.length} meters long and ${this.width} meters wide.`; }
      }
    ],
    3: [ // Medium-Hard questions for depth level 6-7
      {
        id: 'fraction_basics',
        title: '🍰 Cake Fractions',
        story: 'Cut the cake into equal pieces and find what fraction is left!',
        hint: 'Think about parts of a whole.',
        difficulty: 'Medium-Hard',
        num: (() => {
          const total = Math.floor(Math.random() * 4) + 4; // 4-7 pieces
          const eaten = Math.floor(Math.random() * (total - 1)) + 1;
          return { total, eaten, left: total - eaten };
        })(),
        get answer() { return this.num.left; },
        get description() { return `🍰 A cake is cut into ${this.num.total} pieces. If ${this.num.eaten} pieces are eaten, how many pieces are left?`; }
      },
      {
        id: 'word_problems',
        title: '🚗 Road Trip Math',
        story: 'Plan your road trip by solving this travel problem!',
        hint: 'Read carefully and identify what operation to use.',
        difficulty: 'Medium-Hard',
        num: (() => {
          const speed = Math.floor(Math.random() * 20) + 40; // 40-59 mph
          const time = Math.floor(Math.random() * 3) + 2; // 2-4 hours
          return { speed, time, distance: speed * time };
        })(),
        get answer() { return this.num.distance; },
        get description() { return `🚗 If you drive at ${this.num.speed} mph for ${this.num.time} hours, how many miles will you travel?`; }
      }
    ],
    4: [ // Hard questions for depth level 8+
      {
        id: 'fibonacci',
        title: '🌀 Golden Spiral Mystery',
        story: 'The ancient spiral pattern holds the key to the treasure. Find the nth Fibonacci number!',
        hint: 'Use loops to calculate the Fibonacci sequence.',
        difficulty: 'Hard',
        num: Math.floor(Math.random() * 3) + 6, // 6-8 (easier range)
        get answer() {
          if (this.num <= 1) return this.num;
          let a = 0, b = 1;
          for (let i = 2; i <= this.num; i++) {
            [a, b] = [b, a + b];
          }
          return b;
        },
        get description() { return `🌀 Find the ${this.num}th Fibonacci number (0, 1, 1, 2, 3, 5, 8...)`; }
      },
      {
        id: 'prime_check',
        title: '🔐 Secret Number Lock',
        story: 'The magical lock responds only to prime numbers. Is this number prime?',
        hint: 'Check if the number has any divisors other than 1 and itself.',
        difficulty: 'Hard',
        num: (() => {
          const primes = [11, 13, 17, 19, 23];
          const composites = [12, 14, 15, 16, 18, 20, 21, 22, 24, 25];
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
        get description() { return `🔐 Is ${this.num} a prime number? Return 1 for yes, 0 for no`; }
      }
    ]
  };

  // Select appropriate difficulty based on enhanced depth level system
  let questionSet = questions[difficultyLevel] || questions[4]; // Default to hardest if beyond range

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