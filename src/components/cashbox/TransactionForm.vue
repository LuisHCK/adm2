<template>
    <b-modal
        :active="isOpen"
        @close="onClose"
        has-modal-card
        trap-focus
        :destroy-on-hide="false"
        aria-role="dialog"
        aria-modal
    >
        <form action="">
            <div class="modal-card" style="width: auto">
                <header class="modal-card-head">
                    <p class="modal-card-title">Nueva Transacción</p>
                    <button
                        type="button"
                        class="delete"
                        @click="$emit('close')"
                    />
                </header>
                <section class="modal-card-body">
                    <b-field label="Email">
                        <b-input
                            type=""
                            placeholder="Your email"
                            required
                        >
                        </b-input>
                    </b-field>
                </section>
                <footer class="modal-card-foot">
                    <button
                        class="button"
                        type="button"
                        @click="$emit('close')"
                    >
                        Cancelar
                    </button>
                    <button class="button is-primary">
                        Guardar
                    </button>
                </footer>
            </div>
        </form>
    </b-modal>
</template>

<script>
export default {
    name: 'transaction-form',

    props: {
        isOpen: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            form: {}
        }
    },

    methods: {
        onClose() {
            this.$emit('on-close')
        }
    }
}
</script>

<style lang="scss" scoped></style>
