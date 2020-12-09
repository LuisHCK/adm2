<template>
    <div class="page-container" id="products-page">
        <div class="panel">
            <div class="search-form">
                <input
                    ref="searchInput"
                    class="input"
                    placeholder="Nombre, marca, codigo"
                    type="text"
                    @input="handleSearch"
                />
            </div>

            <b-table
                :paginated="true"
                :pagination-simple="true"
                :per-page="perPage"
                :data="products"
                :striped="true"
                :hoverable="true"
                :loading="loading"
                :checked-rows.sync="checkedProducts"
                :sticky-header="true"
                height="75vh"
                checkable
                @check="setActionButtons()"
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

                    <b-table-column v-slot="props" field="name" label="Nombre">
                        <strong>{{ props.row.name }}</strong>
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="brand"
                        label="Marca"
                        >{{ props.row.brand }}</b-table-column
                    >

                    <b-table-column
                        v-slot="props"
                        field="unit"
                        label="Presentación"
                    >
                        <b-tag
                            type="is-primary"
                            class="has-text-weight-bold"
                            rounded
                        >
                            {{ props.row.content }}
                            {{ props.row.unit }}
                        </b-tag>
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="codebar"
                        label="Código"
                        >{{ props.row.codebar }}</b-table-column
                    >

                    <b-table-column
                        v-slot="props"
                        field="categories"
                        label="Categorías"
                    >
                        <b-taglist>
                            <b-tag
                                v-for="(cat, i) in props.row.categories"
                                class="has-text-weight-bold"
                                :key="`catg-${i}`"
                                v-text="cat"
                                type="is-info"
                                rounded
                            />
                        </b-taglist>
                    </b-table-column>
                    <b-table-column
                        v-slot="props"
                        field="product"
                        label="Acciones"
                    >
                        <b-field>
                            <div class="control">
                                <b-tooltip
                                    label="Editar producto"
                                    type="is-dark"
                                    :delay="100"
                                >
                                    <b-button
                                        @click="openUpdateForm(props.row)"
                                        type="is-primary"
                                        icon-right="pencil"
                                        size="is-small"
                                        rounded
                                    />
                                </b-tooltip>
                            </div>
                            <div class="control">
                                <b-tooltip
                                    label="Ver detalles"
                                    type="is-dark"
                                    :delay="100"
                                >
                                    <b-button
                                        @click="showProduct(props.row)"
                                        type="is-info"
                                        icon-right="eye"
                                        size="is-small"
                                        rounded
                                    />
                                </b-tooltip>
                            </div>
                            <div class="control">
                                <b-tooltip
                                    label="Eliminar producto"
                                    type="is-dark"
                                    :delay="100"
                                    position="is-left"
                                >
                                    <b-button
                                        @click="openUpdateForm(props.row)"
                                        type="is-danger"
                                        icon-right="delete"
                                        size="is-small"
                                        rounded
                                    />
                                </b-tooltip>
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
                    <product-form :show="showForm" @submit="saveProduct" />
                </section>
            </div>
        </b-modal>

        <!-- Product edit form -->
        <b-modal :active.sync="showUpdateForm" has-modal-card>
            <div v-if="selectedProduct" class="modal-card">
                <header class="modal-card-head">
                    <span
                        class="modal-card-title has-text-weight-bold"
                        v-text="'Editar: ' + selectedProduct.name"
                    />
                    <button
                        type="button"
                        class="delete"
                        @click="showUpdateForm = false"
                    />
                </header>
                <section class="modal-card-body">
                    <product-form
                        :product-id="selectedProduct.id"
                        @submit="updateProduct"
                    />
                </section>
            </div>
        </b-modal>

        <!-- Product detail modal -->
        <b-modal :active.sync="showDetailModal" has-modal-card>
            <div class="modal-card" v-if="showDetailModal">
                <section class="modal-card-body">
                    <product-detail :id="selectedProductId" />
                </section>
            </div>
        </b-modal>

        <!-- Add to inventory -->
        <b-modal :active.sync="showInventoryModal" has-modal-card :width="1024">
            <div class="modal-card is-full-width">
                <header class="modal-card-head">
                    <span class="modal-card-title"
                        >Importar multiples productos</span
                    >
                </header>
                <section class="modal-card-body" style="overflow: hidden">
                    <ImportProducts
                        :products="checkedProducts"
                        :selectedInventory="selectedInventory"
                        @cancel="toggleImportModal"
                        @save="handleSave"
                        @select-inventory="openInventorySelection"
                    />
                </section>
            </div>
        </b-modal>

        <!-- Select inventory modal -->
        <b-modal :active.sync="showInventorySelect" has-modal-card>
            <div class="modal-card">
                <InventorySelect
                    :inventories="inventories"
                    @cancel="showInventorySelect = false"
                    @select="handleInventorySelect"
                />
            </div>
        </b-modal>
    </div>
</template>

<script>
import EventBus from '@/event-bus'
import ProductForm from '@/components/product/Form.vue'
import InventorySelect from '@/components/product/InventorySelect.vue'
import ProductDetail from '@/components/product/ProductDetail.vue'
import ImportProducts from '@/components/inventory/ImportProducts.vue'

export default {
    name: 'products',

    components: {
        ProductForm,
        ProductDetail,
        ImportProducts,
        InventorySelect
    },

    data() {
        return {
            products: [],
            loading: true,
            showForm: false,
            perPage: 50,
            selectedProduct: undefined,
            selectedProductId: undefined,
            showUpdateForm: false,
            showDetailModal: false,
            checkedProducts: [],
            // Inventory form
            inventories: [],
            showInventoryModal: false,
            selectedInventory: undefined,
            showInventorySelect: false,
            searchTimeout: undefined
        }
    },

    computed: {},

    methods: {
        // Get all products
        getProducts() {
            Database.product
                .toArray()
                .then(products => (this.products = products))
                .then(() => (this.loading = false))
        },

        /**
         * Handle product submit form
         */
        saveProduct(data) {
            // Append timestaps
            const now = new Date()
            data.created_at = now.toISOString()
            data.updated_at = now.toISOString()

            Database.product
                .add(data)
                .then(product => {
                    // Save the product
                    this.getProducts()
                    this.showForm = false
                })
                .catch(err => this.handleSaveError(err))
        },

        handleSaveError(err) {
            let messageText = ''

            switch (err.name) {
                case 'ConstraintError':
                    messageText =
                        'El código de barras que indicó ya está siendo usando en otro producto'
                    break

                default:
                    messageText = 'Ha ocurrido un error al guardar el producto.'
                    break
            }

            this.errorAlert(messageText)
            console.error(err)
        },

        /** Display an error message */
        errorAlert(message) {
            this.$buefy.dialog.alert({
                title: 'Error al guardar',
                message,
                type: 'is-danger',
                hasIcon: true,
                icon: 'alert-circle-outline'
            })
        },

        updateProduct(data) {
            Database.product
                .update(data.id, data)
                .then(updated => {
                    console.log(updated)

                    this.showUpdateForm = false
                    this.getProducts()
                    this.$buefy.toast.open({
                        message: 'Se actualizó el producto',
                        type: 'is-success',
                        position: 'is-bottom'
                    })
                })
                .catch(err => {
                    const error = err.failures[0]

                    if (error) this.handleSaveError(error)

                    return console.log(err)
                })
        },

        openUpdateForm(product) {
            this.selectedProduct = product
            this.showUpdateForm = true
            EventBus.$emit('SELECT_PROJECT_UPDATE')
        },

        handleSearch(event) {
            clearTimeout(this.searchTimeout)

            this.searchTimeout = setTimeout(() => {
                this.searchProduct(event.target.value)
            }, 300)
        },

        searchProduct(value) {
            if (value.length) {
                Database.product
                    .where('name')
                    .startsWithIgnoreCase(value)
                    .or('brand')
                    .startsWithIgnoreCase(value)
                    .or('codebar')
                    .startsWithIgnoreCase(value)
                    .toArray(products => (this.products = products))
            } else {
                this.getProducts()
            }
        },

        showProduct(product) {
            this.selectedProductId = product.id
            this.showDetailModal = true
        },

        getInventories() {
            Database.inventory.toArray(data => (this.inventories = data))
        },

        /**
         * Check for query params, when an inventory id is given,
         * set selectedInventory
         */
        handlePreselectedInventory() {
            if (this.$route.query && this.$route.query.selectedInventory) {
                Database.inventory.toArray(data => {
                    this.inventories = data
                    // set selected inventory
                    this.selectedInventory = this.inventories.find(
                        i => i.id === this.$route.query.selectedInventory
                    )
                })
            }
        },

        /**
         * Add Products to selected Inventory
         */
        addProducts() {
            let inventoryProducts = this.checkedProducts.map(product => {
                return {
                    product_id: product.id,
                    inventory_id: this.selectedInventory.id,
                    stock: product.stock,
                    price: product.price
                }
            })

            inventoryProducts.forEach(async item => {
                let existent = await Database.inventory_product
                    .filter(i => i.product_id === item.product_id)
                    .and(i => i.inventory_id === item.inventory_id)
                    .first()

                // Update or create
                if (existent) {
                    await Database.inventory_product.update(existent.id, item)
                } else {
                    await Database.inventory_product.add(item)
                }
            })

            this.showToast(
                `Se agregaron ${inventoryProducts.length} al inventario: ${this.selectedInventory.name}`
            )

            // Import cleanup
            this.checkedProducts = []
            this.showInventoryModal = false
            this.selectedInventory = undefined
            this.showInventorySelect = false
        },

        showToast(message, type = 'is-success') {
            this.$buefy.toast.open({
                message: message,
                type: type,
                position: 'is-bottom'
            })
        },

        removeActionButtions() {
            this.$store.commit('SET_ACTION_BUTTONS', [])
        },

        setActionButtons() {
            const addInventoryBtn = {
                type: 'is-info',
                icon: 'package-variant',
                label: 'Agregar al inventario',
                action: () => {
                    if (!this.checkedProducts || !this.checkedProducts.length) {
                        return this.$buefy.dialog.alert({
                            title: 'Advertencia',
                            message: `Primero debes seleccionar uno o más productos.`,
                            type: 'is-warning',
                            hasIcon: true,
                            iconPack: 'mdi',
                            icon: 'alert',
                            ariaRole: 'alertdialog',
                            ariaModal: true
                        })
                    }
                    this.showInventoryModal = !this.showInventoryModal
                }
            }

            const addProductBtn = {
                type: 'is-success',
                icon: 'plus',
                label: 'Nuevo',
                action: () => {
                    this.showForm = true
                }
            }

            this.$store.commit('SET_ACTION_BUTTONS', [
                addInventoryBtn,
                addProductBtn
            ])
        },

        toggleImportModal() {
            this.showInventoryModal = !this.showInventoryModal
        },

        openInventorySelection() {
            this.getInventories()
            this.showInventorySelect = true
        },

        /**
         * Handle destiny inventory selection
         */
        handleInventorySelect(inventory) {
            this.selectedInventory = inventory
            this.showInventorySelect = false

            this.handleSave()
        },

        /**
         * Handle Bulk inventory save
         */
        handleSave() {
            // Promt inventory selection
            if (!this.selectedInventory) {
                this.openInventorySelection()
            } else {
                // if inventory is already selected then promt confirmation
                this.$buefy.dialog.confirm({
                    title: `Importando ${
                        this.checkedProducts.length
                    } productos en "${
                        this.selectedInventory
                            ? this.selectedInventory.name
                            : ''
                    }"`,
                    message: `¿Desea importar los productos seleccionados?
                    </br>Ten en cuenta lo siguiente: </br>
                    <b>Los productos que ya estén añádidos a este inventario su precio y existencia
                    serán actualizados a los valores que indicaste en el paso anterior.</b>`,
                    onConfirm: () => this.addProducts(),
                    confirmText: 'Si, guardar',
                    cancelText: 'Cancelar'
                })
            }
        }
    },

    mounted() {
        this.setActionButtons()
        this.getProducts()
        this.handlePreselectedInventory()
    },

    beforeDestroy() {
        this.removeActionButtions()
    }
}
</script>

<style lang="scss" scoped>
.tag {
    margin-right: 2px;
}
.search-form {
    width: 200px;
    margin-bottom: 8px;
}
</style>
