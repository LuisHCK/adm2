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
                        <template #header>
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
                        <b-table
                            :data="inventory.products"
                            :striped="true"
                            :hoverable="true"
                            :sticky-header="true"
                        >
                            <template>
                                <b-table-column
                                    v-slot="props"
                                    field="product"
                                    label="Nombre"
                                >
                                    <div>
                                        {{ props.row.product.name }}
                                        -
                                        {{ props.row.product.content }}
                                        {{ props.row.product.unit }}
                                    </div>
                                    <small>
                                        {{ props.row.product.brand }}
                                    </small>
                                </b-table-column>

                                <b-table-column
                                    v-slot="props"
                                    field="product"
                                    label="Precio"
                                >
                                    <b-tag
                                        type="is-primary"
                                        class="has-text-weight-bold"
                                        rounded
                                    >
                                        {{ $money(props.row.price) }}
                                    </b-tag>
                                </b-table-column>
                                <b-table-column
                                    v-slot="props"
                                    field="product"
                                    label="Existencias"
                                >
                                    <b-tag
                                        type="is-danger"
                                        class="has-text-weight-bold"
                                        rounded
                                    >
                                        {{ props.row.stock }}
                                    </b-tag>
                                </b-table-column>

                                <b-table-column
                                    v-slot="props"
                                    field="product"
                                    label=""
                                >
                                    <b-button
                                        size="is-small"
                                        icon-left="pencil"
                                        type="is-success"
                                        @click="
                                            openEditProduct(
                                                inventory.id,
                                                props.row.id
                                            )
                                        "
                                        rounded
                                    >
                                        Actualizar
                                    </b-button>
                                </b-table-column>
                            </template>

                            <template #empty>
                                <empty-table-card />
                            </template>
                        </b-table>
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
                        @submit="handleUpdateInventoryProduct"
                    />
                </section>
            </div>
        </b-modal>
    </div>
</template>

<script>
import database from "@/db"
import { getProductById } from '@/controllers/products'
import { mapGetters } from '@/store/vuex-compat'
import EmptyTableCard from '../ui/EmptyTableCard.vue'
import {
    updateInventoryProduct,
    getAllInventories
} from '@/controllers/inventories'

export default {
    name: 'InventoryStatus',

    components: {
        InventoryProductForm: () =>
            import('@/components/inventory/InventoryProductForm.vue'),
        EmptyTableCard
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
            this.inventories = await getAllInventories()
            await this.getProducts()
        },

        async getProducts() {
            await Promise.all(
                this.inventories.map(async inventory => {
                    const inventoryProducts = await database.inventory_product
                        .where({ inventory_id: inventory.id })
                        .filter(
                            invProd =>
                                invProd.stock <= this.minQuantity &&
                                !invProd.unlimited_stock,
                        )
                        .toArray()

                    await Promise.all(
                        inventoryProducts.map(async invProd => {
                            invProd.product = await getProductById(
                                invProd.product_id,
                            )
                        }),
                    )

                    inventory.products = inventoryProducts
                }),
            )
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

        async handleUpdateInventoryProduct(data) {
            await updateInventoryProduct(data)
            this.showToast('Se actualizó el inventario!')
            this.getInventories()
            this.selectedProduct = {}
            this.isEditOpen = false
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
