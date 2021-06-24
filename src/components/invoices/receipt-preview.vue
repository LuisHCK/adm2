<template>
    <div class="ReceiptPreview">
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
            <span>
                #00007
            </span>
        </div>

        <div class="receipt-table-wrapper mt-4">
            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>PROD</th>
                        <th class="has-text-right">PREC UNIT</th>
                        <th class="has-text-right">DESC</th>
                        <th class="has-text-right">SUB TOT</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1x Soda 14ml</td>
                        <td class="has-text-right">15.00</td>
                        <td class="has-text-right">0.00</td>
                        <td class="has-text-right">15.00</td>
                    </tr>
                    <tr>
                        <td>2x Chocolate 26gr</td>
                        <td class="has-text-right">22.00</td>
                        <td class="has-text-right">5.00</td>
                        <td class="has-text-right">17.00</td>
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
                                32.00
                            </span>
                        </td>
                    </tr>
                    <tr class="payment-row">
                        <td colspan="3">
                            EFECTIVO
                        </td>
                        <td class="has-text-right">
                            <span class="has-text-weight-bold">
                                100.00
                            </span>
                        </td>
                    </tr>
                    <tr class="change-row">
                        <td colspan="3">
                            CAMBIO
                        </td>
                        <td class="has-text-right">
                            <span class="has-text-weight-bold">
                                68.00
                            </span>
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div class="has-text-centered footer-message p-4 mt-4">
                <span class="is-size-5">¡Gracias por su compra!</span>
            </div>

            <div class="has-text-centered">
                <svg id="demoBarcode" />
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import JsBarcode from 'jsbarcode'

export default {
    name: 'receipt-preview',

    computed: {
        ...mapGetters(['store'])
    },

    mounted() {
        JsBarcode('#demoBarcode', '0021327', {
            displayValue: false,
            height: 35,
            lineColor: "#2c3e50",
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
