<template>
    <div class="card">
        <header class="card-header">
            <p class="card-header-title">
                Productos por agotarse
            </p>
        </header>
        <div class="card-content">
            <div class="content">
                <!-- Tabs -->
                <b-tabs v-if="inventories.length" v-model="activeTab">
                    <b-tab-item
                        v-for="(inventory, index) in inventories"
                        :key="'inventory-tab-' + index"
                    >
                        <template slot="header">
                            <span>
                                {{ inventory.name }}
                                <b-tag
                                    :type="
                                        getProductsCount(inventory)
                                            ? 'is-danger'
                                            : 'is-success'
                                    "
                                    rounded
                                >
                                    {{ getProductsCount(inventory) }}
                                </b-tag>
                            </span>
                        </template>
                        <!-- Products table -->
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Marca</th>
                                    <th>Presentación</th>
                                    <th>Precio</th>
                                    <th>Existencias</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(product,
                                    index) in inventory.products"
                                    :key="'inv-product-' + index"
                                >
                                    <td>
                                        {{ product.product.name }}
                                    </td>
                                    <td>
                                        {{ product.product.brand }}
                                    </td>
                                    <td>
                                        {{ product.product.content }}
                                        {{ product.product.unit }}
                                    </td>
                                    <td>
                                        <b-tag
                                            type="is-primary"
                                            class="has-text-weight-bold"
                                            rounded
                                        >
                                            {{ currency }}{{ product.price }}
                                        </b-tag>
                                    </td>
                                    <td>
                                        <b-tag
                                            type="is-danger"
                                            class="has-text-weight-bold"
                                            rounded
                                        >
                                            {{ product.stock }}
                                        </b-tag>
                                    </td>
                                    <td>
                                        <b-button
                                            size="is-small"
                                            icon-left="pencil"
                                            type="is-success"
                                            @click="
                                                openEditProduct(
                                                    inventory.id,
                                                    product.id
                                                )
                                            "
                                            rounded
                                        >
                                            Actualizar
                                        </b-button>
                                    </td>
                                </tr>

                                <tr
                                    v-if="
                                        inventory.products &&
                                            !inventory.products.length
                                    "
                                >
                                    <td colspan="6" class="has-text-centered">
                                        <div
                                            class="notification is-info has-text-weight-semibold"
                                        >
                                            No se encontraron advertencias
                                            <b-icon icon="check-bold" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </b-tab-item>
                </b-tabs>
            </div>
        </div>

        <!-- Inventory product form -->
        <b-modal v-model="isEditOpen" has-modal-card trap-focus>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Actualizar producto</p>
                </header>
                <section class="modal-card-body">
                    <InventoryProductForm
                        v-if="isEditOpen"
                        :inventoryId="selectedProduct.inventoryId"
                        :inventoryProductId="selectedProduct.inventoryProductId"
                        @submit="updateInventoryProduct"
                    />
                </section>
            </div>
        </b-modal>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'InventoryStatus',

    components: {
        InventoryProductForm: () =>
            import('@/components/inventory/InventoryProductForm.vue')
    },

    computed: {
        ...mapGetters(['currency'])
    },

    data() {
        return {
            inventories: [],
            activeTab: 0,
            minQuantity: 5,
            isEditOpen: false,
            selectedProduct: {}
        }
    },

    methods: {
        async getInventories() {
            this.inventories = await Database.inventory.toArray()
            this.getProducts()
        },

        getProducts() {
            this.inventories.forEach(async inventory => {
                const inventoryProducts = await Database.inventory_product
                    .where({
                        inventory_id: inventory.id
                    })
                    .filter(invProd => invProd.stock <= this.minQuantity)
                    .toArray()

                inventoryProducts.forEach(async invProd => {
                    const product = await Database.product.get(
                        invProd.product_id
                    )
                    invProd.product = product
                    this.$forceUpdate()
                })

                inventory.products = inventoryProducts
            })
        },

        getProductsCount(inventory) {
            if (inventory && inventory.products)
                return inventory.products.length
            return 0
        },

        openEditProduct(inventoryId, inventoryProductId) {
            this.selectedProduct = { inventoryId, inventoryProductId }
            this.isEditOpen = true
        },

        updateInventoryProduct(data) {
            Database.inventory_product.update(data.id, data).then(() => {
                this.showToast('Se actualizó el inventario!')
                this.getInventories()
                this.selectedProduct = {}
                this.isEditOpen = false
            })
        },

        showToast(message, error = false) {
            this.$buefy.toast.open({
                message: message,
                type: error ? 'is-danger' : 'is-success',
                position: 'is-bottom'
            })
        }
    },

    mounted() {
        this.getInventories()
    }
}
</script>

<style lang="scss" scoped></style>
