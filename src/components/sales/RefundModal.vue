<template>
    <b-modal
        :active="isOpen"
        @close="closeModal"
        has-modal-card
        trap-focus
        :destroy-on-hide="false"
        aria-role="dialog"
        aria-modal
    >
        <div v-if="isOpen && sale" class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">
                    Realizar devolución:
                    <b>Venta #{{ sale.id }}</b>
                </p>
                <button type="button" class="delete" @click="closeModal" />
            </header>
            <section class="modal-card-body">
                <b-table
                    :data="sale.shoppingCart"
                    :checked-rows.sync="checkedProducts"
                    checkable
                >
                    <template>
                        <b-table-column
                            v-slot="props"
                            field="inventoryProduct"
                            label="Ubicación"
                        >
                            {{ props.row.inventoryProduct.inventory.name }}
                        </b-table-column>

                        <b-table-column
                            v-slot="props"
                            field="inventoryProduct"
                            label="Producto"
                        >
                            {{ props.row.inventoryProduct.product.name }}
                        </b-table-column>

                        <b-table-column
                            v-slot="props"
                            field="inventoryProduct"
                            label="Marca"
                        >
                            {{ props.row.inventoryProduct.product.brand }}
                        </b-table-column>

                        <b-table-column
                            v-slot="props"
                            field="inventoryProduct"
                            label="Presentación"
                        >
                            {{ props.row.inventoryProduct.product.content }}
                            {{ props.row.inventoryProduct.product.unit }}
                        </b-table-column>

                        <b-table-column
                            v-slot="props"
                            field="quantity"
                            label="Cantidad"
                        >
                            {{ props.row.quantity }}
                        </b-table-column>

                        <b-table-column
                            v-slot="props"
                            field="Subtotal"
                            label="Subtotal"
                        >
                            <b-tag
                                class="has-text-weight-bold"
                                type="is-success"
                                rounded
                            >
                                C${{ props.row.subTotal }}
                            </b-tag>
                        </b-table-column>
                    </template>
                </b-table>
            </section>
            <footer class="modal-card-foot">
                <b-button @click="closeModal">Cancelar</b-button>
                <b-button type="is-success">Aceptar</b-button>
            </footer>
        </div>
    </b-modal>
</template>

<script>
export default {
    name: 'refund-modal',

    props: {
        value: {
            type: Boolean,
            default: false
        },

        sale: {
            type: Object,
            default: () => {}
        }
    },

    data() {
        return {
            checkedProducts: []
        }
    },

    computed: {
        isOpen() {
            return this.value
        }
    },

    methods: {
        closeModal() {
            this.$emit('input', false)
            this.$emit('close')
            this.checkedProducts = []
        }
    }
}
</script>

<style lang="scss" scoped>
.modal-card {
    width: auto;
}
</style>
