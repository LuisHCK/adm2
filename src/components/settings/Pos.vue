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
    </div>
</template>

<script>
import { addOrUpdateSettings, getSettings } from '@/controllers/settings'

export default {
    name: 'pos',

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
        }
    },

    mounted() {
        this.loadSettings()
    }
}
</script>
