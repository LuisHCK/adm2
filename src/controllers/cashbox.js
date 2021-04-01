import database from '../db'
import * as moment from 'moment'
import renderReport from '../reports/generic-report'
import store from '../store'

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
 * Get a list of CashBox logs filtered by date or current cut
 * @param {Object} options Optional date filter object
 * @param {string} options.start_date Any valid date type
 * @param {string} options.finish_date Any valid date type
 * @param {string} options.reference Log reference
 * @param {number} options.limit Limit of results
 * @returns {CashBoxLog[]}
 */
export const getCashBoxLogs = async ({
    start_date,
    finish_date,
    reference,
    limit
} = {}) => {
    let query = database.cash_box

    // Check if start date and finish date is present
    if (start_date && finish_date) {
        query = query.where('date').between(start_date, finish_date, true, true)

        // Check if any limit value is given
        if (limit) {
            query = filtered_data.limit(limit)
        }

        // This is the default return
    } else {
        // Fetch the latest cashbox close and start filtering from it
        const latestLogClose = (await getLastCashBoxClose()) || {
            date: new Date('1970-01-01Z00:00:00:000').toISOString()
        }

        query = query.where('date').aboveOrEqual(latestLogClose.date)
    }

    return query
        .reverse() // Show newest first
        .toArray()
        .then(async data => {
            await Promise.all(
                data.map(async log => {
                    // Get only needed values
                    const { id, name } = await database.user.get(log.user_id)
                    log.created_by = { id, name }
                })
            )
            return data
        })
}

/**
 * Search a log by concept or ref
 * @param {string} searchValue Search value
 * @returns {CashBoxLog[]}
 */
export const searchCashBoxLog = async searchValue => {
    let query = database.cash_box

    return query
        .filter(log => {
            const search = searchValue.toLowerCase().trim()
            const concept = log.concept ? log.concept.toLowerCase() : ''
            const ref = log.reference ? log.reference.toLowerCase() : ''

            // Perform the comparation
            return search && (concept.includes(search) || ref.includes(search))
        })
        .reverse()
        .toArray()
        .then(async data => {
            await Promise.all(
                data.map(async log => {
                    // Get only needed values
                    const { id, name } = await database.user.get(log.user_id)
                    log.created_by = { id, name }
                })
            )
            return data
        })
}

/**
 * Register a new cashbox log
 * @returns {Promise<Number>}
 * @param {CashBoxLog} data
 */
export const registerCashboxLog = async data => {
    return await database.cash_box.add(data)
}

/**
 * Returns latest cashbox log if exists
 * @returns {CashBoxLog | null}
 */
export const getLastCashBoxClose = async () => {
    const log = await database.cash_box
        .where('type')
        .equals('close')
        .last()

    return log
}

/**
 * Return the current amount of money in cash box
 * @returns {Number}
 */
export const getMoneyInCashBox = async () => {
    const latestLogClose = (await getLastCashBoxClose()) || {
        date: new Date('1970-01-01Z00:00:00:000').toISOString()
    }

    const logTypes = ['add', 'subtract', 'balance']

    const query = await database.cash_box
        .where('date')
        .aboveOrEqual(latestLogClose.date)
        .and(log => logTypes.includes(log.type))
        .toArray()

    return query.reduce((prev, next) => prev + next.amount, 0)
}

/**
 * Generates a reference code for
 * @param {('sale'|'close'|'subtract'|'balance')} type Type of transaction
 * @param {string} value Value to concatenate
 * @returns {string} Uppercased reference
 */
export const cashBoxRefGen = (type, value) => {
    let prefix = ''

    switch (type) {
        case 'sale':
            prefix = 'VENT'
            break

        case 'close':
            prefix = 'CIER'
            break

        case 'subtract':
            prefix = 'RETR'
            break

        case 'balance':
            prefix = 'SALD'
            break

        default:
            prefix = 'INVL'
            break
    }

    return `${prefix}-${value}`.toUpperCase()
}

/**
 * Generates formated date string
 * @param {Date | string} date Date value to convert
 * @returns {string} Formated string
 */
export const cashBoxDateFormat = date => {
    return moment(date).format('DDMMYYhmma')
}

/**
 * Return the log type
 * @param {('add'|'subtract'|'close','balance')} type
 * @returns {{label: string, className:string}} logType
 */
export const getLogType = type => {
    switch (type) {
        case 'add':
            return {
                label: 'Ingreso',
                className: 'is-success'
            }

        case 'subtract':
            return {
                label: 'Egreso',
                className: 'is-warning'
            }

        case 'close':
            return {
                label: 'Cierre',
                className: 'is-danger'
            }

        case 'balance':
            return {
                label: 'Saldo',
                className: 'is-info'
            }

        default:
            return {
                label: 'Tipo inválido',
                className: 'is-dark'
            }
    }
}

/**
 *
 * @param {CashBoxLog[]} cashboxLog
 */
export const printChashboxReport = cashboxLog => {
    const title = 'Reporte de caja'
    const currency = store.getters.currency
    const shop = { ...store.getters.store }

    const columns = [
        { label: '#', value: 'id' },
        { label: 'Cantidad', value: 'amount' },
        { label: 'Cantidad', value: 'type' },
        { label: 'Concepto', value: 'concept' },
        { label: 'Referencia', value: 'reference' },
        { label: 'Creado por', value: 'created_by_name' },
        { label: 'Fecha', value: 'date' }
    ]

    const data = cashboxLog.map(log => {
        log.created_by_name = log.created_by.name
        log.amount = `${currency}${log.amount}`
        log.type = getLogType(log.type).label

        return { ...log }
    })

    renderReport({ columns, data, shop, title })
}
