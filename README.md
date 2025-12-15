# Chunk.io - RAG Strategy Visualizer

**Chunk.io** is a professional-grade text segmentation analysis tool designed for AI Engineers, Data Scientists, and RAG (Retrieval-Augmented Generation) Architects. It allows users to visualize, test, and compare how different chunking strategies affect document segmentation, directly impacting the quality of vector embeddings and retrieval accuracy.

Built with a "Swiss-International" aesthetic, the interface prioritizes clarity, precision, and data visualization.

![Chunk.io Preview](https://placehold.co/1200x600/0f172a/6366f1?text=Chunk.io+Preview)

## 🚀 Features

-   **13+ Chunking Strategies**: From simple Fixed-Size to advanced Semantic and LLM-based splitting.
-   **Real-time Visualization**: See exactly how text is split, with immediate feedback on character and token counts.
-   **Gemini AI Integration**: Leverages Google's Gemini 2.5 Flash for semantic, linguistic, and intelligent segmentation.
-   **Token Estimation**: Provides real-time estimates of token usage to help optimize for LLM context windows.
-   **Responsive Design**: A fluid, glassmorphism-inspired UI that works on desktop and large tablets.
-   **Performance Metrics**: Tracks processing time, chunk counts, and average sizes.

---

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS
-   **Visualization**: Recharts
-   **Icons**: Lucide React
-   **AI/ML**: Google GenAI SDK (Gemini 2.5)
-   **Build Tool**: Vite (Recommended)

---

## 💻 Local Development

### Prerequisites
-   Node.js (v18+)
-   npm or yarn
-   A Google AI Studio API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/chunk-io.git
    cd chunk-io
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    # Required for Semantic, Linguistic, and LLM chunking strategies
    VITE_GOOGLE_API_KEY=your_gemini_api_key_here
    ```

4.  **Start the Development Server**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` to view the app.

---

## ☁️ Cloud Deployment

### Vercel (Recommended)

1.  Install the Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project root.
3.  Set your environment variables in the Vercel dashboard:
    -   Key: `API_KEY` (or `VITE_GOOGLE_API_KEY` depending on your build config)
    -   Value: `your_gemini_key`
4.  Deploy!

### Netlify

1.  Drag and drop your `dist` folder to Netlify Drop, or connect via Git.
2.  Go to **Site Settings > Build & Deploy > Environment**.
3.  Add your `API_KEY`.

---

## ✅ Feature Roadmap & Todo List

A prioritized checklist of **100+ features** categorized to transform Chunk.io into the ultimate RAG workspace.

### 🧠 Core Strategy Engine
- [ ] Implement **Recursive Character Text Splitter** (LangChain style).
- [ ] Add **Code Splitter** (AST-based chunking for Python/JS/Rust).
- [ ] Implement **MarkdownHeaderSplitter** with customizable hierarchy depth.
- [ ] Add **Regex Splitter** with user-defined patterns.
- [ ] Create **NLTK/Spacy** integration for precise sentence boundary detection.
- [ ] Add **"Stop Sequence"** support for custom delimiters.
- [ ] Implement **Soft Overlap** (overlap only if sentence is cut).
- [ ] Add **Min Chunk Size** threshold (merge small stragglers).
- [ ] Create **Language Detection** to auto-select tokenizer.
- [ ] Add **Entity-Preserving Chunking** (don't split named entities).

### 📊 Visualization & Analytics
- [ ] **Heatmap View**: Color chunks by token density.
- [ ] **Similarity Graph**: Node-link diagram showing semantic similarity between chunks.
- [ ] **Token Distribution Histogram**: Visualize spread of chunk sizes.
- [ ] **3D Embedding Space**: Project chunks into 3D space using PCA/t-SNE.
- [ ] **Keyword Cloud** per chunk.
- [ ] **Dependency Parsing Tree** visualization for Linguistic strategy.
- [ ] **Diff View**: Compare two strategies side-by-side.
- [ ] **"Lost Context" Highlighter**: Highlight words cut off at boundaries.
- [ ] **Scroll Sync**: Sync source text scroll with chunk visualizer.
- [ ] **Mini-map**: High-level overview of the document segmentation.

### 🤖 AI & LLM Integration
- [ ] **Prompt Playground**: Customize the system prompt for LLM strategies.
- [ ] **Model Switcher**: Toggle between Gemini Pro, Flash, and Ultra.
- [ ] **Cost Estimator**: Calculate embedding cost for the generated chunks.
- [ ] **Summarization**: Auto-generate a summary for each chunk.
- [ ] **Question Generation**: AI generates synthetic QA pairs per chunk (for RAG eval).
- [ ] **Labeling**: Auto-tag chunks with categories/topics.
- [ ] **Hallucination Check**: Analyze if a chunk stands alone factually.
- [ ] **Multi-Model Compare**: Run Gemini vs. GPT-4 splitting simultaneously.
- [ ] **Fine-tuning Dataset Gen**: Export chunks in JSONL for fine-tuning.
- [ ] **Token Counter Accuracy**: Switch between tiktoken (OpenAI) and Gemini tokenizers.

### 📥 Data Ingestion (Input)
- [ ] **PDF Parsing**: Drag & drop PDF support with OCR.
- [ ] **URL Scraper**: Fetch and clean content from a website.
- [ ] **YouTube Transcripts**: Ingest video IDs and chunk the captions.
- [ ] **Docx/Pptx Support**: Handle Office documents.
- [ ] **Notion Integration**: Connect to Notion pages.
- [ ] **Google Drive Picker**: Select docs directly from Drive.
- [ ] **Sitemap Crawler**: Ingest an entire documentation site.
- [ ] **Code Repository Ingest**: Clone a GitHub repo and chunk all files.
- [ ] **CSV/Excel**: Column-aware chunking for structured data.
- [ ] **Audio Upload**: Whisper integration for speech-to-text chunking.

### 📤 Data Egress (Export)
- [ ] **Vector DB Sync**: Direct upload to Pinecone.
- [ ] **Weaviate Integration**: Push chunks to Weaviate.
- [ ] **ChromaDB Export**: Download a local Chroma collection.
- [ ] **LangChain Loader Export**: Export code snippet to reproduce config in Python/JS.
- [ ] **JSON/CSV Download**: Standard data exports.
- [ ] **Markdown Export**: Reconstructed markdown with chunk delimiters.
- [ ] **API Endpoint**: Expose current logic as a serverless function.
- [ ] **Embed Code**: "Copy Embed" to put a visualizer on another site.
- [ ] **Shareable Links**: Generate a unique URL for the current workspace state.
- [ ] **PDF Report**: Generate a PDF report of the chunking strategy analysis.

### 🧪 RAG Simulation (The "Lab")
- [ ] **Retrieval Test**: Type a query and see which chunks would rank highest (using cosine sim).
- [ ] **Relevance Scoring**: Manually rate chunk relevance to a query.
- [ ] **"Needle in a Haystack"**: Visual test for long-context retrieval.
- [ ] **Embedding Preview**: Show the vector array (first 10 dims).
- [ ] **Metadata Injection**: Test adding metadata (Title, Date) to chunks before embedding.
- [ ] **Context Window Simulator**: Visualize how many chunks fit in GPT-4 vs Claude 3.
- [ ] **Reranker Sim**: Simulate effect of a Cross-Encoder reranker.
- [ ] **Hybrid Search Sim**: Weight keywords vs. semantic vectors.
- [ ] **Parent-Child Indexing**: Visualize parent docs vs child chunks.
- [ ] **Hypothetical Document Embeddings (HyDE)** generation test.

### 🎨 User Interface & Experience
- [ ] **Dark/Light Mode**: Full theme toggle.
- [ ] **Focus Mode**: Collapse sidebar and headers.
- [ ] **Keyboard Shortcuts**: `Cmd+Enter` to run, `Cmd+K` for command palette.
- [ ] **Mobile Optimization**: Better touch targets and stacked views.
- [ ] **Font Size Control**: Accessibility scaling.
- [ ] **Custom Fonts**: Upload user fonts.
- [ ] **Layout Config**: Grid vs List vs Masonry view for chunks.
- [ ] **Toast Notifications**: Better error/success messaging.
- [ ] **Onboarding Tour**: Guided walkthrough for new users.
- [ ] **Settings Persistance**: Save preferences to LocalStorage.

### ⚡ Performance & Architecture
- [ ] **Web Workers**: Offload local regex processing to workers.
- [ ] **WASM**: Compile Rust tokenizers to WASM for 100x speed.
- [ ] **Virtualization**: Handle 10,000+ chunks without DOM lag.
- [ ] **Offline Mode**: Cache AI responses or full PWA support.
- [ ] **Streaming**: Stream LLM chunks token-by-token.
- [ ] **Caching**: Deduplicate identical API requests.
- [ ] **Edge Functions**: Move heavy logic to Vercel Edge.
- [ ] **Error Boundaries**: Graceful crash handling per component.
- [ ] **Bundle Analysis**: Optimize initial load size.
- [ ] **Docker Support**: Containerize the app for enterprise deployment.

### 🤝 Collaboration
- [ ] **Workspaces**: Create projects for different datasets.
- [ ] **Team Comments**: Comment on specific chunks.
- [ ] **Version History**: "Undo" chunking parameter changes.
- [ ] **Annotation Mode**: Highlight text spans manually.
- [ ] **Role-Based Access**: Viewer vs Editor permissions.
- [ ] **Template Library**: Save "Best for Legal" or "Best for Medical" presets.
- [ ] **Community Hub**: Public gallery of chunking strategies.
- [ ] **Forks**: Duplicate a colleague's configuration.
- [ ] **Audit Logs**: See who changed parameters.
- [ ] **Live Collaboration**: Google Docs style multi-user editing.

### 🛡️ Enterprise & Security
- [ ] **PII Redaction**: Auto-detect and mask emails/phones before sending to AI.
- [ ] **BYO Key**: Allow users to input their own OpenAI/Gemini keys securely.
- [ ] **SSO**: SAML/OIDC login.
- [ ] **Data Residency**: Option to pin processing to specific regions.
- [ ] **Self-Hosted Mode**: Instructions for air-gapped deployment.
- [ ] **API Rate Limiting**: User-defined caps to prevent billing spikes.
- [ ] **Cost Alerts**: Warning before running large batch jobs.
- [ ] **Watermarking**: Invisible watermarking of chunks.
- [ ] **Compliance export**: GDPR data export.
- [ ] **Vulnerability Scanning**: Automated dependabot integration.

---

## 📄 License

MIT License - Copyright (c) 2025 Chunk.io
