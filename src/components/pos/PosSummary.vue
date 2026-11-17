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
                    {{ $money(shoppingCartTotal) }}
                </span>
            </div>
            <!-- Total -->
            <div class="column is-half">
                <span>TOTAL</span>
            </div>
            <div class="column is-half has-text-right">
                <strong class="is-size-4 has-text-danger">
                    {{ $money(finalTotal) }}
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
                    {{ $money(exchange) }}
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
                <b-autocomplete
                    :value="
                        shoppingCartCustomer ? shoppingCartCustomer.name : ''
                    "
                    :data="customers"
                    field="name"
                    placeholder="Buscar cliente"
                    icon="account-search"
                    style="width: 100%;"
                    clearable
                    @select="setCustomer"
                    @update:model-value="handleCustomerInput"
                >
                    <template #empty>
                        No hay clientes registrados
                    </template>
                </b-autocomplete>
                <b-button
                    @click="showCustomerForm = true"
                    type="is-primary"
                    style="margin-left: 8px;"
                    size="is-small"
                    aria-label="Agregar cliente"
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
                        aria-label="Cancelar venta"
                        rounded
                    />
                </div>
            </div>
        </div>

        <b-modal v-model="showCustomerForm" has-modal-card trap-focus>
            <modal-card @close="showCustomerForm = false">
                <customer-form @onSave="handleCustomerSave()" />
            </modal-card>
        </b-modal>
    </div>
</template>

<script>
import database from "@/db"
import { mapGetters } from '@/store/vuex-compat'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import ModalCard from '@/components/ui/ModalCard.vue'

export default {
    name: 'pos-summary',

    components: {
        CustomerForm,
        ModalCard,
    },

    props: {
        shoppingCartTotal: {
            type: Number,
            default: 0,
        },

        shoppingCartCustomer: {
            type: Object,
            default: () => ({}),
        },

        shoppingCart: {
            type: Array,
            default: () => [],
        },

        finalTotal: {
            type: Number,
            default: 0,
        },
    },

    computed: {
        ...mapGetters(['currency']),

        exchange() {
            return this.finalTotal > 0 && this.payWith
                ? this.payWith - this.finalTotal
                : 0
        },
    },

    watch: {
        payWith(newValue, oldValue) {
            if (newValue !== oldValue) this.$emit('changePayWith', newValue)
        },

        saleType(newVal, oldVal) {
            if (newVal !== oldVal) this.$emit('changeSaleType', newVal)
        },
    },

    data() {
        return {
            discounted: 0,
            discount: 0,
            payWith: undefined,
            saleType: 1,
            customers: [],
            showCustomerForm: false,
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

        handleCustomerInput(value) {
            if (!value) {
                this.setCustomer({})
            }
        },

        async getCustomers() {
            this.customers = await database.customer.toArray()
        },

        completeSale() {
            this.$emit('submit')
        },

        async handleCustomerSave() {
            this.showCustomerForm = false
            await this.getCustomers()
            this.setCustomer(this.customers.pop())
        },
    },

    mounted() {
        this.getCustomers()
    },
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
