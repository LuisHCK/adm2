<template>
    <div class="sale-details">
        <div class="columns">
            <div class="column">
                <strong class v-text="getCompanyName" />
                <div>{{ sale.created_at | moment('MMM DD YYYY, h:mm a') }}</div>
            </div>
            <div class="column">
                <div class="has-text-right">
                    <h1 class="is-size-3 has-text-weight-bold">
                        Factura de venta
                    </h1>
                    <div>
                        Cantidad de artículos: {{ sale.shoppingCart.length }}
                    </div>
                    <div>
                        Cliente:
                        <span v-text="sale.customer.name"></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Ubicación/Inventario</th>
                        <th>Nombre</th>
                        <th>Código</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Descuento</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                        v-for="(item, i) in sale.shoppingCart"
                        :key="`itm-${i}`"
                    >
                        <td v-text="item.inventoryProduct.inventory.name"></td>
                        <td v-text="getProductName(item.inventoryProduct)"></td>
                        <td v-text="item.inventoryProduct.product.codebar"></td>
                        <td v-text="item.quantity"></td>
                        <td
                            v-text="`${currency}${item.inventoryProduct.price}`"
                        ></td>
                        <td>
                            <span v-if="item.discount && item.discounted">
                                {{ currency }}{{ item.discounted || 0 }}
                            </span>
                            <span v-else>
                                --
                            </span>
                        </td>
                        <td>
                            <span v-if="item.discount && item.discounted">
                                {{ currency
                                }}{{ item.subTotal - item.discounted }}
                            </span>
                            <span v-else>
                                {{ currency }}{{ item.subTotal }}
                            </span>
                        </td>
                    </tr>
                </tbody>

                <tfoot>
                    <tr>
                        <td colspan="6" class="has-text-right">
                            <strong class="is-size-5">TOTAL</strong>
                        </td>
                        <td>
                            <strong
                                v-text="`${currency}${sale.total}`"
                                class="is-size-5"
                            ></strong>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
    name: 'sale-details',

    props: {
        sale: {
            type: Object,
            default: () => {}
        }
    },

    computed: {
        ...mapState(['store']),

        ...mapGetters(['currency']),

        // Get name
        getCompanyName() {
            if (this.store && this.store.name) {
                return this.store.name
            } else {
                return 'ADM2'
            }
        }
    },

    methods: {
        getProductName(inventoryProduct) {
            const prod = inventoryProduct.product
            return `${prod.name} - ${prod.brand} - ${prod.content}${prod.unit}`
        }
    }
}
</script>

<style lang="scss" scoped></style>
