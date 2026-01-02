export const DIFFICULTY_LEVELS = {
 EASY: { label: 'Easy', turnTimeSeconds: 60 },
 MEDIUM: { label: 'Medium', turnTimeSeconds: 30 },
 HARD: { label: 'Hard', turnTimeSeconds: 15 },
} as const;

export const DEFAULT_BOARD_CONFIG = {
 rows: 6,
 columns: 7,
 connectCount: 4,
};

export const BOARD_LIMITS = {
 minRows: 4,
 maxRows: 20,
 minColumns: 4,
 maxColumns: 20,
 minConnect: 3,
 maxConnect: 10,
};
