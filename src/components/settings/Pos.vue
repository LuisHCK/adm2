<template>
    <div class="columns is-mobile is-multiline">
        <div class="column is-half">
            <b-field
                label="Mostar factura al finalizar"
                message="Cuando se complete una venta, mostrar la factura en un popup"
            >
                <b-switch
                    :value="posSettings.value.show_invoice_popup"
                    @input="handleSwitch($event, 'show_invoice_popup')"
                />
            </b-field>
        </div>

        <div class="column is-half">
            <b-field
                label="Imprimir factura automáticamente"
                message="Imprime la factura luego de completar la venta (requiere configurar una impresora)"
            >
                <b-switch
                    :value="posSettings.value.auto_print_invoice"
                    @input="handleSwitch($event, 'auto_print_invoice')"
                />
            </b-field>
        </div>

        <div class="column is-full">
            <div class="mb-5">
                <b-field label="Diseño de factura">
                    <b-select
                        placeholder="Seleccione un diseño"
                        :value="posSettings.value.invoice_design || ''"
                        @input="handleinvoiceDesign"
                        rounded
                    >
                        <option value="full-page">
                            Página completa
                        </option>

                        <option value="text-only">
                            Recibo sencillo
                        </option>
                    </b-select>
                </b-field>
            </div>

            <template v-if="posSettings.value.invoice_design === 'full-page'">
                <large-invoice-preview />
            </template>

            <template v-if="posSettings.value.invoice_design === 'text-only'">
                <receipt-preview />
            </template>
        </div>
    </div>
</template>

<script>
import { addOrUpdateSettings, getSettings } from '@/controllers/settings'
import LargeInvoicePreview from '@/components/invoices/large-invoice-preview.vue'
import ReceiptPreview from '@/components/invoices/receipt-preview.vue'

export default {
    name: 'pos',

    components: {
        LargeInvoicePreview,
        ReceiptPreview
    },

    data() {
        return {
            posSettings: {
                value: {}
            }
        }
    },

    methods: {
        async loadSettings() {
            this.posSettings = (await getSettings('pos')) || { value: {} }
        },

        async handleSwitch(value, name) {
            await addOrUpdateSettings({
                name: 'pos',
                value: { ...this.posSettings.value, [name]: value }
            })
            this.loadSettings()
        },

        async handleinvoiceDesign(value) {
            await addOrUpdateSettings({
                name: 'pos',
                value: {
                    ...this.posSettings.value,
                    invoice_design: value
                }
            })
            this.loadSettings()
        }
    },

    mounted() {
        this.loadSettings()
    }
}
</script>
