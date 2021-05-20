<template>
    <form @submit.prevent="submit" id="inventoryProductForm">
        <div class="columns">
            <!-- Name -->
            <div class="column is-half">
                <div v-if="inventoryProduct" style="margin-bottom: 20px;">
                    <strong v-text="getProductName(inventoryProduct.product)" />
                    <br />
                    <small v-text="inventoryProduct.product.brand" />
                </div>
            </div>

            <!-- Providers -->
            <div class="column is-half"></div>
        </div>

        <div class="columns">
            <div class="column">
                <!-- Price -->
                <b-field label="Precio*">
                    <p class="control">
                        <span class="button is-static">
                            {{ currency }}
                        </span>
                    </p>
                    <b-numberinput
                        v-model="form.price"
                        min="1"
                        :controls="false"
                        @focus="focusInput"
                    />
                </b-field>
            </div>

            <div class="column">
                <!-- Stock -->
                <b-field label="Existencias*">
                    <p class="control">
                        <span class="button is-static">
                            <b-icon icon="package-variant" />
                        </span>
                    </p>
                    <b-numberinput
                        v-model="form.stock"
                        min="0"
                        :controls="false"
                        @focus="focusInput"
                        :disabled="form.unlimited_stock"
                    />
                </b-field>
            </div>
        </div>

        <b-field label="Existencias ilimitadas">
            <b-switch v-model="form.unlimited_stock" />
        </b-field>

        <!-- Lote -->
        <b-field label="Lote">
            <b-input v-model="form.lot" @focus="focusInput" />
        </b-field>
        <hr />
        <div>
            <button type="submit" class="button is-success">Guardar</button>
        </div>
    </form>
</template>

<script>
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { mapGetters } from 'vuex'
import { getInventoryProductById } from '../../controllers/inventories'
import { getProductById } from '../../controllers/products'

export default {
    name: 'inventory-product-form',

    computed: {
        ...mapGetters(['currency'])
    },

    components: {
        'v-select': vSelect
    },

    props: {
        inventoryId: {
            type: Number,
            default: undefined
        },
        inventoryProductId: {
            type: Number,
            default: undefined
        }
    },

    data() {
        return {
            form: {},
            messages: {},
            products: [],
            inventoryProduct: {
                product: {}
            }
        }
    },

    methods: {
        submit() {
            if (
                this.form.product_id &&
                this.form.price &&
                (this.form.stock > -1 || this.form.unlimited_stock)
            ) {
                // Append inventory id if not updating mode
                if (!this.inventoryProduct) {
                    this.form.inventory_id = this.inventoryId
                }

                this.$emit('submit', this.form)
            } else {
                this.notifyError('Por favor revise el formulario')
                this.showMessages()
            }
        },

        async getInventoryProduct() {
            const data = await getInventoryProductById(this.inventoryProductId)
            this.form = data

            const product = await getProductById(data.product_id)
            this.inventoryProduct = data
            this.inventoryProduct.product = product
        },

        showMessages() {
            if (!this.form.product_id) {
                this.messages.product_id = 'Este campo es requerido'
            }
            this.$forceUpdate()
        },

        notifyError(text) {
            this.$buefy.toast.open({
                duration: 3000,
                message: text,
                position: 'is-bottom',
                type: 'is-danger'
            })
        },

        getProductName(product) {
            if (product)
                return `${product.name} - ${product.content} ${product.unit}`
        },

        focusInput(event) {
            event.target ? event.target.select() : null
        }
    },

    mounted() {
        if (this.inventoryProductId) {
            this.getInventoryProduct()
        }
    }
}
</script>

<style lang="scss" scoped></style>
