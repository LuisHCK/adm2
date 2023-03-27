<template>
    <b-modal
        :active="show"
        has-modal-card
        trap-focus
        :destroy-on-hide="false"
        aria-role="dialog"
        aria-label="Example Modal"
        close-button-aria-label="Close"
        aria-moda
    >
        <receipt-preview :sale="sale" />
    </b-modal>
</template>

<script>
import ReceiptPreview from './ReceiptPreview.vue'

export default {
    name: 'invoice-modal',

    components: { ReceiptPreview },

    props: {
        sale: { type: Object, default: () => ({}) },
        show: { type: Boolean, default: false },
    },
}
</script>
