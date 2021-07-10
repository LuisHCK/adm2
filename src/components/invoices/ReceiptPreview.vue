<template>
    <div class="ReceiptPreview" id="receipt-preview">
        <div class="has-text-centered has-text-weight-bold is-size-6 mb-3">
            {{ store.name }}
        </div>

        <div class="has-text-centered">
            <div v-text="store.address" />
            <div v-text="store.phone" />
            <div v-text="store.legal_id" />
        </div>

        <div class="has-text-centered receipt-heading pt-2 pb-2 mt-2 mb-1">
            <span class="is-size-5 has-text-weight-bold">
                Recibo de compra
            </span>
            <br />
            <span class="is-size-6"> #{{ invoiceFormatId(sale.id) }} </span>
        </div>

        <div class="receipt-table-wrapper mt-4">
            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>PROD</th>
                        <th class="has-text-right">PREC</th>
                        <th class="has-text-right">DESC</th>
                        <th class="has-text-right">SUB TOT</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in sale.shoppingCart"
                        :key="'sale-item-' + item.inventoryProduct.id"
                    >
                        <td>
                            {{ item.quantity }}x
                            {{ getProductName(item.inventoryProduct) }}
                        </td>
                        <td class="has-text-right">
                            {{ item.inventoryProduct.price | money }}
                        </td>
                        <td class="has-text-right">
                            {{ Number(item.discounted || 0) | money }}
                        </td>
                        <td class="has-text-right">
                            {{
                                (item.subTotal - Number(item.discounted))
                                    | money
                            }}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3">
                            <span class="has-text-weight-bold">
                                TOTAL
                            </span>
                        </td>
                        <td class="has-text-right">
                            <span class="has-text-weight-bold">
                                {{ Number(sale.total) | money }}
                            </span>
                        </td>
                    </tr>
                    <tr class="payment-row">
                        <td colspan="3">
                            EFECTIVO
                        </td>
                        <td class="has-text-right">
                            <span>
                                <template v-if="sale.pay_with">
                                    {{ Number(sale.pay_with) | money }}
                                </template>
                                <template v-else>
                                    --
                                </template>
                            </span>
                        </td>
                    </tr>
                    <tr class="change-row">
                        <td colspan="3">
                            CAMBIO
                        </td>
                        <td class="has-text-right">
                            <span>
                                <template v-if="sale.pay_with && sale.total">
                                    {{
                                        (Number(sale.pay_with) -
                                            Number(sale.total))
                                            | money
                                    }}
                                </template>
                                <template v-else>
                                    --
                                </template>
                            </span>
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div class="has-text-centered footer-message p-4 mt-4">
                <span class="is-size-5">
                    {{
                        posSettings
                            ? posSettings.invoice_message
                            : '¡Gracias por su compra!'
                    }}
                </span>
            </div>

            <div class="has-text-centered">
                <svg id="saleBarcode" />
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import JsBarcode from 'jsbarcode'
import { getSettings } from '@/controllers/settings'
import { invoiceFormatId } from '@/reports/invoice'

export default {
    name: 'receipt-preview',

    props: {
        sale: {
            type: Object,
            default: () => {}
        }
    },

    computed: {
        ...mapGetters(['store'])
    },

    data() {
        return {
            posSettings: {}
        }
    },

    methods: {
        getProductName(inventoryProduct) {
            const prod = inventoryProduct.product
            return `${prod.name} ${prod.content}${prod.unit}`
        },

        async getPosSettings() {
            const settings = await getSettings('pos')

            if (settings && settings.value) {
                this.posSettings = settings.value
            }
        },

        // Wire up external function
        invoiceFormatId
    },

    mounted() {
        this.getPosSettings()

        JsBarcode('#saleBarcode', this.sale.id, {
            displayValue: false,
            height: 35,
            lineColor: '#2c3e50'
        })
    }
}
</script>

<style lang="scss" scoped>
.ReceiptPreview {
    background-color: white;
    box-shadow: 1px -1px 12px 1px rgba(0, 0, 0, 0.322);
    padding: 24px;
    width: 320px;
    max-width: 100%;
    border-radius: 6px;

    * {
        font-size: 0.8rem;
        font-family: monospace;
    }

    .receipt-heading {
        border-top: 1px dashed gray;
        border-bottom: 1px dashed #808080;
    }

    .receipt-table-wrapper {
        width: 100%;
    }

    table.receipt-table {
        width: 100%;

        th {
            white-space: nowrap;
        }

        td,
        th {
            padding: 2px;
        }

        tr.total-row {
            border-top: 1px dashed gray;
            border-bottom: 1px dashed gray;

            td {
                padding: 8px 0px;
            }
        }
    }

    .footer-message {
        border-top: 1px dashed gray;
        border-bottom: 1px dashed gray;
    }
}
</style>
