
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

    return {
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
};
