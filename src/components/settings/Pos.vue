<template>
    <div class="column is-full-mobile">
        <div class="column is-half">
            <b-field
                label="Mostar facutra al finalizar"
                message="Cuando se complete una venta, mostrar la factura en un popup"
            >
                <b-switch
                    :value="store.disable_invoice_popup"
                    @input="handleInvoicePopup"
                />
            </b-field>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'pos',

    computed: {
        ...mapState(['store'])
    },

    methods: {
        handleInvoicePopup(value) {
            this.$store.commit('SET_STORE', {
                ...this.store,
                disable_invoice_popup: value
            })
        }
    }
}
</script>
