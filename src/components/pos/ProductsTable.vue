<template>
    <table class="table is-fullwidth">
        <thead>
            <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Existencias</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Sub total</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in shoppingCart" :key="'ip-' + index">
                <td>{{ index + 1 }}</td>
                <td>
                    <div
                        v-text="getProductName(item.inventoryProduct.product)"
                    />
                    <small>{{ item.inventoryProduct.inventory.name }}</small>
                </td>
                <td>
                    <span v-text="item.inventoryProduct.stock" />
                </td>
                <td>
                    <input
                        :id="`qtyInput-${item.inventoryProduct.id}`"
                        :ref="`qty-input-${index}`"
                        class="quantity-input input"
                        type="number"
                        min="1"
                        :value="item.quantity || 1"
                        :max="item.inventoryProduct.stock"
                        @input="
                            emitQuantityUpdate(
                                index,
                                $event,
                                item.inventoryProduct.stock
                            )
                        "
                        @change="
                            emitQuantityUpdate(
                                index,
                                $event,
                                item.inventoryProduct.stock
                            )
                        "
                        @focus="focusSelect"
                    />
                </td>
                <td>
                    <span
                        v-text="`${currency}${item.inventoryProduct.price}`"
                    />
                </td>
                <td>
                    <span v-text="`${currency}${item.subTotal}`" />
                </td>
                <td>
                    <b-button
                        type="is-danger"
                        size="is-normal"
                        rounded
                        @click="emitRemoveItem(index)"
                    >
                        <i class="mdi mdi-delete"></i>
                    </b-button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'products-table',

    computed: {
        ...mapGetters(['currency'])
    },

    props: {
        shoppingCart: {
            type: Array,
            default: () => {
                return []
            }
        }
    },

    methods: {
        getProductName(product) {
            return `${product.name} - ${product.content} ${product.unit}`
        },

        emitQuantityUpdate(index, event, stock) {
            this.$emit('onQuantityChange', index, event, stock)
        },

        emitRemoveItem(index) {
            this.$emit('onRemoveItem', index)
        },

        focusSelect(event) {
            event.target.select()
        }
    }
}
</script>

<style lang="scss" scoped></style>
