<template>
    <div class="pos-table">
        <b-table
            :data="shoppingCart"
            :striped="true"
            :hoverable="true"
            :sticky-header="true"
        >
            <template>
                <b-table-column
                    field="index"
                    label="#"
                    width="40"
                    numeric
                    v-slot="props"
                >
                    {{ props.index + 1 }}
                </b-table-column>

                <b-table-column
                    field="inventoryProduct"
                    label="Producto"
                    v-slot="props"
                >
                    <div>
                        {{ getProductName(props.row.inventoryProduct.product) }}
                    </div>
                    <small>
                        {{ props.row.inventoryProduct.inventory.name }}
                    </small>
                </b-table-column>

                <b-table-column
                    field="inventoryProduct"
                    label="Existencias"
                    v-slot="props"
                >
                    {{
                        props.row.inventoryProduct.unlimited_stock
                            ? 'Ilimitado'
                            : props.row.inventoryProduct.stock
                    }}
                </b-table-column>

                <b-table-column
                    field="inventoryProduct"
                    label="Precio"
                    v-slot="props"
                >
                    <span class="price">
                        {{ props.row.inventoryProduct.price | money }}
                    </span>
                </b-table-column>

                <b-table-column
                    field="inventoryProduct"
                    label="Cantidad"
                    v-slot="props"
                >
                    <input
                        :id="`qtyInput-${props.row.inventoryProduct.id}`"
                        :ref="`qty-input-${props.index}`"
                        class="quantity-input input is-rounded"
                        type="number"
                        min="1"
                        :value="props.row.quantity || 1"
                        :max="props.row.inventoryProduct.stock"
                        @input="
                            emitQuantityUpdate(
                                props.index,
                                $event,
                                props.row.inventoryProduct.stock
                            )
                        "
                        @change="
                            emitQuantityUpdate(
                                props.index,
                                $event,
                                props.row.inventoryProduct.stock
                            )
                        "
                        @focus="focusSelect"
                    />
                </b-table-column>

                <b-table-column
                    field="inventoryProduct"
                    label="Descuento%"
                    v-slot="props"
                >
                    <b-field>
                        <b-numberinput
                            class="discount-input"
                            :controls="false"
                            :max="100"
                            :min="0"
                            :value="props.row.discount"
                            @input="emitDiscountChange($event, props.index)"
                            @focus="focusSelect"
                            rounded
                        />
                    </b-field>
                </b-table-column>

                <b-table-column
                    field="inventoryProduct"
                    label="Subtotal"
                    v-slot="props"
                >
                    <div
                        v-if="props.row.discount && props.row.discounted"
                        class="discounted"
                    >
                        <div class="original-price">
                            {{ props.row.subTotal | money }}
                        </div>

                        <div class="updated-price sub-total">
                            {{
                                (props.row.subTotal - props.row.discounted)
                                    | money
                            }}
                        </div>
                    </div>
                    <div class="sub-total" v-else>
                        {{ props.row.subTotal | money }}
                    </div>
                </b-table-column>

                <b-table-column
                    field="inventoryProduct"
                    label=""
                    v-slot="props"
                >
                    <b-button
                        type="is-danger"
                        size="is-small"
                        @click="emitRemoveItem(props.index)"
                        rounded
                        icon-left="delete"
                    />
                </b-table-column>
            </template>

            <template slot="empty">
                <section class="section">
                    <div class="content has-text-grey has-text-centered">
                        <p>
                            <b-icon icon="package-variant" size="is-large" />
                        </p>
                        <p>No hay productos para mostrar.</p>
                    </div>
                </section>
            </template>
        </b-table>
    </div>
</template>

<script>
import { mapState } from 'vuex'

let discountTimeout

export default {
    name: 'products-table',

    computed: {
        ...mapState(['shoppingCart'])
    },

    methods: {
        getProductName(product) {
            return `${product.name} - ${product.content} ${product.unit}`
        },

        emitQuantityUpdate(index, event, stock) {
            this.$emit('onQuantityChange', index, event, stock)

            // Focus when add 0
            if (!event.target.value) {
                setTimeout(() => {
                    this.focusSelect(event)
                }, 100)
            }
        },

        emitDiscountChange(event, index) {
            clearTimeout(discountTimeout)

            discountTimeout = setTimeout(() => {
                this.$emit('onDiscountChange', { event, index })
            }, 500)
        },

        emitRemoveItem(index) {
            this.$emit('onRemoveItem', index)
        },

        focusSelect(event) {
            event.target.select()
        }
    }
}
</script>

<style lang="scss">
.pos-table {
    .discounted {
        .original-price {
            font-size: 12px;
            text-decoration: line-through;
            color: #636363;
        }
    }

    .quantity-input,
    .discount-input .input {
        max-width: 92px;
        text-align: center;
        font-weight: bold !important;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        /* Firefox */
        &[type='number'] {
            -moz-appearance: textfield;
        }
    }

    .price,
    .sub-total {
        font-size: 18px;
        font-weight: bolder;
    }

    .table-wrapper {
        height: 100% !important;
    }
}
</style>
