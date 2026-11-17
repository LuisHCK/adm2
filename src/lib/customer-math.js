/**
 * Net customer debt from a transaction list.
 * Credit sales add to the debt; payments subtract from it.
 * Cash sales and unknown types are ignored. Never returns a negative balance.
 *
 * @param {Array<{type: string, total: number|string}>} transactions
 * @returns {number}
 */
export function calculateCustomerDebt(transactions = []) {
    const debt = transactions.reduce((total, transaction) => {
        const amount = Number(transaction.total || 0)

        if (transaction.type === 'credit') {
            return total + amount
        }

        if (transaction.type === 'payment') {
            return total + amount
        }

        return total
    }, 0)

    return Math.max(0, debt)
}
