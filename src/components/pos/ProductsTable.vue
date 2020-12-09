<template>
    <table class="table is-fullwidth">
        <thead>
            <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Existencias</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Descuento</th>
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
                    <span
                        v-text="`${currency}${item.inventoryProduct.price}`"
                    />
                </td>

                <td width="130px">
                    <input
                        :id="`qtyInput-${item.inventoryProduct.id}`"
                        :ref="`qty-input-${index}`"
                        class="quantity-input input is-rounded"
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

                <td width="130px">
                    <b-field>
                        <b-numberinput
                            :controls="false"
                            :max="100"
                            :min="0"
                            :value="item.inventoryProduct.discount"
                            @input="emitDiscountChange($event, index)"
                            rounded
                        />
                    </b-field>
                </td>

                <td>
                    <span v-text="`${currency}${item.subTotal}`" />
                </td>
                <td style="text-align: center">
                    <b-button
                        type="is-danger"
                        size="is-small"
                        @click="emitRemoveItem(index)"
                        rounded
                        icon-left="delete"
                    />
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import { mapGetters } from 'vuex'

let discountTimeout

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

        emitDiscountChange(event, index) {
            clearTimeout(discountTimeout)

            discountTimeout = setTimeout(() => {
                this.$emit('onDiscountChange', {event, index})
            }, 500)
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
