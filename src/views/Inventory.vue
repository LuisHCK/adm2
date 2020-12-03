<template>
    <div class="page-container">
        <div class="panel">
            <h3 class="is-size-4 has-text-weight-bold">{{ inventory.name }}</h3>
            <b-table
                :data="inventoryProducts"
                :striped="true"
                :hoverable="true"
                :loading="loading"
                class="is-margin-top-1"
            >
                <template>
                    <b-table-column
                        v-slot="props"
                        field="id"
                        label="ID"
                        width="40"
                        numeric
                        >{{ props.row.id }}</b-table-column
                    >

                    <b-table-column
                        v-slot="props"
                        field="product_id"
                        label="Nombre"
                    >
                        <strong
                            v-text="getProduct(props.row.product_id).name"
                        />
                        <br />
                        <small
                            v-text="getProduct(props.row.product_id).brand"
                        />
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="product"
                        label="Presentación"
                    >
                        <span
                            v-text="getProduct(props.row.product_id).content"
                        />
                        <span v-text="getProduct(props.row.product_id).unit" />
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="price"
                        label="Precio Unitario"
                    >
                        <b-tag
                            type="is-info"
                            class="has-text-weight-bold"
                            rounded
                        >
                            {{ currency }}{{ props.row.price }}
                        </b-tag>
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="stock"
                        label="Cantidad en existencia"
                    >
                        <b-tag
                            type="is-primary"
                            class="has-text-weight-bold"
                            rounded
                        >
                            {{ props.row.stock }}
                        </b-tag>
                    </b-table-column>

                    <b-table-column v-slot="props" field="lot" label="Lote">
                        <b-tag
                            v-text="props.row.lot || '---'"
                            type="is-info"
                            class="has-text-weight-bold"
                            rounded
                        />
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="codebar"
                        label="Código"
                    >
                        {{ getProduct(props.row.product_id).codebar }}
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="actions"
                        label="Acciones"
                    >
                        <b-field>
                            <div class="control">
                                <b-button
                                    @click="openUpdateForm(props.row.id)"
                                    icon-left="pencil"
                                    type="is-primary"
                                    size="is-small"
                                    rounded
                                />
                            </div>
                            <div class="control">
                                <b-button
                                    @click="deleteInventoryProduct(props.row)"
                                    icon-left="delete"
                                    type="is-danger"
                                    size="is-small"
                                    rounded
                                />
                            </div>
                        </b-field>
                    </b-table-column>
                </template>

                <template slot="empty">
                    <section class="section">
                        <div class="content has-text-grey has-text-centered">
                            <p>
                                <b-icon
                                    icon="package-variant"
                                    size="is-large"
                                ></b-icon>
                            </p>
                            <p>No hay productos para mostrar.</p>
                        </div>
                    </section>
                </template>
            </b-table>
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

        <!-- Show bulk import modal -->
        <b-modal
            :active.sync="showBulkImportModal"
            has-modal-card
            :width="1024"
        >
            <div class="modal-card is-full-width">
                <header class="modal-card-head">
                    <span class="modal-card-title"
                        >Importar multiples productos</span
                    >
                </header>
                <section class="modal-card-body">
                    <import-products
                        :products="products"
                        @close="toggleModal"
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

export default {
    components: {
        ImportProducts,
        InventoryProductForm
    },

    computed: {
        ...mapGetters(['currency'])
    },

    data() {
        return {
            inventory: {},
            inventoryProducts: [],
            products: [],
            showForm: false,
            showUpdateForm: false,
            selectedInventoryProduct: undefined,
            loading: false,
            showBulkImportModal: false
        }
    },

    methods: {
        getInventoryProducts() {
            Database.inventory_product
                .where({ inventory_id: this.inventory.id })
                .toArray(data => {
                    this.inventoryProducts = data
                    this.getProductDetails()
                })
        },

        getProductDetails() {
            this.inventoryProducts.map(element => {
                Database.product.get(element.product_id).then(product => {
                    EventBus.$emit('RESET_INVENTORY_PRODUCT_FORM')
                    this.products.push(product)
                })
            })
        },

        getProduct(id) {
            const product = this.products.find(product => {
                return product.id == id
            })
            // Return empty objetct if not product
            if (!product) return {}

            return product
        },

        saveInventoryProduct(data) {
            Database.inventory_product
                .add(data)
                .then(() => {
                    this.showToast('Se agregó el producto al inventario')
                    this.getInventoryProducts()
                    this.showForm = false
                })
                .catch(err => console.log(err))
        },

        getInventory() {
            const inventoryId = this.$route.params.id

            Database.inventory.get(inventoryId, data => {
                this.inventory = data
                this.getInventoryProducts()
            })
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

        updateInventoryProduct(data) {
            Database.inventory_product.update(data.id, data).then(() => {
                this.showToast('Se actualizó el inventario!')
                this.showUpdateForm = false
                this.getInventoryProducts()
            })
        },

        getProductName(product_id) {
            const product = this.getProduct(product_id)
            return `${product.name} - ${product.content} ${product.unit}`
        },

        deleteInventoryProduct(inventoryProduct) {
            this.$buefy.dialog.confirm({
                title: `Quitar ${this.getProductName(
                    inventoryProduct.product_id
                )}`,
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
                    this.getInventoryProducts()
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
