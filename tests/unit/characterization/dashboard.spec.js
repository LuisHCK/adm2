import { describe, expect, it } from 'vitest'
import { buildSalesGraph } from '../../../src/lib/dashboard'

describe('buildSalesGraph', () => {
    const dates = [new Date(2024, 0, 1), new Date(2024, 0, 2)]

    it('builds one label per date', () => {
        const graph = buildSalesGraph(dates, [[], []])

        expect(graph.labels).toHaveLength(2)
        expect(graph.datasets).toHaveLength(2)
    })

    it('counts cash and credit sales per day in order', () => {
        const graph = buildSalesGraph(dates, [
            [{ sale_type: 'cash' }],
            [
                { sale_type: 'cash' },
                { sale_type: 'credit' },
                { sale_type: 'credit' },
            ],
        ])

        expect(graph.datasets[0].data).toEqual([1, 1])
        expect(graph.datasets[1].data).toEqual([0, 2])
    })

    it('handles empty days', () => {
        const graph = buildSalesGraph(dates, [[], []])

        expect(graph.datasets[0].data).toEqual([0, 0])
        expect(graph.datasets[1].data).toEqual([0, 0])
    })
})
