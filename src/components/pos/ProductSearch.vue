<template>
    <div class="product-search">
        <form autocomplete="off" @submit.prevent="submit">
            <b-field>
                <b-input
                    type="search"
                    v-model="searchValue"
                    placeholder="Buscar..."
                    id="searchInput"
                    icon="magnify"
                    @blur="onBlurInput"
                    rounded
                />
                <!-- <p class="control">
                    <b-button
                        type="is-primary"
                        icon-right="qrcode-scan"
                        rounded
                    />
                </p> -->
            </b-field>
            <div class="search-result" v-if="showResults && loadComplete">
                <ul v-if="results && results.length">
                    <li
                        v-for="(inventoryProduct, i) in results"
                        :key="`res-${i}`"
                        @click="selectInventoryProduct(inventoryProduct)"
                    >
                        <div class="left-info">
                            <strong>
                                {{ inventoryProduct.product.name }}
                                <b-tag rounded>
                                    {{ inventoryProduct.product.codebar }}
                                </b-tag>
                            </strong>
                            <small>
                                {{ inventoryProduct.product.brand }} |
                                {{ inventoryProduct.inventory.name }}
                            </small>
                            <div>
                                <b-tag
                                    type="is-info"
                                    class="has-text-weight-bold"
                                    rounded
                                >
                                    {{ inventoryProduct.price | money }}
                                </b-tag>
                            </div>
                        </div>
                        <div class="right-info">
                            <b-tag
                                :type="
                                    inventoryProduct.stock > 0
                                        ? 'is-success'
                                        : 'is-danger'
                                "
                                class="has-text-weight-bold"
                                rounded
                            >
                                Disp: {{ inventoryProduct.stock || 0 }}
                            </b-tag>
                        </div>
                    </li>
                </ul>
                <div class="no-results" v-else>
                    <i class="mdi mdi-file-outline"></i>
                    <span>No hay resultados</span>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import { getAllInventoryProducts } from '@/controllers/inventories'
import { normalizeText } from '@/lib/locale'

export default {
    name: 'product-search',

    data() {
        return {
            searchValue: undefined,
            inventoryProducts: [],
            showResults: false,
            loadComplete: false,
            inputTimeout: undefined,
        }
    },

    computed: {
        results() {
            return this.searchProduct()
        },
    },

    watch: {
        searchValue() {
            clearTimeout(this.inputTimeout)

            this.inputTimeout = setTimeout(() => {
                this.showResults = true
            }, 500)
        },
    },

    methods: {
        submit() {
            if (this.inventoryProducts?.length) {
                if (this.results && this.results.length) {
                    this.selectInventoryProduct(this.results[0])
                }
                this.blurredInput()
            }
        },

        /**
         * Load all inventory products
         */
        async getInventoryProducts() {
            this.inventoryProducts = await getAllInventoryProducts()
            this.loadComplete = true
        },

        /**
         * Filter Inventory Products by search input value
         */
        searchProduct() {
            if (this.loadComplete && this.searchValue?.length) {
                return this.inventoryProducts.filter(inventoryProduct => {
                    // If product codebar match instantly return
                    if (this.codebarMatch(inventoryProduct.product.codebar)) {
                        this.selectInventoryProduct(inventoryProduct)
                        return true
                    }
                    return (
                        this.compare(
                            inventoryProduct.product.name,
                            this.searchValue,
                        ) ||
                        this.compare(
                            inventoryProduct.product.codebar,
                            this.searchValue,
                        ) ||
                        this.compare(
                            inventoryProduct.product.brand,
                            this.searchValue,
                        ) ||
                        this.compare(
                            inventoryProduct.product.brand,
                            this.searchValue,
                        )
                    )
                })
            } else {
                return []
            }
        },

        codebarMatch(codebar) {
            return (
                String(codebar).toLowerCase() == this.searchValue.toLowerCase()
            )
        },

        /**
         * Normalize and compare 2 values
         */
        compare(val1, val2) {
            const source = normalizeText(String(val1).toLowerCase())
            const target = normalizeText(String(val2).toLowerCase())
            return source.search(target) !== -1
        },

        /**
         * Emit Inventory Product selection
         */
        selectInventoryProduct(inventoryProduct) {
            if (
                inventoryProduct.stock > 0 ||
                inventoryProduct.unlimited_stock
            ) {
                this.$emit('input', inventoryProduct)
            } else {
                this.confirmAdd(inventoryProduct)
            }
            this.searchValue = ''
            this.blurredInput()
        },

        /** Add with warning */
        confirmAdd(inventoryProduct) {
            this.$buefy.dialog.confirm({
                title: `Advertencia`,
                message: 'No quedan existencias en el inventario.',
                confirmText: 'Continuar agregando',
                cancelText: 'Cancelar',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    this.$emit('input', inventoryProduct)
                },
            })
        },

        onBlurInput() {
            this.showResults = false
        },
    },

    mounted() {
        this.getInventoryProducts()
        // Focus search box
        document.getElementById('searchInput').focus()
    },
}
</script>

<style lang="scss" scoped>
.product-search {
    position: relative;
    input {
        width: 100%;
        border-radius: 64px;
    }
    .search-result {
        position: absolute;
        max-height: 340px;
        min-height: 100px;
        width: 100%;
        background-color: rgb(255, 255, 255);
        left: 0;
        border: 1px solid #dadada;
        border-end-end-radius: 6px;
        border-end-start-radius: 6px;
        overflow-y: scroll;
        transition: 0.3s;
        z-index: 99;
        box-shadow: 0px 0px 9px 0px rgba(0, 0, 0, 0.295);

        li {
            padding: 8px 10px;
            border-bottom: 1px solid #eeeeee;
            cursor: pointer;
            display: flex;

            .left-info {
                display: flex;
                flex-direction: column;
                width: 100%;
            }
            .right-info {
                display: flex;
                justify-content: flex-end;
                width: 30%;
            }
            &:hover {
                background-color: #fafafa;
            }
        }

        .no-results {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;

            .mdi {
                font-size: 26pt;
            }
        }
    }
}
</style>
