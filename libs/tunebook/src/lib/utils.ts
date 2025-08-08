// Utility functions for tunebook data processing
// Basic utilities without external dependencies

export class TunebookUtils {
  // Simple random selection helper
  static randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Random number in range
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Basic data validation
  static isValidTuneId(id: string): boolean {
    return typeof id === 'string' && id.length > 0;
  }

  static isValidABC(abc: string): boolean {
    return typeof abc === 'string' && abc.includes('|');
  }

  // Basic string utilities
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  // Date utilities
  static formatDate(date: string | Date): string {
    return new Date(date).toISOString();
  }

  static isValidDate(date: string): boolean {
    return !isNaN(Date.parse(date));
  }
}

// Export basic types for convenience
export interface BasicStats {
  total: number;
  byType?: Record<string, number>;
  byYear?: Record<string, number>;
}

export function calculateStats<T extends Record<string, any>>(
  items: T[],
  groupBy?: keyof T
): BasicStats {
  const stats: BasicStats = {
    total: items.length,
  };

  if (groupBy) {
    stats.byType = {};
    items.forEach(item => {
      const value = String(item[groupBy] || 'unknown');
      stats.byType![value] = (stats.byType![value] || 0) + 1;
    });
  }

  return stats;
}

// Default export
export default TunebookUtils;
