export interface ParsedSceneFacts {
    subject: string;
    environment: string | null;
    activity: string | null;
    objects: string[];
    mood: string | null;
    location: string | null;
    styleHints: string[];
}

const DEFAULT_STYLE_HINTS = ["cinematic lighting", "realistic photography", "high quality"];

const ROLE_KEYWORDS: Array<{ role: string; patterns: string[] }> = [
    { role: "office worker", patterns: ["office", "desk", "meeting", "presentation", "computer", "laptop"] },
    { role: "student", patterns: ["classroom", "study", "exam", "lecture", "library", "school"] },
    { role: "doctor", patterns: ["hospital", "clinic", "patient", "medical", "surgery"] },
    { role: "traveler", patterns: ["airport", "station", "luggage", "passport", "hotel", "journey"] },
    { role: "chef", patterns: ["kitchen", "cooking", "restaurant", "food", "chef"] },
    { role: "engineer", patterns: ["factory", "machine", "industrial", "equipment", "plant"] },
];

const ENVIRONMENT_PATTERNS: Array<{ label: string; patterns: string[] }> = [
    { label: "small office", patterns: ["small office", "home office", "office room"] },
    { label: "modern office", patterns: ["modern office", "open office", "corporate office"] },
    { label: "conference room", patterns: ["conference room", "meeting room", "board room"] },
    { label: "classroom", patterns: ["classroom", "school room"] },
    { label: "hospital room", patterns: ["hospital room", "clinic room", "ward"] },
    { label: "city street", patterns: ["city street", "street", "downtown"] },
    { label: "street market", patterns: ["street market", "market", "bazaar"] },
    { label: "airport terminal", patterns: ["airport", "terminal"] },
    { label: "warehouse", patterns: ["warehouse", "storage facility"] },
    { label: "factory floor", patterns: ["factory floor", "factory", "industrial plant"] },
    { label: "living room", patterns: ["living room", "lounge"] },
    { label: "bedroom", patterns: ["bedroom"] },
    { label: "kitchen", patterns: ["kitchen"] },
    { label: "restaurant", patterns: ["restaurant", "dining area"] },
    { label: "library", patterns: ["library"] },
    { label: "beach", patterns: ["beach", "shore"] },
    { label: "forest", patterns: ["forest", "woods"] },
];

const ACTIVITY_PATTERNS: Array<{ label: string; patterns: string[] }> = [
    { label: "working on laptop", patterns: ["using laptop", "on laptop", "typing", "coding", "computer"] },
    { label: "presenting", patterns: ["presenting", "presentation", "explaining"] },
    { label: "studying", patterns: ["studying", "reading notes", "taking notes"] },
    { label: "walking", patterns: ["walking", "strolling"] },
    { label: "driving", patterns: ["driving", "behind the wheel"] },
    { label: "talking", patterns: ["talking", "speaking", "conversation"] },
    { label: "cooking", patterns: ["cooking", "preparing food"] },
    { label: "shopping", patterns: ["shopping", "buying"] },
    { label: "waiting", patterns: ["waiting", "standing by"] },
];

const OBJECT_PATTERNS: Array<{ label: string; patterns: string[] }> = [
    { label: "laptop", patterns: ["laptop", "notebook computer"] },
    { label: "phone", patterns: ["phone", "smartphone", "mobile"] },
    { label: "camera", patterns: ["camera"] },
    { label: "book", patterns: ["book", "textbook"] },
    { label: "car", patterns: ["car", "vehicle"] },
    { label: "coffee cup", patterns: ["coffee", "cup"] },
    { label: "desk", patterns: ["desk", "table"] },
    { label: "monitor", patterns: ["monitor", "screen", "display"] },
    { label: "headphones", patterns: ["headphones", "headset"] },
    { label: "microphone", patterns: ["microphone", "mic"] },
];

const MOOD_PATTERNS: Array<{ label: string; patterns: string[] }> = [
    { label: "focused", patterns: ["focused", "concentrated", "intent"] },
    { label: "calm", patterns: ["calm", "peaceful", "quiet"] },
    { label: "energetic", patterns: ["energetic", "excited", "vibrant"] },
    { label: "serious", patterns: ["serious", "formal"] },
    { label: "concerned", patterns: ["worried", "concerned", "anxious"] },
    { label: "confident", patterns: ["confident", "assured"] },
];

const STOP_TOKENS = new Set([
    "scene", "chapter", "shot", "video", "story", "person", "someone", "emmanuel", "john", "sarah"
]);

export function parseSceneFacts(sceneText: string): ParsedSceneFacts {
    const rawText = sceneText.trim();
    const normalizedText = normalizeText(rawText);

    const environment = detectLabel(ENVIRONMENT_PATTERNS, normalizedText);
    const activity = detectLabel(ACTIVITY_PATTERNS, normalizedText);
    const mood = detectLabel(MOOD_PATTERNS, normalizedText);
    const objects = detectObjects(normalizedText);
    const location = extractLocation(rawText);
    const subject = inferSubject(normalizedText, environment, activity, objects);

    return {
        subject,
        environment,
        activity,
        objects,
        mood,
        location,
        styleHints: DEFAULT_STYLE_HINTS,
    };
}

export function buildVisualQueryFromFacts(facts: ParsedSceneFacts): string {
    const segments: string[] = [];

    segments.push(facts.activity ? `${facts.subject} ${facts.activity}` : facts.subject);

    if (facts.environment) segments.push(`in ${facts.environment}`);
    if (facts.location) segments.push(`in ${facts.location}`);
    if (facts.objects.length > 0) segments.push(`with ${facts.objects.slice(0, 3).join(", ")}`);
    if (facts.mood) segments.push(`${facts.mood} mood`);

    segments.push(...facts.styleHints);

    return segments.join(", ");
}

function inferSubject(
    normalizedText: string,
    environment: string | null,
    activity: string | null,
    objects: string[]
) {
    for (const rule of ROLE_KEYWORDS) {
        if (matchesAny(normalizedText, rule.patterns)) return rule.role;
    }

    if (environment?.includes("hospital")) return "doctor";
    if (environment?.includes("classroom") || activity === "studying") return "student";
    if (objects.includes("laptop")) return "office worker";

    return "person";
}

function detectObjects(normalizedText: string) {
    const found = OBJECT_PATTERNS
        .filter((entry) => matchesAny(normalizedText, entry.patterns))
        .map((entry) => entry.label);

    return [...new Set(found)];
}

function detectLabel(
    entries: Array<{ label: string; patterns: string[] }>,
    normalizedText: string
) {
    for (const entry of entries) {
        if (matchesAny(normalizedText, entry.patterns)) return entry.label;
    }
    return null;
}

function matchesAny(normalizedText: string, patterns: string[]) {
    return patterns.some((pattern) => containsTerm(normalizedText, pattern));
}

function containsTerm(normalizedText: string, term: string) {
    const escaped = escapeRegex(term.toLowerCase());
    const re = new RegExp(`\\b${escaped.replace(/\s+/g, "\\s+")}\\b`, "i");
    return re.test(normalizedText);
}

function extractLocation(text: string) {
    const withPreposition = text.match(/\b(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/);
    if (withPreposition?.[1]) return withPreposition[1].trim();

    const properNounPair = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/);
    if (properNounPair?.[1] && !STOP_TOKENS.has(properNounPair[1].toLowerCase())) {
        return properNounPair[1].trim();
    }

    return null;
}

function normalizeText(text: string) {
    return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
