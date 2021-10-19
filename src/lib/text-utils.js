import { normalizeText } from './locale'

/**
 * Compare two strings.
 *
 * @param {string} text1
 * @param {string} text2
 */
export const compareText = (text1, text2) => {
    const source = normalizeText(String(text1).toLowerCase())
    const target = normalizeText(String(text2).toLowerCase())
    return source.search(target) !== -1
}
