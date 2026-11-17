import { describe, expect, it, vi } from 'vitest'
import EventBus, { setBuefy } from '../../../src/event-bus'

describe('event bus', () => {
    it('subscribes, emits a payload, and unsubscribes', () => {
        const handler = vi.fn()

        EventBus.$on('TEST_EVENT', handler)
        EventBus.$emit('TEST_EVENT', { value: 1 })

        expect(handler).toHaveBeenCalledWith({ value: 1 })

        EventBus.$off('TEST_EVENT', handler)
        EventBus.$emit('TEST_EVENT', { value: 2 })

        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('exposes the installed Buefy programmatic APIs', () => {
        setBuefy({
            dialog: { confirm: vi.fn() },
            toast: { open: vi.fn() },
            snackbar: { open: vi.fn() },
            loading: { open: vi.fn() },
        })

        expect(typeof EventBus.$buefy.dialog.confirm).toBe('function')
        expect(typeof EventBus.$buefy.toast.open).toBe('function')
        expect(typeof EventBus.$buefy.snackbar.open).toBe('function')
        expect(typeof EventBus.$buefy.loading.open).toBe('function')
    })
})
