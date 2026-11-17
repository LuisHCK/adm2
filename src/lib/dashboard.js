import { formatDate } from './datetime'

/**
 * Build the dashboard sales chart data.
 * @param {Date[]} dates Dates oldest → newest
 * @param {Array<Array<Object>>} salesByDate Sales for each date, in the same order
 * @returns {{labels: string[], datasets: Array<Object>}}
 */
export function buildSalesGraph(dates, salesByDate) {
    const labels = dates.map(date => formatDate(date, 'EEE d MMM'))

    const datasets = [
        {
            label: 'Ventas al contado',
            borderColor: '#90CAF9',
            fill: false,
            pointRadius: 5,
            pointBackgroundColor: '#64B5F6',
            data: [],
        },
        {
            label: 'Ventas al crédito',
            borderColor: '#ef9a9a',
            fill: false,
            pointRadius: 5,
            pointBackgroundColor: '#e57373',
            data: [],
        },
    ]

    salesByDate.forEach(sales => {
        datasets[0].data.push(
            sales.filter(sale => sale.sale_type === 'cash').length,
        )
        datasets[1].data.push(
            sales.filter(sale => sale.sale_type === 'credit').length,
        )
    })

    return { labels, datasets }
}
