import { StrategyDefinition, StrategyType } from './types';

export const STRATEGIES: StrategyDefinition[] = [
  {
    id: 'fixed',
    name: StrategyType.FixedSize,
    description: "Splits text into chunks of a predetermined character count, regardless of content structure.",
    bestFor: ["Simple implementations", "Uniform processing", "Memory-constrained systems"],
    worstFor: ["Semantic coherence", "Complex document structures"],
    complexity: 'Low',
    requiresAI: false
  },
  {
    id: 'recursive',
    name: StrategyType.Recursive,
    description: "Iteratively splits text using a hierarchy of separators (e.g., \\n\\n, \\n, space) to find the largest possible chunks that fit constraints.",
    bestFor: ["LangChain compatibility", "General-purpose RAG", "Preserving context"],
    worstFor: ["Highly specialized formats", "Streaming data"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'code',
    name: StrategyType.Code,
    description: "Splits code based on language-specific syntax trees (classes, functions) to preserve logic.",
    bestFor: ["Python", "JavaScript/TypeScript", "Rust"],
    worstFor: ["Natural language", "Minified code"],
    complexity: 'High',
    requiresAI: false
  },
  {
    id: 'regex',
    name: StrategyType.Regex,
    description: "Splits text based on a user-defined Regular Expression pattern.",
    bestFor: ["Custom formats", "Log files", "Specific delimiters"],
    worstFor: ["General prose", "Variable structure"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'document',
    name: StrategyType.Document,
    description: "Splits based on document structure like headers, sections, or pages.",
    bestFor: ["Markdown", "Books", "Technical Docs"],
    worstFor: ["Unstructured text", "Tweets/Emails"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'semantic',
    name: StrategyType.Semantic,
    description: "Uses AI to identify topic shifts and create chunks based on meaning rather than length.",
    bestFor: ["High-accuracy RAG", "Multi-topic documents"],
    worstFor: ["Real-time/Latency sensitive", "Low budget"],
    complexity: 'High',
    requiresAI: true
  },
  {
    id: 'sentence',
    name: StrategyType.Sentence,
    description: "Splits at precise sentence boundaries using Intl.Segmenter, grouping them until a size threshold is reached.",
    bestFor: ["QA Systems", "News articles"],
    worstFor: ["Lists", "Complex formatting"],
    complexity: 'Low',
    requiresAI: false
  },
  {
    id: 'paragraph',
    name: StrategyType.Paragraph,
    description: "Preserves paragraph integrity, splitting only when absolutely necessary.",
    bestFor: ["Essays", "Narratives", "Blogs"],
    worstFor: ["Code blocks", "Irregular formatting"],
    complexity: 'Low',
    requiresAI: false
  },
  {
    id: 'token',
    name: StrategyType.Token,
    description: "Splits based on token count to strictly fit LLM context windows.",
    bestFor: ["LLM Training", "Cost optimization"],
    worstFor: ["Human readability"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'sliding',
    name: StrategyType.SlidingWindow,
    description: "Creates overlapping chunks by moving a window across text.",
    bestFor: ["Context continuity", "Search/Retrieval"],
    worstFor: ["Storage efficiency"],
    complexity: 'Low',
    requiresAI: false
  },
  {
    id: 'content',
    name: StrategyType.ContentAware,
    description: "Detects content type (code, tables, prose) and switches strategies accordingly.",
    bestFor: ["Mixed-format docs", "Technical papers"],
    worstFor: ["Pure prose"],
    complexity: 'High',
    requiresAI: false
  },
  {
    id: 'metadata',
    name: StrategyType.Metadata,
    description: "Uses headers, timestamps, or tags to define boundaries.",
    bestFor: ["Chat logs", "Emails", "Multi-author docs"],
    worstFor: ["Unstructured data"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'linguistic',
    name: StrategyType.Linguistic,
    description: "Uses grammatical features (clauses, discourse markers) to split text.",
    bestFor: ["Deep NLP analysis", "Legal docs"],
    worstFor: ["Informal text"],
    complexity: 'High',
    requiresAI: true
  },
  {
    id: 'hybrid',
    name: StrategyType.Hybrid,
    description: "Adaptively combines paragraph and sentence splitting for balance.",
    bestFor: ["Production systems", "Diverse corpus"],
    worstFor: ["Simple use cases"],
    complexity: 'Medium',
    requiresAI: false
  },
  {
    id: 'llm',
    name: StrategyType.LLM,
    description: "Asks an LLM to intelligently segment the text based on context.",
    bestFor: ["Nuanced content", "Highest accuracy"],
    worstFor: ["Large scale processing"],
    complexity: 'High',
    requiresAI: true
  }
];

export const INITIAL_TEXT = `# Comprehensive Guide to Text Chunking Strategies

## 1. Fixed-Size Chunking

**What it does:** Splits text into chunks of a predetermined character or word count, regardless of content structure. Chunks are created sequentially with optional overlap between adjacent chunks.

**When to use:**
- Simple, quick implementations where structure is less important
- Uniform processing requirements across all chunks

## 2. Recursive Chunking

**What it does:** Attempts to split text using a hierarchy of separators (paragraphs, then sentences, then words), recursively breaking down text until chunks meet size requirements while preserving natural boundaries.

## 3. Document-Based Chunking

**What it does:** Splits text based on document-specific structure like pages, chapters, sections, or headings rather than arbitrary size limits.

## 4. Semantic Chunking

**What it does:** Uses embeddings or natural language understanding to identify topic shifts and create chunks based on semantic coherence rather than length or structure.`;
