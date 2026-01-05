# RosterSync - Token Usage & AI Pricing Guide

## 📌 What Are Tokens?

**Tokens** are the fundamental units that AI models use to process text. They are not exactly words—rather, they are pieces of words, punctuation, or characters that the model processes.

### Token Basics

| Concept | Explanation |
|---------|-------------|
| **1 Token** | ≈ 4 characters in English |
| **1 Token** | ≈ 0.75 words |
| **100 Tokens** | ≈ 75 words |
| **1,000 Tokens** | ≈ 750 words (about 1.5 pages) |

### Examples

| Text | Token Count |
|------|-------------|
| "Hello" | 1 token |
| "Hello, world!" | 4 tokens |
| "RosterSync extracts rosters" | 4 tokens |
| "Mohamed Salah" | 3 tokens |
| Full player roster (25 players) | ~100-150 tokens |

---

## 🔄 How RosterSync Uses Tokens

### Token Flow Per Extraction

```
┌─────────────────────────────────────────────────────────────────┐
│                     SINGLE ROSTER EXTRACTION                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT TOKENS (What we send to Gemini)                         │
│  ├── System Prompt (instructions)        ~1,200 tokens         │
│  ├── User Query (e.g., "Liverpool FC")   ~10-20 tokens         │
│  └── Google Search Results (grounding)   ~2,000-4,000 tokens   │
│      ─────────────────────────────────────────────────          │
│      TOTAL INPUT:                        ~3,200-5,200 tokens   │
│                                                                 │
│  OUTPUT TOKENS (What Gemini returns)                           │
│  ├── Team Name + Sport                   ~10 tokens            │
│  ├── Player List (25-30 players)         ~300-500 tokens       │
│  ├── Verified Sources (URLs)             ~100-200 tokens       │
│  └── Verification Notes                  ~50-100 tokens        │
│      ─────────────────────────────────────────────────          │
│      TOTAL OUTPUT:                       ~500-800 tokens       │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  TOTAL PER EXTRACTION:                   ~4,000-6,000 tokens   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Average Token Usage

Based on real-world usage patterns:

| Metric | Value |
|--------|-------|
| **Average Input Tokens** | ~4,000 tokens |
| **Average Output Tokens** | ~650 tokens |
| **Total per Extraction** | ~4,650 tokens |
| **Model Used** | Gemini 1.5 Flash |

---

## 📊 Token Breakdown by Component

### 1. System Prompt (Fixed Cost)

The system prompt is sent with every request and includes:
- Role definition and objectives
- Extraction rules and guidelines
- Data normalization instructions
- Output format specifications

```
System Prompt Size: ~1,200 tokens (constant)
```

### 2. User Query (Variable)

The team search query provided by the user:

| Query Type | Example | Tokens |
|------------|---------|--------|
| Simple | "Lakers" | 1-2 |
| Standard | "Los Angeles Lakers 2024" | 5-8 |
| Specific | "Texas Longhorns Women's Basketball 2024-25 roster" | 12-18 |

### 3. Google Search Grounding (Variable)

Gemini's real-time web search results contribute the most tokens:

```
Web search context: 2,000 - 4,000 tokens
(Includes snippets from official team sites, league databases, etc.)
```

### 4. Output Response (Variable)

The structured JSON response with player data:

| Roster Size | Output Tokens |
|-------------|---------------|
| Small (10-15 players) | 200-350 |
| Medium (20-30 players) | 400-600 |
| Large (40-60 players) | 700-1,100 |

---

## 💰 Cost Per Extraction

### Using Gemini 1.5 Flash (Current Model)

| Token Type | Tokens Used | Price per 1M | Cost |
|------------|-------------|--------------|------|
| Input | 4,000 | $0.075 | $0.0003 |
| Output | 650 | $0.30 | $0.000195 |
| **Total** | **4,650** | — | **$0.000495** |

**Cost per extraction: ~$0.0005 (less than 1/10th of a cent)**

### Monthly Cost Estimates

| Extractions/Month | Token Usage | Monthly Cost |
|-------------------|-------------|--------------|
| 100 | 465,000 | ~$0.05 |
| 500 | 2,325,000 | ~$0.25 |
| 1,000 | 4,650,000 | ~$0.50 |
| 5,000 | 23,250,000 | ~$2.50 |
| 10,000 | 46,500,000 | ~$5.00 |

---

## 📈 Token Metadata in RosterSync

Every extraction in RosterSync includes performance metadata:

```typescript
meta: {
    model: "gemini-1.5-flash",
    latencyMs: 2847,           // Response time in milliseconds
    promptTokens: 4123,        // Input tokens used
    candidatesTokens: 598,     // Output tokens generated
    totalTokens: 4721          // Total tokens for this request
}
```

This metadata is visible in the **AI Analysis** tab of any saved roster, allowing you to monitor actual usage.

---

## 🏷️ AI Model Pricing Comparison (January 2025)

### Top 5 AI Models for Text Generation

| Rank | Model | Provider | Input (per 1M) | Output (per 1M) | Best For |
|------|-------|----------|----------------|-----------------|----------|
| 1 | **Gemini 1.5 Flash** | Google | $0.075 | $0.30 | Cost-effective grounded search ✅ |
| 2 | **GPT-4o Mini** | OpenAI | $0.15 | $0.60 | Budget-friendly ChatGPT alternative |
| 3 | **Mistral Small 3** | Mistral | $0.10 | $0.30 | European AI, good value |
| 4 | **Llama 3.3 70B** | Meta (via providers) | $0.04 | $0.04 | Open-source, self-hostable |
| 5 | **Claude 3.5 Haiku** | Anthropic | $0.25 | $1.25 | Fast, safe responses |

### Premium Tier Models

| Model | Provider | Input (per 1M) | Output (per 1M) | Best For |
|-------|----------|----------------|-----------------|----------|
| **GPT-4o** | OpenAI | $2.50 | $10.00 | Complex reasoning, vision |
| **Claude 3.5 Sonnet** | Anthropic | $3.00 | $15.00 | Long documents, coding |
| **Gemini 1.5 Pro** | Google | $1.25 | $5.00 | Large context (1M tokens) |
| **Mistral Large 2** | Mistral | $2.00 | $6.00 | Enterprise, multilingual |
| **GPT-4 Turbo** | OpenAI | $10.00 | $30.00 | Legacy, high accuracy |

---

## 💡 Why RosterSync Uses Gemini 1.5 Flash

| Reason | Explanation |
|--------|-------------|
| **Cost Efficiency** | At $0.075/$0.30 per million tokens, it's one of the cheapest premium models |
| **Google Search Grounding** | Native integration with Google Search for real-time web data |
| **Speed** | "Flash" models prioritize low latency (~2-3 second responses) |
| **Accuracy** | Excellent for structured data extraction tasks |
| **Reliability** | 99.9% uptime with fallback to `gemini-flash-lite-latest` |

### Cost Comparison for 1,000 Extractions

| Model | Input Cost | Output Cost | Total |
|-------|------------|-------------|-------|
| **Gemini 1.5 Flash** | $0.30 | $0.20 | **$0.50** |
| GPT-4o Mini | $0.60 | $0.39 | $0.99 |
| Claude 3.5 Haiku | $1.00 | $0.81 | $1.81 |
| GPT-4o | $10.00 | $6.50 | $16.50 |
| Claude 3.5 Sonnet | $12.00 | $9.75 | $21.75 |

**RosterSync saves ~97% compared to premium models like GPT-4o or Claude 3.5 Sonnet.**

---

## 🔧 Optimizing Token Usage

### Tips to Reduce Token Consumption

1. **Be Specific**: "Lakers 2024" uses fewer search results than "basketball team california"
2. **Use Official Names**: "Manchester United" is better than "Man U red devils"
3. **Specify Gender/Level**: "Duke Women's Soccer" avoids ambiguity and extra searches
4. **Cache Results**: Save rosters to your library instead of re-extracting

### Token Limits

| Limit | Value |
|-------|-------|
| Max Input (Gemini 1.5 Flash) | 1,048,576 tokens (~1M) |
| Max Output | 8,192 tokens |
| Typical RosterSync Request | <10,000 total tokens |

---

## 📋 Quick Reference

### Per-Extraction Summary

```
┌────────────────────────────────────────┐
│        TYPICAL EXTRACTION COST         │
├────────────────────────────────────────┤
│  Model:     Gemini 1.5 Flash           │
│  Input:     ~4,000 tokens ($0.0003)    │
│  Output:    ~650 tokens ($0.0002)      │
│  Total:     ~4,650 tokens              │
│  Cost:      ~$0.0005 per extraction    │
│  Latency:   2-4 seconds                │
└────────────────────────────────────────┘
```

### Pricing Formula

```
Cost = (Input Tokens × $0.000000075) + (Output Tokens × $0.0000003)

Example: 4,000 input + 650 output
= (4,000 × $0.000000075) + (650 × $0.0000003)
= $0.0003 + $0.000195
= $0.000495 (~$0.0005)
```

---

*Document generated: January 5, 2026*
*Prices sourced from official provider documentation and may change.*
