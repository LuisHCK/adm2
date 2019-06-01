export default class Maths {
  /**
   * Calculate X percentaje of Y number
   * @param {Number} percent Percentaje amount %
   * @param {Number} number Number to get the percentaje
   */
  static percentOfNum(percent, number) {
    return (percent * number) / 100
  }
}
