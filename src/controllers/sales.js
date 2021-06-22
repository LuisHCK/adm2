import database from '@/db'
import '@/types'

/**
 * Get sales list by params
 * @param {Object} filters
 * @returns {Promise<Sale[]>} Promise with sale array
 */
export const getSalesWithFilters = filters => {
    return database.sale.where(filters)
}
