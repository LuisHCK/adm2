/**
 * Customer
 * @typedef Customer
 * @type {Object}
 * @proptery {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone_number
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef CashBoxLog
 * @type {Object}
 * @property {Number} id
 * @property {Number} amount
 * @property {String} concept
 * @property {('add'|'subtract'|'close'|'balance')} type
 * @property {String} reference
 * @property {String} notes
 * @property {Number} user_id
 * @property {String} date
 * @property {String} created_at
 * @property {String} updated_at
 */

/**
 * @typedef Sale
 * @type {Object}
 * @property {number} id
 * @proptery {number} inventory_product_id
 * @proptery {number} quantity
 * @proptery {number} user_id
 * @proptery {number} customer_id
 * @proptery {'credit' | 'cash'} sale_type
 * @proptery {'total' | 'partial' | undefined} refund_type
 * @proptery {string} created_at
 * @proptery {string} updated_at
 */
