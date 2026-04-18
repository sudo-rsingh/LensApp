import {getFilterStyle, formatDate} from '../utils/imageProcessing';

describe('getFilterStyle', () => {
  it('returns empty object for original', () => {
    expect(getFilterStyle('original')).toEqual({});
  });

  it('returns saturate filter for grayscale', () => {
    expect(getFilterStyle('grayscale')).toEqual({filter: [{saturate: 0}]});
  });

  it('returns saturate + contrast for blackwhite', () => {
    expect(getFilterStyle('blackwhite')).toEqual({
      filter: [{saturate: 0}, {contrast: 2}],
    });
  });

  it('returns contrast + brightness for enhanced', () => {
    expect(getFilterStyle('enhanced')).toEqual({
      filter: [{contrast: 1.3}, {brightness: 1.1}],
    });
  });
});

describe('formatDate', () => {
  it('returns a non-empty string for any date', () => {
    const result = formatDate(new Date('2024-06-15T10:30:00'));
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the year', () => {
    const result = formatDate(new Date('2024-06-15T10:30:00'));
    expect(result).toContain('2024');
  });
});
