<template>
    <div class="panel">
        <div class="columns is-multiline">
            <!-- Sub total -->
            <div class="column is-half">
                <span>Subtotal</span>
            </div>
            <div class="column is-half has-text-right">
                <span v-text="`${currency}${shoppingCartTotal}`" />
            </div>
            <!-- Discounts -->
            <!-- <div class="column is-half">
                <span>Descuento</span>
            </div>
            <div class="column is-half has-text-right">
                <span>
                    <span v-text="`-${currency}${discounted} `" />
                    <small v-text="`(${discount}%)`" />
                </span>
            </div> -->
            <!-- Total -->
            <div class="column is-half">
                <span>TOTAL</span>
            </div>
            <div class="column is-half has-text-right">
                <strong
                    class="is-size-4 has-text-danger"
                    v-text="`${currency}${finalTotal}`"
                />
            </div>
        </div>

        <hr />

        <!-- payment section -->
        <div class="columns is-multiline">
            <div class="column is-one-third">
                <span>Paga con</span>
            </div>
            <div class="column is-two-thirds has-text-right">
                <b-input
                    ref="payWithInput"
                    @focus="focusSelect"
                    type="number"
                    v-model="payWith"
                    :min="1"
                    rounded
                />
            </div>
            <!-- Exchange -->
            <div class="column is-half">
                <span>Vuelto</span>
            </div>
            <div class="column is-half has-text-right">
                <strong
                    class="hast-text-success"
                    v-text="`${currency}${exchange}`"
                />
            </div>

            <!-- Type of sale -->
            <div class="column is-full">
                <span>Tipo de venta</span>
            </div>
            <div class="column is-full">
                <b-field position="is-right" rounded>
                    <b-radio-button
                        v-model="saleType"
                        name="sale-type"
                        :native-value="1"
                        type="is-success"
                        rounded
                    >
                        <b-icon icon="account-cash" />
                        Contado
                    </b-radio-button>
                    <b-radio-button
                        v-model="saleType"
                        name="sale-type"
                        :native-value="0"
                        type="is-warning"
                        rounded
                    >
                        <b-icon icon="credit-card-plus" />
                        Crédito
                    </b-radio-button>
                </b-field>
            </div>
        </div>

        <hr />

        <!-- Customer section -->
        <div class="columns is-multiline">
            <div class="column is-full">
                <span>Cliente</span>
            </div>
            <div class="column is-full" style="display: flex;">
                <v-select
                    label="name"
                    style="width: 100%;"
                    :options="customers"
                    @input="setCustomer"
                    :value="shoppingCartCustomer"
                >
                    <div slot="no-options">
                        No hay clientes registrados
                    </div>
                </v-select>
                <b-button
                    @click="showCustomerForm = true"
                    type="is-primary"
                    style="margin-left: 8px;"
                    size="is-small"
                >
                    <i class="mdi mdi-plus"></i>
                </b-button>
            </div>
        </div>

        <!-- Complete button -->
        <div>
            <b-button
                icon-left="send"
                type="is-success"
                @click="completeSale"
                :disabled="!shoppingCart.length"
                expanded
                rounded
            >
                COMPLETAR VENTA
            </b-button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
    name: 'pos-summary',

    components: {
        vSelect
    },

    props: {
        shoppingCartTotal: {
            type: Number,
            default: 0
        },

        shoppingCartCustomer: {
            type: Object,
            default: () => {}
        },

        shoppingCart: {
            type: Array,
            default: () => []
        },

        finalTotal: {
            type: Number,
            default: 0
        }
    },

    computed: {
        ...mapGetters(['currency']),
        exchange() {
            return this.finalTotal > 0 && this.payWith
                ? this.payWith - this.finalTotal
                : 0
        }
    },

    watch: {
        payWith(newValue, oldValue) {
            if (newValue !== oldValue) this.$emit('changePayWith', newValue)
        },

        saleType(newVal, oldVal) {
            if (newVal !== oldVal) this.$emit('changeSaleType', newVal)
        }
    },

    data() {
        return {
            discounted: 0,
            discount: 0,
            payWith: undefined,
            saleType: 1,
            customers: []
        }
    },

    methods: {
        focusSelect(event) {
            event.target.select()
        },

        /**
         * Set customer for of this shopping cart
         */
        setCustomer(event) {
            this.$emit('setCustomer', event)
        },

        async getCustomers() {
            this.customers = await Database.customer.toArray()
        },

        completeSale() {
            this.$emit('submit')
        }
    },

    mounted() {
        this.getCustomers()
    }
}
</script>

<style lang="scss" scoped>
.panel {
    padding: 15px 20px;
}
</style>
