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
import InventoryProductForm from '@/components/inventory/InventoryProductForm.vue'
import EventBus from '@/event-bus'
import { mapGetters } from 'vuex'
import InventoryTable from '../components/inventory/InventoryTable.vue'
import InventorySummary from '../components/inventory/InventorySummary.vue'

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
            showBulkImportModal: false,
            totalProducts: 0
        }
    },

    methods: {
        async getInventoryProducts() {
            this.loading = true
            const query = Database.inventory_product.where({
                inventory_id: this.inventory.id
            })

            let data = await query.toArray()

            this.totalProducts = await query.count()

            data.map(async d => {
                d.product = await this.getProduct(d.product_id)
            })

            setTimeout(() => {
                this.loading = false
                this.inventoryProducts = data
            }, 300)
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
            const inventoryId = Number(this.$route.params.id)
            this.inventory = await Database.inventory.get(inventoryId)
            this.getInventoryProducts()
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
                this.getInventoryProducts()

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
                    this.$buefy.toast.open(
                        'Se quitó el producto del inventario'
                    )
                    Database.inventory_product.delete(inventoryProduct.id)
                }
            })
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
        this.getInventory()
        this.setActionButtons()
    }
}
</script>

<style lang="scss" scoped></style>
