<template>
    <div class="panel">
        <h2
            class="is-size-5-mobile is-size-4-desktop has-text-weight-bold mb-4"
        >
            Resúmen
        </h2>
        <div class="columns is-mobile is-multiline">
            <!-- Sub total -->
            <div class="column is-half-desktop">
                <span>Subtotal</span>
            </div>
            <div class="column is-half has-text-right">
                <span>
                    {{ shoppingCartTotal | money }}
                </span>
            </div>
            <!-- Total -->
            <div class="column is-half">
                <span>TOTAL</span>
            </div>
            <div class="column is-half has-text-right">
                <strong class="is-size-4 has-text-danger">
                    {{ finalTotal | money }}
                </strong>
            </div>
        </div>

        <hr />

        <!-- payment section -->
        <div class="columns is-mobile is-multiline">
            <div class="column is-one-third">
                <span>Paga con</span>
            </div>
            <div class="column is-two-thirds has-text-right">
                <b-field>
                    <p class="control">
                        <span
                            class="button is-static is-rounded has-text-weight-bold"
                            v-text="currency"
                        />
                    </p>
                    <b-input
                        ref="payWithInput"
                        @focus="focusSelect"
                        type="number"
                        v-model="payWith"
                        :min="1"
                        rounded
                    />
                </b-field>
            </div>
            <!-- Exchange -->
            <div class="column is-half">
                <span>Cambio</span>
            </div>

            <div class="column is-half has-text-right">
                <strong class="hast-text-success">
                    {{ exchange | money }}
                </strong>
            </div>

            <!-- Type of sale -->
            <div class="column is-full-desktop is-half-mobile">
                <span>Tipo de venta</span>
            </div>

            <div class="column is-full-desktop is-half-mobile">
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
        <div class="columns is-mobile is-multiline">
            <div class="column is-full-desktop is-one-quarter-mobile">
                <span>Cliente</span>
            </div>
            <div class="column is-full-desktop" style="display: flex;">
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
        <div class="complete-sale-button">
            <div class="field is-grouped">
                <div class="control complete">
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

                <div class="control">
                    <b-button
                        type="is-danger"
                        @click="cancelSale"
                        icon-right="delete"
                        :disabled="!shoppingCart.length"
                        rounded
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { mapGetters } from 'vuex'

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

        cancelSale() {
            this.$store.commit('CLEAR_SHOPPING_CART')
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

.complete-sale-button {
    display: flex;
    justify-content: center;
    z-index: 10;

    .field {
        width: 100%;
    }

    .complete {
        flex-grow: 1;
    }

    @media only screen and (max-width: 981px) {
        position: fixed;
        background-color: white;
        width: 100%;
        left: 0;
        bottom: 0;
        padding: 20px 30px;
        box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1),
            0 0px 0 1px rgba(10, 10, 10, 0.02);
    }
}
</style>
