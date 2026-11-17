import { useAppStore } from './index'

/**
 * Minimal `vuex`-shaped helpers for legacy Options API components.
 *
 * Only the array form is used in this codebase:
 *   ...mapState(['shoppingCart', 'user'])
 *   ...mapGetters(['currency'])
 *
 * Remove once components read from the Pinia store directly.
 */
function mapKeys(keys) {
    const list = Array.isArray(keys) ? keys : Object.keys(keys)

    return list.reduce((result, key) => {
        result[key] = function mappedStoreValue() {
            return useAppStore(this.$pinia)[key]
        }
        return result
    }, {})
}

export const mapState = mapKeys
export const mapGetters = mapKeys
export const mapActions = mapKeys
