<template>
    <div class="page-container">
        <div class="columns">
            <div class="column is-full-mobile is-one-quarter-desktop">
                <inventory-summary
                    :inventory="inventory"
                    :total-products="totalProducts"
                    :gross-profit="grossProfit"
                />
            </div>
            <div class="column">
                <div class="card">
                    <div class="card-content">
                        <div class="content">
                            <inventory-table
                                :inventory-products="inventoryProducts"
                                :loading="loading"
                                @update="openUpdateForm"
                                @delete="deleteInventoryProduct"
                                @update-price="updateInventoryProduct"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Product modal form -->
        <b-modal :active.sync="showForm" has-modal-card>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Agregar un nuevo producto</p>
                </header>
                <section class="modal-card-body">
                    <inventory-product-form
                        :inventory-id="inventory.id"
                        :show="showForm"
                        @submit="saveInventoryProduct"
                    />
                </section>
            </div>
        </b-modal>

        <!-- Product inventory edit form -->
        <b-modal :active.sync="showUpdateForm" has-modal-card>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Actualizar inventario</p>
                </header>
                <section class="modal-card-body">
                    <inventory-product-form
                        :inventory-product-id="selectedInventoryProduct"
                        :show="showUpdateForm"
                        @submit="updateInventoryProduct"
                    />
                </section>
            </div>
        </b-modal>
    </div>
</template>

<script>
import ImportProducts from '@/components/inventory/ImportProducts.vue'
import InventoryProductForm from '../components/inventory/InventoryProductForm.vue'
import { mapGetters } from 'vuex'
import InventoryTable from '../components/inventory/InventoryTable.vue'
import InventorySummary from '../components/inventory/InventorySummary.vue'
import { getInventoryProducts } from '../controllers/inventory'

export default {
    components: {
        ImportProducts,
        InventoryProductForm,
        InventoryTable,
        InventorySummary
    },

    computed: {
        ...mapGetters(['currency']),

        grossProfit() {
            if (this.inventoryProducts.length) {
                let subTotal = this.inventoryProducts.map(
                    item => Number(item.price || 0) * Number(item.stock || 0)
                )

                return subTotal.reduce((acc, curr) => acc + curr, 0)
            }

            return 0
        },

        totalProducts() {
            return this.inventoryProducts ? this.inventoryProducts.length : 0
        }
    },

    data() {
        return {
            inventory: {},
            inventoryProducts: [],
            showForm: false,
            showUpdateForm: false,
            selectedInventoryProduct: undefined,
            loading: false,
            showBulkImportModal: false
        }
    },

    methods: {
        async initInventory() {
            this.loading = true

            this.inventoryProducts = await getInventoryProducts(
                this.inventoryId
            )

            this.loading = false
        },

        async getProduct(id) {
            const product = await Database.product.get(id)
            return product
        },

        saveInventoryProduct(data) {
            Database.inventory_product
                .add(data)
                .then(() => {
                    this.showToast('Se agregó el producto al inventario')
                    this.showForm = false
                })
                .catch(err => console.log(err))
        },

        async getInventory() {
            this.inventory = await Database.inventory.get(this.inventoryId)
            this.initInventory()
        },

        /**
         * Show a toast
         */
        showToast(message, error = false) {
            this.$buefy.toast.open({
                message: message,
                type: error ? 'is-danger' : 'is-success',
                position: 'is-bottom'
            })
        },

        async updateInventoryProduct(data) {
            const updatedInventory = await Database.inventory_product.update(
                data.id,
                data
            )

            if (updatedInventory) {
                // Refresh table data
                this.initInventory()

                this.showToast('Se actualizó el inventario!')
            }

            this.showUpdateForm = false
        },

        getProductName(product) {
            if (!product) return '¡Desconocido!'
            return `${product.name} - ${product.content} ${product.unit}`
        },

        deleteInventoryProduct(inventoryProduct) {
            const productName = this.getProductName(inventoryProduct.product)

            this.$buefy.dialog.confirm({
                title: `Quitar: ${productName}`,
                message:
                    '¿Estás seguro que quieres <b>quitar</b> este producto del inventario?' +
                    ' Esta acción no puede deshacerse.',
                confirmText: 'Si, quitar',
                cancelText: 'Cancelar',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    this.handleDelete(inventoryProduct.id)

                    this.$buefy.toast.open(
                        'Se quitó el producto del inventario'
                    )
                }
            })
        },

        async handleDelete(productId) {
            await Database.inventory_product.delete(productId)
            this.initInventory()
        },

        openUpdateForm(inventoryProductId) {
            this.selectedInventoryProduct = inventoryProductId
            this.showUpdateForm = true
        },

        setActionButtons() {
            const addInventory = {
                type: 'is-success',
                icon: 'plus',
                label: 'Importar productos',
                action: () => {
                    this.$router.push({
                        path: '/products',
                        query: {
                            selectedInventory: this.inventory.id
                        }
                    })
                }
            }
            this.$store.commit('SET_ACTION_BUTTONS', [addInventory])
        },

        toggleModal() {
            console.log('Cancel')
        }
    },

    mounted() {
        this.inventoryId = Number(this.$route.params.id)
        this.getInventory()
        this.setActionButtons()
    }
}
</script>

<style lang="scss" scoped></style>
