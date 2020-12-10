<template>
    <div
        id="saleInvoice"
        style="font-family: sans-serif !important; padding: 1.5em;"
    >
        <table style="width: 100%;">
            <tbody>
                <tr>
                    <td style="vertical-align: top;">
                        <h2>Factura</h2>
                        <h3>{{ store.name }}</h3>
                        <div>{{ store.address }}</div>
                        <div>{{ store.phone }}</div>
                        <div>{{ store.legal_id }}</div>
                    </td>
                    <td style="text-align: right; vertical-align: top;">
                        <img :src="logo" style=" height: 100px; width: auto;" />
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Template -->
        <table style="width: 100%; margin-top: 1em;">
            <thead>
                <tr>
                    <th width="70%"></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="vertical-align: top;">
                        <div>
                            <b>Cliente</b>
                        </div>
                        <div>Jhon Doe</div>

                        <div style="padding-top: 0.5em;">
                            <b>Tipo de pago:</b>
                        </div>
                        <div>
                            {{
                                sale.sale_type == 'cash'
                                    ? 'Efectivo'
                                    : 'Crédito'
                            }}
                        </div>
                    </td>
                    <td style="vertical-align: top; text-align: right;">
                        <table style="width: 100%;">
                            <tbody>
                                <tr>
                                    <td style="text-align: left;">
                                        <b>Factura #:</b>
                                    </td>
                                    <td style="text-align: left;">
                                        {{ sale.id }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: left;">
                                        <b>Fecha:</b>
                                    </td>
                                    <td style="text-align: left;">
                                        {{
                                            sale.created_at
                                                | moment('DD/MM/YYYY, h:mm a')
                                        }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Products -->
        <table
            style="width: 100%; border-collapse: collapse; margin-top: 2.5em;"
        >
            <thead>
                <tr style="text-align: left;">
                    <th
                        align="right"
                        style="padding: 6px; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 10pt;"
                    >
                        Cantidad
                    </th>
                    <th
                        width="50%"
                        style="padding: 6px; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 10pt;"
                    >
                        Descripción
                    </th>
                    <th
                        align="right"
                        style="padding: 6px; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 10pt;"
                    >
                        Precio Unitario
                    </th>
                    <th
                        align="right"
                        style="padding: 6px; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 10pt;"
                    >
                        Subtotal
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="(item, index) in sale.shoppingCart"
                    :key="'item-' + index"
                >
                    <td style="padding: 6px; text-align: right;">
                        {{ item.quantity }}
                    </td>
                    <td style="padding: 6px;">
                        {{ getProductName(item.inventoryProduct) }}
                    </td>
                    <td style="padding: 6px; text-align: right;">
                        {{ currency }}{{ item.inventoryProduct.price }}
                    </td>
                    <td style="padding: 6px; text-align: right;">
                        {{ currency }}{{ item.subTotal }}
                    </td>
                </tr>
            </tbody>

            <tfoot>
                <tr style="border-top: 1px solid black;" v-if="sale.discount">
                    <td colspan="3" align="right" style="padding: 6px;">
                        <b>Descuento</b>
                    </td>
                    <td align="right" style="padding: 6px;">
                        <b> {{ currency }}{{ sale.discounted }} </b>
                    </td>
                </tr>
                <tr style="border-top: 1px solid black;">
                    <td colspan="3" align="right" style="padding: 6px;">
                        <b>TOTAL</b>
                    </td>
                    <td align="right" style="padding: 6px;">
                        <b> {{ currency }}{{ sale.total }} </b>
                    </td>
                </tr>
            </tfoot>
        </table>

        <!-- Notes -->
        <table
            style="width: 100%; border-collapse: collapse; margin-top: 2.5em;"
            v-if="sale.notes"
        >
            <tbody>
                <tr>
                    <td>
                        <b>Notas:</b>
                        {{ sale.notes }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { printContentent } from '@/lib/print'
import { mapGetters, mapState } from 'vuex'
export default {
    name: 'sale-invoice',

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

    data() {
        return {
            logo: localStorage.getItem('company_logo')
        }
    },

    methods: {
        getProductName(inventoryProduct) {
            const prod = inventoryProduct.product
            return `${prod.name}-${prod.content}${prod.unit}`
        },

        printInvoice() {
            const renderedHTML = document.getElementById('saleInvoice')
                .innerHTML
            printContentent(renderedHTML, `factura_#${this.sale.id}`)
            this.$emit('on-close')
        }
    },

    mounted() {
        // Wait 1sec before print
        setTimeout(() => {
            this.printInvoice()
        }, 500)
    },

    beforeDestroy() {
        console.log('Destroy')
    }
}
</script>
<style lang="scss" scoped></style>
