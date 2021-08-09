<template>
    <div class="pos-page page-container">
        <div class="panel py-4">
            <div class="columns is-mobile">
                <div class="column is-6-desktop is-full-mobile">
                    <product-search @input="addToShoppingCart" />
                </div>
            </div>
        </div>

        <div class="columns is-mobile is-multiline">
            <div class="column is-two-thirds-desktop is-full-mobile">
                <div class="panel">
                    <h2
                        class="is-size-5-mobile is-size-4-desktop has-text-weight-bold mb-4"
                    >
                        Productos
                    </h2>
                    <products-table
                        @onQuantityChange="setInventoryProductBuyQty"
                        @onRemoveItem="removeItem"
                        @onDiscountChange="handleDiscountChange"
                    />
                </div>
            </div>

            <div class="column is-one-third-desktop is-full-mobile">
                <pos-summary
                    :shoppingCartTotal="shoppingCartTotal"
                    :shoppingCartCustomer="shoppingCartCustomer"
                    :shoppingCart="shoppingCart"
                    :finalTotal="finalTotal"
                    @changePayWith="payWith = $event"
                    @setCustomer="setCustomer"
                    @changeSaleType="saleType = $event"
                    @submit="completeSale"
                />
            </div>
        </div>

        <!-- Customer modal form -->
        <b-modal :active.sync="showCustomerForm" has-modal-card>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Agregar un nuevo Cliente</p>
                </header>
                <section class="modal-card-body">
                    <customer-form
                        v-if="showCustomerForm"
                        @input="
                            getCustomers()
                            showCustomerForm = false
                        "
                    />
                </section>
            </div>
        </b-modal>

        <!-- Successful sale invoice -->
        <b-modal
            :active.sync="showSaleInvoice"
            @close="saleInvoice = undefined"
            width="850"
            has-modal-card
        >
            <div v-if="showSaleInvoice" class="modal-card" style="width: auto">
                <header class="modal-card-head">
                    <p class="modal-card-title">Venta #{{ saleInvoice.id }}</p>
                    <b-button
                        icon-left="printer-pos"
                        type="is-primary"
                        @click="openPrintInvoice"
                    >
                        Imprimir
                    </b-button>
                </header>
                <section class="modal-card-body">
                    <div
                        v-if="saleInvoice"
                        class="is-flex is-justify-content-center is-flex-direction-column is-align-items-center"
                    >
                        <receipt-preview :sale="saleInvoice" />
                    </div>
                </section>
            </div>
        </b-modal>
    </div>
</template>

<script>
import 'vue-select/dist/vue-select.css'
import ProductSearch from '../components/pos/ProductSearch.vue'
import CustomerForm from '../components/customers/CustomerForm.vue'
import ProductsTable from '../components/pos/ProductsTable.vue'
import PosSummary from '../components/pos/PosSummary.vue'
import vSelect from 'vue-select'
import { mapState, mapGetters } from 'vuex'
import { printContentent, receiptPrint } from '@/lib/print'
import { invoiceFormatId } from '@/reports/invoice'
import { printInvoice } from '../reports/invoice'
import Maths from '../lib/maths'
import { registerCashboxLog } from '../controllers/cashbox'
import { getSettings } from '@/controllers/settings'
import ReceiptPreview from '@/components/invoices/ReceiptPreview.vue'

export default {
    components: {
        ProductSearch,
        vSelect,
        CustomerForm,
        ProductsTable,
        PosSummary,
        ReceiptPreview,
    },

    computed: {
        ...mapState(['shoppingCart', 'shoppingCartCustomer', 'user']),
        ...mapGetters(['shoppingCartTotal', 'currency']),

        totalSale() {
            return 0
        },

        finalTotal() {
            return this.shoppingCartTotal
        },

        exchange() {
            if (this.payWith) {
                return this.payWith - this.finalTotal
            } else {
                return 0
            }
        },
    },

    data() {
        return {
            quantities: [],
            discount: 0,
            payWith: undefined,
            customers: [],
            showCustomerForm: false,
            saleType: 1,
            saleInvoice: {},
            showSaleInvoice: false,
            posSettings: {},
        }
    },

    methods: {
        addToShoppingCart(inventoryProduct) {
            // Check if inventory product is in shopping cart
            let itemIndex
            const item = this.shoppingCart.find((item, index) => {
                if (item.inventoryProduct.id == inventoryProduct.id) {
                    itemIndex = index
                    return true
                }
            })

            // If items exists just increase the quantity
            if (item) {
                this.$store.commit('INCREASE_PRODUCT_SHOPPING_CART', itemIndex)
            }
            // Add the product to shopping cart
            else {
                let subTotal = inventoryProduct.price * 1

                this.$store.commit('ADD_PRODUCT_TO_SHOPPING_CART', {
                    inventoryProduct,
                    quantity: 1,
                    discount: inventoryProduct.discount || 0,
                    discounted: Maths.percentOfNum(
                        subTotal,
                        inventoryProduct.discount || 0,
                    ),
                    subTotal,
                })
            }
            setTimeout(() => {
                // Allways focus Quantity input
                document
                    .getElementById(`qtyInput-${inventoryProduct.id}`)
                    .focus()
                document
                    .getElementById(`qtyInput-${inventoryProduct.id}`)
                    .select()
            }, 100)
        },

        /**
         * Remove an item form Shopping cart
         */
        removeItem(itemIndex) {
            this.$store.commit('REMOVE_ITEM_SHOPPING_CART', itemIndex)
            this.$buefy.toast.open({
                message: 'Se quitó el producto',
                type: 'is-success',
                position: 'is-bottom',
            })
        },

        /**
         * Call muttation to add Product Buy Quantity
         */
        setInventoryProductBuyQty(index, event, stock) {
            let quantity = Number(event.target.value) || 1

            const { inventoryProduct } = this.shoppingCart[index]

            // Check maximum
            // When input quantity reach stock limit, alert to user and fix input
            if (quantity > stock && !inventoryProduct.unlimited_stock) {
                quantity = stock
                event.target.value = stock
                this.$buefy.toast.open({
                    message: 'Supera el máximo de existencias',
                    type: 'is-warning',
                    position: 'is-bottom',
                })
            }

            this.$store.commit('SET_PRODUCT_QTY_SHOPPING_CART', {
                index,
                quantity: quantity,
            })
        },

        /** Update product discount */
        handleDiscountChange({ event, index }) {
            const inventoryProduct = this.shoppingCart[index]
            this.$store.commit('SET_PRODUCT_DISCOUNT_SHOPPING_CART', {
                index,
                discount: event,
            })
        },

        cancelSale() {
            this.$store.commit('CLEAR_SHOPPING_CART')
        },

        /**
         * Set customer for of this shopping cart
         */
        setCustomer(event) {
            this.$store.commit('SET_SHOPPING_CART_CUSTOMER', event)
        },

        /**
         * Finalice shopping cart and store the info in db
         */
        async completeSale() {
            if (!this.shoppingCart.length) {
                return
            }

            const saleId = await Database.sale.add({
                shoppingCart: this.shoppingCart,
                discount: this.discount,
                customer: this.shoppingCartCustomer,
                subTotal: this.shoppingCartTotal,
                total: this.finalTotal,
                sale_type: this.saleType ? 'cash' : 'credit',
                pay_with: this.payWith,
                customer_id: this.shoppingCartCustomer.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })

            this.saleInvoice = await Database.sale.get(saleId)

            this.showToast('Se completó la venta')
            // Reduce inventory stock
            this.reduceInventoryQuantity()
            // Clear the sale form
            this.cancelSale()
            // Register cashbox log
            this.createCashBoxLog()

            // Print automatically if is enabled
            if (this.posSettings && this.posSettings.auto_print_receipt) {
                receiptPrint(this.saleInvoice)
            }
        },

        async createCashBoxLog() {
            await registerCashboxLog({
                amount: this.saleInvoice.total,
                concept: `Venta POS cont #${this.saleInvoice.id}`,
                type: 'add',
                reference: `VENT-${invoiceFormatId(this.saleInvoice.id)}`,
                notes: '',
                user_id: this.user.id,
                date: this.saleInvoice.created_at,
            })
        },

        reduceInventoryQuantity() {
            this.shoppingCart.map(item => {
                if (!item.inventoryProduct.unlimited_stock) {
                    const totalStock =
                        item.inventoryProduct.stock - item.quantity
                    Database.inventory_product.update(
                        item.inventoryProduct.id,
                        {
                            stock: totalStock,
                        },
                    )
                }
            })
        },

        showErrorToast(message) {
            this.$buefy.toast.open({
                message: message,
                type: 'is-danger',
                position: 'is-bottom',
            })
        },

        showToast(message, type = 'is-success') {
            this.$buefy.snackbar.open({
                message: message,
                type: type,
                position: 'is-bottom-right',
                duration: 10000,
                actionText: 'Imprimir',
                cancelText: 'OK',
                onAction: () => receiptPrint(this.saleInvoice),
            })
        },

        getCustomers() {
            Database.customer.toArray().then(data => (this.customers = data))
        },

        handleShortcuts(event) {
            // CTRL + 1 = Focus on search
            if (event.which == 49 && event.ctrlKey || event.which === 113) {
                console.log('CTRL + 1')
                document.getElementById('searchInput').focus()
            }

            // CTRL + 2 = Finish the sale
            if (event.which == 50 && event.ctrlKey) {
                console.log('CTRL + 2')
                this.completeSale()
            }
        },

        initShortCuts() {
            window.addEventListener('keydown', this.handleShortcuts)
        },

        openPrintInvoice() {
            const report = printInvoice(this.saleInvoice)
            printContentent(report, `Factura #${this.saleInvoice}`, '')
        },

        async loadSettings() {
            const settings = await await getSettings('pos')
            this.posSettings = settings && settings.value ? settings.value : {}
        },
    },

    mounted() {
        this.getCustomers()
        this.initShortCuts()
        this.loadSettings()
    },

    beforeDestroy() {
        window.removeEventListener('keydown', this.handleShortcuts)
    },
}
</script>

<style lang="scss" scoped>
.quantity-input {
    width: 60px;
}

@media only screen and (max-width: 770px) {
    .pos-page {
        padding-bottom: 8rem;
    }
}
</style>
