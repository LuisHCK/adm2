import database from '../db'

/**
 * @typedef CashBoxLog
 * @type {Object}
 * @property {Number} id
 * @property {Number} amount
 * @property {String} concept
 * @property {('add'|'subtract'|'close')} type
 * @property {String} reference
 * @property {String} notes
 * @property {Number} user_id
 * @property {String} date
 * @property {String} created_at
 * @property {String} updated_at
 */

/**
 * Get a list of cashbox
 * @returns {Promise<Array<CashBoxLog>>}
 */
export const getCashBoxLogs = async () => {
    const latestLogClose = (await getLastCashBoxClose()) || {
        date: new Date('1970-01-01Z00:00:00:000').toISOString()
    }

    return database.cash_box
        .where('date')
        .aboveOrEqual(latestLogClose.date)
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

    const query = await database.cash_box
        .where('date')
        .aboveOrEqual(latestLogClose.date)
        .and(log => log.type === 'add' || log.type === 'subtract')
        .toArray()

    return query.reduce((prev, next) => prev + next.amount, 0)
}
