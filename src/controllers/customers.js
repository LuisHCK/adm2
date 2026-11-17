import database from '../db'
import '@/types'

/**
 * Get a customer by ID
 * @param {string} id Unique customer id
 * @returns {Customer} Customer instance
 */
export const getCustomerById = async id => {
    return await database.customer.get(id)
}

/**
 * Return all customers
 * @returns {Customer[]} Array of customers
 */
export const getAllCustomers = async () => {
    return await database.customer.toArray()
}

/**
 * Return the total of credit by employee
 * @param {string | number} id Customer unique id
 * @returns {number} Current customer credit
 */
export const getCustomerCredit = async id => {
    const sales = await database.sale
        .where({ customer_id: id, sale_type: 'credit' })
        .toArray()

    return sales.reduce((total, sale) => total + Number(sale.total || 0), 0)
}

/**
 * Return all customer payments
 * @param {number} id Customer id
 */
export const getCustomerPayments = id =>
    database.customer_payment.where({ customer_id: id })
