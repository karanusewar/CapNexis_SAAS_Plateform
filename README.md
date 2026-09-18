# 🚀 CapNexis – Institutional AI Pitch Deck Analyzer

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-3_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

**CapNexis** is a Tier-1 Venture Capitalist (VC) grade pitch deck evaluation platform powered by Google Gemini AI. Built to empower founders and investors alike, CapNexis provides unfiltered, institutional-quality analysis, deal-killing flaw detection, narrative friction scoring, and actionable structural rewrites before presenting pitch decks to lead investors.

---

## ✨ Key Features

- **⚡ Instant Multi-Format Parsing:** Support for PDF, PPT, and PPTX pitch decks up to 50MB.
- **🎯 8-Parameter VC Scoring Grid:** Quantitative rating (0-100) across key investment dimensions:
  - **Idea & Clarity:** Value proposition precision & problem statement strength.
  - **Product & Tech:** Solution readiness, moat, and scalability architecture.
  - **Go-To-Market (GTM):** Customer acquisition channels and viral loops.
  - **Revenue Model:** Unit economics, pricing strategy, and monetization mechanics.
  - **IP & Defensability:** Intellectual property barriers and competitive advantages.
  - **Scalability:** Unit-level efficiency and TAM expansion capability.
  - **Network Effects:** Flywheel mechanics and platform dynamics.
  - **Exit Potential:** M&A potential, precedent comps, and liquidity pathways.
- **📄 Institutional Deal Memo Generation:** Detailed market notes, competitive analysis, missing diligence signals, financial red flags, and custom diligence questions.
- **✨ AI Rewrite Engine:** Automatic transformations turning weak or generic slide statements into high-impact VC-level value propositions.
- **💳 Integrated Cashfree PG & Serverless Infrastructure:** Serverless architecture supporting Cashfree payment gateway integration for seamless token purchasing.
- **🌌 Dynamic Glassmorphic UI:** Built with custom Tailwind CSS v4 styling, Aceternity-inspired floating UI cards, interactive charts (Recharts), and smooth Framer Motion animations.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 6 |
| **Styling & UI** | Tailwind CSS v4, Motion (Framer Motion), Lucide Icons |
| **Data Visualizations** | Recharts, html2canvas, jsPDF |
| **Artificial Intelligence** | `@google/genai` (Gemini 3 Flash / Pro models) |
| **Authentication & Database** | Firebase Authentication & Cloud Firestore |
| **Backend & Serverless API** | Express.js / Node.js (`server.ts`) & Vercel Serverless Functions (`api/index.ts`) |
| **Payment Gateway** | Cashfree PG API integration |

---

## 💡 Technical Engineering & Hard Work

Building CapNexis involved solving several non-trivial frontend, backend, and AI integration challenges:

1. **Structured JSON Output from LLM Reasoning:**
   - Designed strict structured JSON schemas with Gemini AI to guarantee schema enforcement without response truncation or parsing errors.
2. **Hybrid Local & Cloud Serverless Architecture:**
   - Created a dual backend pipeline (`server.ts` for local development and `api/index.ts` for Vercel Serverless Functions) ensuring seamless cross-environment deployment.
3. **High Performance Document Parsing:**
   - Built an optimized client-side document processor for handling heavy pitch deck files (up to 50MB) and converting binary content to base64 inline buffers safely.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- A Google Gemini API Key ([Get one here](https://aistudio.google.com/))

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/karanusewar/CapNexis_SAAS_Plateform.git
   cd CapNexis_SAAS_Plateform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

---

## ☁️ Deployment

CapNexis is production-ready for deployment on **Vercel**:

1. Push code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the Environment Variable `GEMINI_API_KEY`.
4. Click **Deploy**. Vercel will automatically build the static bundle (`dist/`) and route backend API requests to `api/index.ts`.

---

## 🤝 Contact & Credits

- Developed by **[Karan Usewar](https://github.com/karanusewar)**
- Flagship product concept powered by **[CapNexgen](https://www.capnexgen.com/)**
