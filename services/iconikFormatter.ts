
import type { ExtractionResult } from '../types';

const slugify = (text: string): string => {
    if (!text) return 'unknown-team';
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

export const formatForIconik = (rosterData: ExtractionResult) => {
    const now = new Date().toISOString();

    // Defensive coding: Ensure players is an array
    const players = Array.isArray(rosterData.players) ? rosterData.players : [];
    const teamName = rosterData.teamName || "Unknown Team";

    // Main roster field
    const rosterField = {
        auto_set: true,
        date_created: now,
        date_modified: now,
        description: "Imported via RosterSync from web search",
        field_type: "drop_down",
        hide_if_not_set: false,
        is_block_field: true,
        is_warning_field: false,
        label: teamName,
        mapped_field_name: null,
        max_value: 0,
        min_value: 0,
        multi: true,
        name: slugify(teamName),
        options: players.map(player => ({
            label: player.name || "Unknown Player",
            value: player.name || "Unknown Player"
        })),
        read_only: false,
        representative: true,
        required: false,
        sortable: true,
        use_as_facet: true
    };

    // Search aliases field (only if tags are available)
    let searchAliasesField = null;
    if (rosterData.playerTags && Object.keys(rosterData.playerTags).length > 0) {
        // Create options where each player maps to their tags as comma-separated string
        const aliasOptions = players
            .filter(player => rosterData.playerTags![player.name])
            .map(player => ({
                label: player.name,
                value: rosterData.playerTags![player.name].join(', ')
            }));

        if (aliasOptions.length > 0) {
            searchAliasesField = {
                auto_set: false,
                date_created: now,
                date_modified: now,
                description: "Search aliases (nicknames, misspellings, jersey numbers) for improved findability",
                field_type: "text",
                hide_if_not_set: false,
                is_block_field: false,
                is_warning_field: false,
                label: `${teamName} - Search Aliases`,
                mapped_field_name: null,
                max_value: 0,
                min_value: 0,
                multi: false,
                name: "search_aliases",
                options: aliasOptions,
                read_only: false,
                representative: false,
                required: false,
                sortable: false,
                use_as_facet: true
            };
        }
    }

    return {
        rosterField,
        searchAliasesField
    };
};
