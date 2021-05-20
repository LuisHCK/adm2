import database from '../db'

/**
 *
 * @param {number | string} productId Product inique id
 * @returns {Promise} Product promise
 */
export const getProductById = async productId => {
    const product = await database.product.get(productId)
    return product
}
