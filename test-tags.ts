/**
 * Test file for tag generation functionality
 * This demonstrates how to use the generatePlayerTags function
 */

import { generatePlayerTags } from './services/geminiService';

async function testTagGeneration() {
    console.log('🚀 Starting Tag Generation Test...\n');

    // Sample test data
    const testPlayers = [
        'LeBron James',
        'Stephen Curry',
        'Kevin Durant',
        'Giannis Antetokounmpo',
        'Luka Doncic'
    ];

    const teamName = 'NBA All-Stars';
    const sport = 'Basketball';

    try {
        console.log(`📋 Generating tags for ${testPlayers.length} players...`);
        console.log(`📍 Team: ${teamName}`);
        console.log(`🏀 Sport: ${sport}\n`);

        const startTime = Date.now();
        const tags = await generatePlayerTags(testPlayers, teamName, sport);
        const duration = Date.now() - startTime;

        console.log('✅ Tags Generated Successfully!\n');
        console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s\n`);
        console.log('📊 Results:\n');
        console.log(JSON.stringify(tags, null, 2));

        // Verify results
        console.log('\n🔍 Verification:');
        const playersWithTags = Object.keys(tags).length;
        console.log(`✓ Players processed: ${playersWithTags}/${testPlayers.length}`);

        for (const [player, playerTags] of Object.entries(tags)) {
            console.log(`✓ ${player}: ${playerTags.length} tags`);
        }

        console.log('\n✅ Test completed successfully!');
        return tags;

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Example usage showing expected output format
const EXPECTED_OUTPUT_EXAMPLE = {
    "LeBron James": [
        "King James",
        "Bron",
        "LBJ",
        "#23",
        "#6",
        "LAL",
        "Lebron"
    ],
    "Stephen Curry": [
        "Steph",
        "Chef Curry",
        "#30",
        "GSW",
        "Steven Curry",
        "Wardell"
    ],
    "Kevin Durant": [
        "KD",
        "Durantula",
        "Easy Money Sniper",
        "#35",
        "#7",
        "BKN",
        "The Slim Reaper"
    ]
};

console.log('💡 Expected Output Format:');
console.log(JSON.stringify(EXPECTED_OUTPUT_EXAMPLE, null, 2));
console.log('\n');

// Uncomment to run the test:
// testTagGeneration();

export { testTagGeneration, EXPECTED_OUTPUT_EXAMPLE };
