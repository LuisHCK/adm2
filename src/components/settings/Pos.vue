<template>
    <div class="columns is-mobile is-multiline">
        <div class="column is-half-tablet is-full-mobile">
            <b-field
                label="Mostar recibo al finalizar"
                message="Cuando se complete una venta, mostrar el recibo en un popup"
            >
                <b-switch
                    :value="posSettings.value.show_receipt_popup"
                    @update:model-value="saveValue('show_receipt_popup', $event)"
                />
            </b-field>
        </div>

        <div class="column is-half-tablet is-full-mobile">
            <b-field
                label="Imprimir recibo automáticamente"
                message="Imprime el recibo luego de completar la venta
                (requiere configurar una impresora)"
            >
                <b-switch
                    :value="posSettings.value.auto_print_receipt"
                    @update:model-value="saveValue('auto_print_receipt', $event)"
                />
            </b-field>
        </div>

        <div class="column is-half-tablet is-full-mobile">
            <b-field
                label="Mensaje del recibo"
                message="Mensaje personalizado al final del recibo"
            >
                <b-input
                    placeholder="Ej: Gracias por su compra"
                    :value="posSettings.value.invoice_message"
                    @update:model-value="handleInput('invoice_message', $event)"
                    icon="text"
                    rounded
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
                value: {},
            },
            inputTimeout: null,
        }
    },

    methods: {
        async loadSettings() {
            this.posSettings = (await getSettings('pos')) || { value: {} }
        },

        async handleInput(name, value) {
            clearTimeout(this.inputTimeout)

            this.inputTimeout = setTimeout(() => {
                this.saveValue(name, value)
            }, 1000)
        },

        async saveValue(name, value) {
            await addOrUpdateSettings({
                name: 'pos',
                value: { ...this.posSettings.value, [name]: value },
            })
            this.loadSettings()

            this.notifySave()
        },

        notifySave() {
            this.$buefy.toast.open({
                duration: 3000,
                message: `Ajustes guardados`,
                position: 'is-bottom',
                type: 'is-success',
                queue: false,
            })
        },
    },

    mounted() {
        this.loadSettings()
    },
}
</script>
