export interface Skill {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  systemPrompt: string
  inputLabel: string
  outputLabel: string
  category: 'built-in' | 'custom'
}

export const BUILT_IN_SKILLS: Skill[] = [
  {
    id: 'developer',
    name: 'Dev Agent',
    description: 'Code review, debugging, refactoring',
    emoji: '⚡',
    color: '#3B82F6',
    systemPrompt: '',
    inputLabel: 'Code or task',
    outputLabel: 'Analysis',
    category: 'built-in',
  },
  {
    id: 'architect',
    name: 'Architect',
    description: 'System design & tech decisions',
    emoji: '🏗️',
    color: '#8B5CF6',
    systemPrompt: '',
    inputLabel: 'Design question',
    outputLabel: 'Recommendation',
    category: 'built-in',
  },
  {
    id: 'entrepreneur',
    name: 'Strategist',
    description: 'Business proposals & research',
    emoji: '🚀',
    color: '#F59E0B',
    systemPrompt: '',
    inputLabel: 'Business context',
    outputLabel: 'Strategy',
    category: 'built-in',
  },
  {
    id: 'ba',
    name: 'BA Agent',
    description: 'Requirements & user stories',
    emoji: '📊',
    color: '#10B981',
    systemPrompt: '',
    inputLabel: 'Feature description',
    outputLabel: 'Requirements',
    category: 'built-in',
  },
  {
    id: 'qa',
    name: 'QA Agent',
    description: 'Test plans & test cases',
    emoji: '🔍',
    color: '#EF4444',
    systemPrompt: '',
    inputLabel: 'Feature to test',
    outputLabel: 'Test plan',
    category: 'built-in',
  },
  {
    id: 'it_support',
    name: 'IT Support',
    description: 'Runbooks & documentation',
    emoji: '🛠️',
    color: '#06B6D4',
    systemPrompt: '',
    inputLabel: 'Issue or topic',
    outputLabel: 'Documentation',
    category: 'built-in',
  },
  {
    id: 'social_media',
    name: 'Content Writer',
    description: 'Social posts & content',
    emoji: '📱',
    color: '#EC4899',
    systemPrompt: '',
    inputLabel: 'Topic or brief',
    outputLabel: 'Content',
    category: 'built-in',
  },
  {
    id: 'summarizer',
    name: 'Summarizer',
    description: 'Condenses any text to key points',
    emoji: '✂️',
    color: '#A78BFA',
    systemPrompt: `You are a precise summarizer. Given any text:
- Extract only the most important information
- Use bullet points for multiple items
- Lead with the most critical point
- Remove all filler, repetition, and hedging
- Output should be 20-30% the length of input
Be ruthless about cutting. Every word must earn its place.`,
    inputLabel: 'Text to summarize',
    outputLabel: 'Summary',
    category: 'built-in',
  },
  {
    id: 'formatter',
    name: 'Formatter',
    description: 'Reformats & structures raw text',
    emoji: '🎨',
    color: '#F97316',
    systemPrompt: `You are a document formatter and editor. Given raw text:
- Structure it with clear headings and sections
- Convert prose lists into bullet points
- Add a clear title if none exists
- Make tables where comparisons exist
- Improve sentence clarity without changing meaning
- Output clean, well-structured markdown`,
    inputLabel: 'Raw text to format',
    outputLabel: 'Formatted document',
    category: 'built-in',
  },
]
