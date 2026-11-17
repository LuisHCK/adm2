<template>
    <b-modal
        v-model="isOpen"
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
                    v-model:checked-rows="checkedProducts"
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
                                {{ $money(props.row.subTotal) }}
                            </b-tag>
                        </b-table-column>
                    </template>

                    <template #footer>
                        <th colspan="6" class="has-text-right">
                            TOTAL
                        </th>
                        <th>
                            <b-tag
                                class="has-text-weight-bold"
                                type="is-primary"
                                rounded
                            >
                                {{ $money(sale.total) }}
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
import database from "@/db"
import { toPlain } from '@/lib/serialization'
import { registerCashboxLog } from '@/controllers/cashbox'
import { invoiceFormatId } from '@/reports/invoice'
import { pinia, useAppStore } from '@/store'

export default {
    name: 'refund-modal',

    emits: ['update:modelValue', 'close', 'success'],

    props: {
        modelValue: {
            type: Boolean,
            default: false
        },

        sale: {
            type: Object,
            default: () => ({})
        }
    },

    data() {
        return {
            checkedProducts: []
        }
    },

    computed: {
        isOpen: {
            get() {
                return this.modelValue
            },
            set(value) {
                this.$emit('update:modelValue', value)
            }
        }
    },

    methods: {
        closeModal() {
            this.$emit('update:modelValue', false)
            this.$emit('close')
            this.checkedProducts = []
        },

        async refund() {
            const refundedItems = [...this.checkedProducts]
            const originalTotal = Number(this.sale.total || 0)

            refundedItems.forEach(item => {
                item.refunded = true
            })

            const refundType = this.getRefundType()
            const updatedSubTotal = this.getUpdatedSubTotal()
            const refundAmount = Math.max(0, originalTotal - updatedSubTotal)

            try {
                await database.sale.update(
                    this.sale.id,
                    toPlain({
                        refund_type: refundType,
                        shoppingCart: this.sale.shoppingCart,
                        subTotal: updatedSubTotal,
                        total: updatedSubTotal,
                    }),
                )

                await this.restoreStock(refundedItems)

                if (this.sale.sale_type === 'cash' && refundAmount > 0) {
                    await this.registerCashboxRefund(refundAmount)
                }

                this.notifySuccess()
            } catch (error) {
                this.handleError(error)
            }
        },

        async restoreStock(items) {
            await Promise.all(
                items.map(async item => {
                    const inventoryProduct = item.inventoryProduct

                    if (!inventoryProduct || inventoryProduct.unlimited_stock) {
                        return
                    }

                    const current = await database.inventory_product.get(
                        inventoryProduct.id,
                    )

                    if (!current) return

                    await database.inventory_product.update(
                        current.id,
                        toPlain({
                            stock:
                                Number(current.stock || 0) +
                                Number(item.quantity || 0),
                        }),
                    )
                }),
            )
        },

        async registerCashboxRefund(amount) {
            const user = useAppStore(pinia).user
            const now = new Date().toISOString()

            await registerCashboxLog({
                amount: -Math.abs(amount),
                concept: `Reembolso venta #${this.sale.id}`,
                type: 'subtract',
                reference: `REF-${invoiceFormatId(this.sale.id)}`,
                notes: '',
                user_id: user && user.id,
                date: now,
                created_at: now,
                updated_at: now,
            })
        },

        getRefundType() {
            const checkedAll =
                this.checkedProducts.length === this.sale.shoppingCart.length

            const refundedAll = this.sale.shoppingCart.every(s => !!s.refunded)

            return checkedAll || refundedAll ? 'total' : 'partial'
        },

        getUpdatedSubTotal() {
            return this.sale.shoppingCart
                .filter(item => !item.refunded)
                .reduce(
                    (total, item) =>
                        total +
                        Number(item.subTotal || 0) -
                        Number(item.discounted || 0),
                    0,
                )
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
