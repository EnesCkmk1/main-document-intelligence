<div align="center">

# Document Intelligence

Danish document analysis app (Dokument-AI).

**Understand contracts, offers, insurance papers and letters - explained in plain Danish.**

Upload a document and have it translated from legalese into something you actually understand.

[![Live demo](https://img.shields.io/badge/Live_demo-dokument--ai-1F6F5C?logo=vercel&logoColor=white)](https://dokument-ai-neon.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-Anthropic-D97757)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

> **Note:** The app's user interface and analysis output are in **Danish** - it's a tool for understanding Danish documents. This README is in English for international readers.

---

## Live demo

**[Try it → dokument-ai-neon.vercel.app](https://dokument-ai-neon.vercel.app)**

Upload a document, get a plain-Danish explanation, important points, deadlines and warnings. The public deploy runs in demo mode (no API key), so you can try the full flow without setting anything up.

![Dokument-AI demo: upload a document and get a plain-Danish explanation](docs/dokument-ai-demo.gif)

[Watch the full video (MP4)](docs/dokument-ai-demo.mp4)

---

## What does it do?

You upload a document, and the app:

- 🗣️ **explains** it in language you understand - no legal jargon
- ⭐ **highlights** the most important points
- 📅 **finds** deadlines, dates and due dates
- 📝 **writes** a short summary
- ⚠️ **warns** about things to pay extra attention to (fees, lock-in periods, automatic renewal …)

Useful for individuals and businesses alike.

> **Disclaimer:** Dokument-AI gives a helpful explanation, but it is **not** legal advice. When in doubt, consult a professional.

## 🧪 Demo mode

Without an API key the app runs in **demo mode**: it shows a fixed example analysis
instead of calling Claude. This lets the project be deployed and tried publicly
without a real key - upload any file and see what the result looks like.

Set `ANTHROPIC_API_KEY` (see below) to analyze real documents.

## Supported file types

| File type | Handling |
| --- | --- |
| **PDF** | Read directly by Claude |
| **Image / scan** (JPG, PNG, GIF, WebP) | Read directly by Claude (vision) |
| **Word** (`.docx`) | Text extracted with `mammoth` |
| **Text file** (`.txt`) | Read as plain text |

Max file size: **20 MB**.

## How it works

```
   Upload  ──►  /api/analyze  ──►  Claude  ──►  Structured JSON  ──►  UI
 (browser)     (server route)   (Anthropic)     (fixed schema)      (sections)
```

The analysis runs **server-side** in a Next.js route handler (`app/api/analyze`), so
the API key never reaches the browser. Claude responds in a fixed JSON schema
(structured outputs), so the UI always gets data in the same shape - summary,
explanation, important points, dates and warnings.

## Tech stack

<img src="https://skillicons.dev/icons?i=ts,nextjs,react,tailwind,nodejs,vercel&perline=6" alt="TypeScript, Next.js, React, Tailwind CSS, Node.js and Vercel">

Claude (`claude-sonnet-4-6`) powers the document analysis through [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk), while [`mammoth`](https://www.npmjs.com/package/mammoth) extracts text from Word documents.

## Getting started

Requires **Node.js 22.12 or later**.

**1. Install dependencies**

```bash
npm install
```

**2. Create `.env.local` and add your Anthropic key** *(optional - skip it to run in demo mode)*

```bash
cp .env.local.example .env.local
# edit .env.local and paste your real key
```

```dotenv
ANTHROPIC_API_KEY=sk-ant-...
```

> Your key is **never** committed - `.env.local` is in `.gitignore`.
> Get a key at [console.anthropic.com](https://console.anthropic.com/).

**3. Start the dev server**

```bash
npm run dev
```

**4. Open** [http://localhost:3000](http://localhost:3000)

## Project structure

```
app/
  api/analyze/route.ts   # Secure server route that calls Claude
  layout.tsx             # Fonts + metadata
  page.tsx               # Home page with upload + result
  globals.css            # Global styles
components/
  UploadZone.tsx         # Drag & drop upload
  ResultView.tsx         # Renders the analysis in sections
lib/
  extract.ts             # Extract content from PDF/image/Word/text
  schema.ts              # JSON schema + types for the analysis
  demo.ts                # Sample analysis used in demo mode
docs/
  dokument-ai-demo.gif   # README preview of the upload → result flow
  dokument-ai-demo.mp4   # Full-quality screen recording
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run the linter |

## License

Released under the [MIT License](LICENSE).

## Engineering and evaluation

The API validates model output at runtime using the same JSON Schema supplied to Claude. Invalid JSON, missing fields and incorrect field types return HTTP 502. Provider calls have a 45-second timeout and automatic retries disabled. Documents are treated as untrusted input in the system prompt; this instruction is not a complete prompt-injection defense.

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run eval -- path/to/predictions.json
```

CI runs lint, dependency auditing, type checking, 33 offline tests and a production build, and uploads JUnit results. Provider responses are mocked in tests, so CI needs no API key and makes no claim about real model accuracy.

Format tests exercise real DOCX text extraction, empty/corrupt Word files and PDF/image byte transport. They do not measure OCR accuracy or live Claude quality.

See [evaluation protocol and synthetic dataset](evals/README.md) for deadline, warning and injection cases and the prediction-report format. Missing predictions fail the evaluation gate. Generated reports stay local by default.

## Operational limits

The public demo returns a fixed example, not an analysis of the upload. The live flow sends document content to Anthropic. Only use documents you are authorized to share. Authentication, rate limiting, durable background jobs and human review are not implemented. File-type routing uses MIME/extension checks, not binary format verification. The upload size check happens after multipart parsing, so ingress limits are needed for public production use.

The Next.js 16 / React 19 migration passed local checks. The dependency audit reported zero known vulnerabilities on 2026-09-09; CI rejects high/critical advisories. This is a point-in-time dependency check, not a production security certification. Hosting deployment verification remains separate.

The repository can be renamed to `document-intelligence` in GitHub settings. After renaming, update your local remote and confirm the hosting integration.
