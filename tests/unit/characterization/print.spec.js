import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/reports/invoice', () => ({
    printInvoice: vi.fn(() => '<html><body>receipt</body></html>'),
    invoiceFormatId: id => String(id).padStart(6, '0'),
}))

import { printInvoice } from '@/reports/invoice'
import {
    getPrintersList,
    printContentent,
    receiptPrint,
} from '../../../src/lib/print'

let printWindow

const makePrintWindow = () => ({
    document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
        readyState: 'complete',
    },
    focus: vi.fn(),
    print: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
})

beforeEach(() => {
    vi.useFakeTimers()
    printWindow = makePrintWindow()
    globalThis.open = vi.fn(() => printWindow)
})

afterEach(() => {
    vi.useRealTimers()
    delete globalThis.open
    vi.clearAllMocks()
})

describe('web print adapter', () => {
    it('writes the template and triggers the browser print dialog', () => {
        printContentent('<html><body>hello</body></html>')

        expect(printWindow.document.write).toHaveBeenCalledWith(
            '<html><body>hello</body></html>',
        )

        vi.runAllTimers()

        expect(printWindow.focus).toHaveBeenCalled()
        expect(printWindow.print).toHaveBeenCalled()
    })

    it('closes the window after printing', () => {
        printContentent('<html></html>')

        const afterPrint = printWindow.addEventListener.mock.calls.find(
            ([event]) => event === 'afterprint',
        )

        expect(afterPrint).toBeTruthy()
        afterPrint[1]()
        expect(printWindow.close).toHaveBeenCalled()
    })

    it('prints a sale through the invoice template', () => {
        const sale = { id: 7 }

        receiptPrint(sale)

        expect(printInvoice).toHaveBeenCalledWith(sale)
        expect(printWindow.document.write).toHaveBeenCalledWith(
            '<html><body>receipt</body></html>',
        )
    })

    it('handles a blocked popup', () => {
        globalThis.open = vi.fn(() => null)
        const callback = vi.fn()

        printContentent('<html></html>', '', '', callback)

        expect(callback).toHaveBeenCalled()
        expect(printWindow.print).not.toHaveBeenCalled()
    })

    it('cannot enumerate printers in the browser', () => {
        expect(getPrintersList()).toEqual([])
    })
})
