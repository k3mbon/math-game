// Shared utility for loading, validating, caching, and selecting problems
// from NumerationProblem.json and LiterationProblem.json with equal-source selection.

let numerationCache = null;
let literationCache = null;
let lastLoadError = null;

// Supported verify types that the Blockly modal can handle
// Expanded to include additional types from NumerationProblem.json
const SUPPORTED_VERIFY = new Set([
  "sequence",
  "multiples",
  "printPrimes",
  // numeration types
  "evenOdd",
  "isPrime",
  "digitCount",
  "sumDigits",
  "reverse",
  "reverseDigits",
  "factorCount",
  "perfectNumber",
  "sumOfSquares",
  "binaryConversion",
  "fibonacci",
  "palindrome",
  "armstrong",
  "lcm",
  "gcd",
  "powerOfTwo",
  "sumOfDigits",
]);

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function validateProblem(problem) {
  if (!isObject(problem)) return { valid: false, reason: "Problem is not an object" };
  const { title, statement, story, description, answer, verify, level } = problem;
  if (!title || typeof title !== "string") return { valid: false, reason: "Missing or invalid title" };
  const text = statement || story || description;
  if (!text || typeof text !== "string") return { valid: false, reason: "Missing problem text" };
  if (typeof verify !== "string" || !SUPPORTED_VERIFY.has(verify)) {
    return { valid: false, reason: `Unsupported verify type: ${verify}` };
  }
  if (answer === undefined) return { valid: false, reason: "Missing answer" };
  // Basic level validation (optional in banks)
  if (level !== undefined && typeof level !== "number") {
    return { valid: false, reason: "Level must be a number" };
  }
  return { valid: true };
}

function normalizeProblem(problem, source) {
  // Ensure consistent keys used by UI/modal
  const text = problem.statement || problem.story || problem.description || "";
  return {
    ...problem,
    statement: text,
    source,
  };
}

function parseBank(raw, source) {
  if (!raw || !Array.isArray(raw)) return [];
  const out = [];
  for (const p of raw) {
    const v = validateProblem(p);
    if (v.valid) {
      out.push(normalizeProblem(p, source));
    } else {
      console.warn(`[problemLoader] Skipping invalid ${source} problem:`, v.reason, p);
    }
  }
  return out;
}

export async function ensureProblemsLoaded() {
  if (numerationCache && literationCache) {
    return { numeration: numerationCache, literation: literationCache, error: lastLoadError };
  }
  lastLoadError = null;
  try {
    const inNode = typeof window === "undefined";
    const jsonImport = async (path) => {
      // In Node, read via fs to avoid import-assertion limitations
      if (inNode) {
        const { readFile } = await import('node:fs/promises');
        const url = new URL(path, import.meta.url);
        const text = await readFile(url, 'utf-8');
        return JSON.parse(text);
      }
      // Browser/Vite can import JSON directly
      return import(path).then(m => m.default || m);
    };

    const [numModule, litModule] = await Promise.all([
      jsonImport("../data/NumerationProblem.json"),
      jsonImport("../data/LiterationProblem.json").catch(err => {
        console.warn("[problemLoader] LiterationProblem.json load failed:", err);
        return null; // allow missing/malformed literation file
      })
    ]);

    numerationCache = parseBank(numModule, "numeration");
    literationCache = parseBank(litModule, "literation");

    if (!numerationCache.length && !literationCache.length) {
      lastLoadError = "No valid problems available from either source.";
    }

    return { numeration: numerationCache, literation: literationCache, error: lastLoadError };
  } catch (err) {
    console.error("[problemLoader] Problem bank load error:", err);
    lastLoadError = err?.message || String(err);
    numerationCache = [];
    literationCache = [];
    return { numeration: numerationCache, literation: literationCache, error: lastLoadError };
  }
}

export function selectRandomProblem(numeration, literation, depthLevel = 0) {
  const hasNum = Array.isArray(numeration) && numeration.length > 0;
  const hasLit = Array.isArray(literation) && literation.length > 0;
  if (!hasNum && !hasLit) return null;

  // Equal-source selection: flip a coin among available sources
  let sourcePicked;
  if (hasNum && hasLit) {
    sourcePicked = Math.random() < 0.5 ? "numeration" : "literation";
  } else {
    sourcePicked = hasNum ? "numeration" : "literation";
  }

  const bank = sourcePicked === "numeration" ? numeration : literation;

  // Filter by level if present; fallback to entire bank if none match
  const maxLevel = Math.max(1, Math.min(4, Number(depthLevel) || 1));
  const levelFiltered = bank.filter(p => typeof p.level !== "number" || p.level <= maxLevel);
  const pool = levelFiltered.length ? levelFiltered : bank;

  return pool[Math.floor(Math.random() * pool.length)] || null;
}

export function getLastLoadError() {
  return lastLoadError;
}