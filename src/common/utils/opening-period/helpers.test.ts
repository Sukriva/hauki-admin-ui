/// <reference types="jest" />

import weekdaySpansToText from './helpers';

describe.only('Opening-period helpers', () => {
  describe.only('Opening-period helpers', () => {
    it('converts list of numbers to consecutive number sets', () => {
      expect(weekdaySpansToText([], 'fi')).toEqual('');
      expect(weekdaySpansToText([1, 3, 4], 'fi')).toEqual('ma, ke - to');
      expect(weekdaySpansToText([1, 3], 'fi')).toEqual('ma, ke');
      expect(weekdaySpansToText([1, 2, 3, 4, 5], 'fi')).toEqual('ma - pe');
    });
  });
});
