import { validatePositions, suggestPositions, isSpecialConfiguration } from '../positionValidation';

describe('Position Validation', () => {
  describe('validatePositions', () => {
    it('should reject less than 2 players', () => {
      const result = validatePositions(['BTN']);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('At least 2 players are required');
    });

    it('should reject duplicate positions', () => {
      const result = validatePositions(['BTN', 'BTN']);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('unique position');
    });

    it('should accept valid heads-up configuration (BTN + BB)', () => {
      const result = validatePositions(['BTN', 'BB']);
      expect(result.isValid).toBe(true);
    });

    it('should accept partial hand scenarios for 2 players', () => {
      // These represent hands where other players folded
      const result1 = validatePositions(['UTG', 'SB']);
      expect(result1.isValid).toBe(true);

      const result2 = validatePositions(['CO', 'BB']);
      expect(result2.isValid).toBe(true);

      const result3 = validatePositions(['MP', 'HJ']);
      expect(result3.isValid).toBe(true);
    });

    it('should allow partial hand scenarios without button', () => {
      // These represent mid-hand scenarios where button folded
      const result = validatePositions(['UTG', 'SB', 'BB']);
      expect(result.isValid).toBe(true);
      
      const result2 = validatePositions(['MP', 'CO', 'SB']);
      expect(result2.isValid).toBe(true);
    });

    it('should require at least one blind when button is present', () => {
      const result = validatePositions(['UTG', 'CO', 'BTN']);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('require at least one blind position');
    });

    it('should accept valid multi-player configurations', () => {
      const valid3Player = validatePositions(['BTN', 'SB', 'BB']);
      expect(valid3Player.isValid).toBe(true);

      const valid6Player = validatePositions(['MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']);
      expect(valid6Player.isValid).toBe(true);

      const valid9Player = validatePositions(['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']);
      expect(valid9Player.isValid).toBe(true);
    });

    it('should reject invalid position names', () => {
      const result = validatePositions(['BTN', 'SB', 'INVALID']);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid position(s): invalid');
    });

    it('should be case insensitive', () => {
      const result = validatePositions(['btn', 'BB']);
      expect(result.isValid).toBe(true);
    });
  });

  describe('suggestPositions', () => {
    it('should suggest correct positions for different player counts', () => {
      expect(suggestPositions(2)).toEqual(['BTN', 'BB']);
      expect(suggestPositions(3)).toEqual(['BTN', 'SB', 'BB']);
      expect(suggestPositions(6)).toEqual(['MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']);
      expect(suggestPositions(9)).toEqual(['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB']);
    });

    it('should return empty array for invalid player counts', () => {
      expect(suggestPositions(0)).toEqual([]);
      expect(suggestPositions(10)).toEqual([]);
    });
  });

  describe('isSpecialConfiguration', () => {
    it('should identify special configurations', () => {
      expect(isSpecialConfiguration(['UTG', 'SB'])).toBe(true); // Missing BB
      expect(isSpecialConfiguration(['CO', 'BB'])).toBe(true); // Missing BTN
      expect(isSpecialConfiguration(['MP', 'HJ'])).toBe(true); // Missing both BTN and blinds
    });

    it('should not flag standard configurations as special', () => {
      expect(isSpecialConfiguration(['BTN', 'BB'])).toBe(false);
      expect(isSpecialConfiguration(['BTN', 'SB', 'BB'])).toBe(false);
      expect(isSpecialConfiguration(['CO', 'BTN', 'SB', 'BB'])).toBe(false);
    });
  });
});