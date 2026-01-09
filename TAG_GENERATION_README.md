# 🏷️ RosterSync Tag Generation Feature

## Overview

RosterSync now includes AI-powered search alias generation for athletes to improve findability in Media Asset Management (MAM) systems. This feature automatically generates nicknames, phonetic misspellings, jersey numbers, and team abbreviations for each player.

## Features

### 1. **Automatic Tag Generation on Extraction**
When you extract a roster, tags are automatically generated in the background using Google's Gemini AI with live web search.

### 2. **Manual Tag Generation**
Use the "Generate Tags" button on any saved roster page to generate or regenerate tags for all players.

### 3. **Iconik Export Integration**
Tags are automatically exported to a `search_aliases` metadata field when syncing to Iconik.

## How It Works

### AI System Prompt
The tag generation uses a specialized AI system prompt that instructs Gemini to:
- Provide 5-10 tags per athlete
- Include common nicknames (e.g., "King James" for LeBron James)
- Include phonetic misspellings (e.g., "Lebron" for "LeBron")
- Include jersey numbers with # prefix (e.g., "#23", "#6")
- Include historical team abbreviations (e.g., "LAL", "MIA", "CLE")
- Avoid generic terms like "player" or "athlete"

### Tag Generation Process

```typescript
// Example: Generate tags for a list of players
import { generatePlayerTags } from './services/geminiService';

const tags = await generatePlayerTags(
  ['LeBron James', 'Stephen Curry'],
  'Los Angeles Lakers',
  'Basketball'
);

// Result:
// {
//   "LeBron James": ["King James", "Bron", "LBJ", "#23", "#6", "LAL", "Lebron"],
//   "Stephen Curry": ["Steph", "Chef Curry", "#30", "GSW", "Wardell"]
// }
```

## Usage

### From the Dashboard
1. Enter a team name (e.g., "Los Angeles Lakers")
2. Click "Extract"
3. Tags are automatically generated in the background
4. View the enriched JSON payload with `playerTags` and `search_aliases` fields

### From a Saved Roster
1. Navigate to any saved roster
2. Click the **"Generate Tags"** button (yellow icon)
3. Wait for the AI to process (shows "Generating..." with spinner)
4. Success indicator shows "Tags Generated!" with checkmark
5. Tags are saved to the roster data

### Exporting to Iconik
When you sync a roster to Iconik, the export now includes TWO metadata fields:

1. **Roster Field** (`teamName` slug)
   - Drop-down field with all player names
   - Same as before

2. **Search Aliases Field** (`search_aliases`) - **NEW!**
   - Text field mapping player names to their tags
   - Improves search and discoverability in your MAM

Example Iconik export:
```json
{
  "rosterField": {
    "name": "los-angeles-lakers",
    "label": "Los Angeles Lakers",
    "options": [
      { "label": "LeBron James", "value": "LeBron James" }
    ]
  },
  "searchAliasesField": {
    "name": "search_aliases",
    "label": "Los Angeles Lakers - Search Aliases",
    "description": "Search aliases (nicknames, misspellings, jersey numbers) for improved findability",
    "options": [
      {
        "label": "LeBron James",
        "value": "King James, Bron, LBJ, #23, #6, LAL, Lebron"
      }
    ]
  }
}
```

## Data Structure

### Updated `Player` Interface
```typescript
interface Player {
    name: string;
    position: string;
    tags?: string[]; // NEW: Search aliases for MAM findability
}
```

### Updated `ExtractionResult` Interface
```typescript
interface ExtractionResult {
    teamName: string;
    sport: string;
    players: Player[];
    verifiedSources: string[];
    verificationNotes: string;
    playerTags?: Record<string, string[]>; // NEW: Tags for all players
    meta?: {
        model: string;
        totalTokens: number;
        promptTokens: number;
        candidatesTokens: number;
        latencyMs: number;
    };
}
```

## Testing

Run the test file to verify tag generation:

```bash
# Option 1: Run in Node (requires ts-node)
npx ts-node test-tags.ts

# Option 2: Import and use in browser console
import { testTagGeneration } from './test-tags';
await testTagGeneration();
```

Expected output:
```
🚀 Starting Tag Generation Test...
📋 Generating tags for 5 players...
📍 Team: NBA All-Stars
🏀 Sport: Basketball

✅ Tags Generated Successfully!
⏱️  Duration: 3.45s

📊 Results:
{
  "LeBron James": ["King James", "Bron", "LBJ", "#23", "#6", ...],
  ...
}

🔍 Verification:
✓ Players processed: 5/5
✓ LeBron James: 7 tags
...
```

## Error Handling

The system gracefully handles errors:

1. **Auto-generation failure**: If tag generation fails during extraction, the roster is still displayed without tags
2. **Manual generation failure**: User is alerted with a descriptive error message
3. **API errors**: Proper error messages for 403, 400, 429, 503 status codes

## Performance

- **Average time**: 2-5 seconds for 10-20 players
- **Concurrent**: Tag generation runs in parallel with UI updates
- **Non-blocking**: Auto-generation doesn't delay roster display

## Benefits

✅ **Improved Search**: Users can find athletes by nicknames, misspellings, jersey numbers  
✅ **Better UX**: Faster asset retrieval in MAM systems  
✅ **Automatic**: Tags generated automatically on extraction  
✅ **Flexible**: Can regenerate tags anytime  
✅ **MAM-Ready**: Exports directly to Iconik metadata field  

## Files Modified

- `types.ts` - Added `tags` field to Player interface, `playerTags` to ExtractionResult
- `services/geminiService.ts` - Added `TAGS_SYSTEM_INSTRUCTION` and `generatePlayerTags` function
- `services/iconikFormatter.ts` - Updated to export `search_aliases` field
- `components/Dashboard.tsx` - Auto-generates tags after extraction
- `components/RosterPage.tsx` - Added "Generate Tags" button
- `components/Workspace.tsx` - Updated to handle new formatter structure
- `test-tags.ts` - Test file for tag generation

## Future Enhancements

- [ ] Bulk tag editing UI
- [ ] Custom tag addition per player
- [ ] Tag verification/approval workflow
- [ ] Analytics on most common tags
- [ ] Export tags to CSV

---

**Questions?** Check the main README or open an issue!
