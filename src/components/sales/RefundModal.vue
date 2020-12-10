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
                    :checked-rows.sync="checkedProducts"
                    :is-row-checkable="isCheckableRow"
                    :data="sale.shoppingCart"
                    :row-class="isRefunded"
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
                                {{ currency }}{{ props.row.subTotal }}
                            </b-tag>
                        </b-table-column>
                    </template>

                    <template slot="footer">
                        <th colspan="6" class="has-text-right">
                            TOTAL
                        </th>
                        <th>
                            <b-tag
                                class="has-text-weight-bold"
                                type="is-primary"
                                rounded
                            >
                                {{ currency }}{{ sale.total }}
                            </b-tag>
                        </th>
                    </template>
                </b-table>
            </section>
            <footer class="modal-card-foot">
                <b-button @click="closeModal" icon-left="cancel">
                    Cancelar
                </b-button>
                <b-button
                    :disabled="!checkedProducts.length"
                    type="is-success"
                    icon-left="check"
                    @click="refund"
                >
                    Aceptar
                </b-button>
            </footer>
        </div>
    </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
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
        },

        ...mapGetters(['currency'])
    },

    methods: {
        closeModal() {
            this.$emit('input', false)
            this.$emit('close')
            this.checkedProducts = []
        },

        async refund() {
            this.checkedProducts.forEach(c => {
                c.refunded = true
            })

            const refundType = this.getRefundType()

            try {
                /** Update sale */
                const updatedSubTotal = this.getUpdatedSubTotal()

                await Database.sale.update(this.sale.id, {
                    refund_type: refundType,
                    shoppingCart: this.sale.shoppingCart,
                    subTotal: updatedSubTotal,
                    total: updatedSubTotal
                })

                this.notifySuccess()

                /** Handle error */
            } catch (error) {
                this.handleError(error)
            }
        },

        getRefundType() {
            const checkedAll =
                this.checkedProducts.length === this.sale.shoppingCart.length

            const refundedAll = this.sale.shoppingCart.every(s => !!s.refunded)

            return checkedAll || refundedAll ? 'total' : 'partial'
        },

        getUpdatedSubTotal() {
            const subTotal = this.sale.shoppingCart
                .filter(s => !s.refunded)
                .reduce((prev, curr) => prev + curr.subTotal, 0)
            return subTotal
        },

        handleError(error) {
            this.$buefy.dialog.alert({
                title: 'No se pudo realizar el reembolso',
                message: `Ocurrió un error al realizar el reembolso\n Por favor intentelo nuevamente.`,
                type: 'is-danger',
                hasIcon: true,
                icon: 'alert'
            })
            console.error(error)
        },

        notifySuccess() {
            this.$buefy.toast.open({
                message: `<span class="icon has-text-white">
                            <i class="mdi mdi-check"></i>
                          </span>
                          ¡Se realizó el reembolso!`,
                type: 'is-success',
                duration: 6000
            })

            this.closeModal()

            /** Emit success event */
            this.$emit('success')
        },

        isCheckableRow(row) {
            return !row.refunded
        },

        isRefunded(row) {
            return row.refunded ? 'is-warning' : ''
        }
    }
}
</script>

<style lang="scss">
.modal-card {
    width: auto;
}

tr.is-warning {
    background-color: hsl(0, 0%, 86%);
}
</style>
