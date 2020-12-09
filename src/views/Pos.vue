<template>
    <div class="pos-page page-container">
        <div class="panel">
            <div class="columns">
                <div class="column is-6">
                    <product-search @input="addToShoppingCart" />
                </div>
                <div class="column">
                    <b-button type="is-danger" @click="cancelSale" rounded>
                        Cancelar venta
                    </b-button>
                </div>
            </div>
        </div>

        <div class="columns">
            <div class="column">
                <div class="panel">
                    <products-table
                        :shoppingCart="shoppingCart"
                        @onQuantityChange="setInventoryProductBuyQty"
                        @onRemoveItem="removeItem"
                        @onDiscountChange="handleDiscountChange"
                    />
                </div>
            </div>
            <div class="column is-3-desktop is-4-tablet">
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
                    <SaleDetails :sale="saleInvoice" />
                </section>
            </div>
        </b-modal>
    </div>
</template>

<script>
import 'vue-select/dist/vue-select.css'
import ProductSearch from '@/components/pos/ProductSearch.vue'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import ProductsTable from '@/components/pos/ProductsTable.vue'
import SaleDetails from '@/components/sales/SaleDetails.vue'
import PosSummary from '../components/pos/PosSummary.vue'
import vSelect from 'vue-select'
import { mapState, mapGetters } from 'vuex'
import Maths from '@/lib/maths'
import { printContentent } from '@/lib/print'
import { printInvoice } from '@/reports/invoice'

export default {
    components: {
        ProductSearch,
        vSelect,
        CustomerForm,
        ProductsTable,
        SaleDetails,
        PosSummary
    },

    computed: {
        ...mapState(['shoppingCart', 'shoppingCartCustomer']),
        ...mapGetters(['shoppingCartTotal', 'currency']),

        totalSale() {
            return 0
        },

        discounted() {
            return Maths.percentOfNum(this.discount, this.shoppingCartTotal)
        },

        finalTotal() {
            return this.shoppingCartTotal - this.discounted
        },

        exchange() {
            if (this.payWith) {
                return this.payWith - this.finalTotal
            } else {
                return 0
            }
        }
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
            showSaleInvoice: false
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
                    subTotal
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
                position: 'is-bottom'
            })
        },

        /**
         * Call muttation to add Product Buy Quantity
         */
        setInventoryProductBuyQty(index, event, stock) {
            let quantity = Number(event.target.value)

            // Check maximum
            // When input quantity reach stock limit, alert to user and fix input
            if (quantity > stock) {
                quantity = stock
                event.target.value = stock
                this.$buefy.toast.open({
                    message: 'Supera el máximo de existencias',
                    type: 'is-warning',
                    position: 'is-bottom'
                })
            }

            this.$store.commit('SET_PRODUCT_QTY_SHOPPING_CART', {
                index,
                quantity: quantity
            })
        },

        /** Update product discount */
        handleDiscountChange({ event, index }) {
            const inventoryProduct = this.shoppingCart[index]
            this.$store.commit('SET_PRODUCT_DISCOUNT_SHOPPING_CART', {
                index,
                discount: event
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
            const saleId = await Database.sale.add({
                shoppingCart: this.shoppingCart,
                discount: this.discount,
                customer: this.shoppingCartCustomer,
                subTotal: this.shoppingCartTotal,
                discounted: this.discounted,
                total: this.finalTotal,
                sale_type: this.saleType ? 'cash' : 'credit',
                pay_with: this.payWith,
                customer_id: this.shoppingCartCustomer.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

            this.saleInvoice = await Database.sale.get(saleId)

            this.showToast('Se completó la venta')
            // Reduce inventory stock
            this.reduceInventoryQuantity()
            // Clear the sale form
            this.cancelSale()
            // Open detail retult
            this.showSaleInvoice = true
        },

        reduceInventoryQuantity() {
            this.shoppingCart.map(item => {
                const totalStock = item.inventoryProduct.stock - item.quantity
                Database.inventory_product.update(item.inventoryProduct.id, {
                    stock: totalStock
                })
            })
        },

        showErrorToast(message) {
            this.$buefy.toast.open({
                message: message,
                type: 'is-danger',
                position: 'is-bottom'
            })
        },

        showToast(message, type = 'is-success') {
            this.$buefy.toast.open({
                message: message,
                type: type,
                position: 'is-bottom'
            })
        },

        getCustomers() {
            Database.customer.toArray().then(data => (this.customers = data))
        },

        initShortCuts() {
            window.addEventListener('keydown', e => {
                // CTRL + 1 = Focus on search
                if (e.which == 49 && e.ctrlKey) {
                    console.log('CTRL + 1')
                    document.getElementById('searchInput').focus()
                }

                // CTRL + 2 = Finish the sale
                if (e.which == 50 && e.ctrlKey) {
                    console.log('CTRL + 2')
                    this.completeSale()
                }
            })
        },

        openPrintInvoice() {
            const report = printInvoice(this.saleInvoice)
            printContentent(report, `Factura #${this.saleInvoice}`, '')
        }
    },

    mounted() {
        this.getCustomers()
        this.initShortCuts()
    }
}
</script>

<style lang="scss" scoped>
.quantity-input {
    width: 60px;
}
</style>
