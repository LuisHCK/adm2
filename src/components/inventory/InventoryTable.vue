<template>
    <b-table
        :data="inventoryProducts"
        :striped="true"
        :hoverable="true"
        :loading="loading"
        :paginated="true"
        :pagination-simple="true"
        :per-page="perPage"
        :sticky-header="true"
        height="75vh"
        class="is-margin-top-1"
    >
        <template v-if="inventoryProducts.length">
            <b-table-column
                v-slot="props"
                field="id"
                label="ID"
                width="40"
                numeric
                >{{ props.row.id }}</b-table-column
            >

            <b-table-column v-slot="props" field="product_id" label="Nombre">
                <strong
                    v-text="props.row.product ? props.row.product.name : ''"
                />
                <br />
                <small
                    v-text="props.row.product ? props.row.product.brand : ''"
                />
            </b-table-column>

            <b-table-column v-slot="props" field="product" label="Presentación">
                <span
                    v-text="props.row.product ? props.row.product.content : ''"
                />
                <span
                    v-text="props.row.product ? props.row.product.unit : ''"
                />
            </b-table-column>

            <b-table-column
                v-slot="props"
                field="price"
                label="Precio Unitario"
            >
                <content-editable
                    :input-value="props.row.price"
                    input-type="number"
                    @submit="emitUpdateValue($event, props.row.id, 'price')"
                >
                    <b-tag type="is-info" class="has-text-weight-bold" rounded>
                        {{ currency }}{{ props.row.price }}
                    </b-tag>
                </content-editable>
            </b-table-column>

            <b-table-column v-slot="props" field="stock" label="Existencias">
                <content-editable
                    :input-value="props.row.stock"
                    input-type="number"
                    @submit="emitUpdateValue($event, props.row.id, 'stock')"
                >
                    <b-tag
                        type="is-primary"
                        class="has-text-weight-bold"
                        rounded
                    >
                        {{ props.row.stock }}
                    </b-tag>
                </content-editable>
            </b-table-column>

            <b-table-column v-slot="props" field="lot" label="Lote">
                <content-editable
                    :input-value="props.row.lot"
                    input-type="number"
                    @submit="emitUpdateValue($event, props.row.id, 'lot')"
                >
                    <b-tag
                        v-text="props.row.lot || '---'"
                        type="is-info"
                        class="has-text-weight-bold"
                        rounded
                    />
                </content-editable>
            </b-table-column>

            <b-table-column v-slot="props" field="codebar" label="Código">
                {{ props.row.product ? props.row.product.codebar : '' }}
            </b-table-column>

            <b-table-column v-slot="props" field="actions" label="Acciones">
                <b-field>
                    <div class="control">
                        <b-button
                            @click="emitUpdate(props.row.id)"
                            icon-left="pencil"
                            type="is-primary"
                            size="is-small"
                            rounded
                        />
                    </div>
                    <div class="control">
                        <b-button
                            @click="emitDelete(props.row)"
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
                        <b-icon icon="package-variant" size="is-large"></b-icon>
                    </p>
                    <p>No hay productos para mostrar.</p>
                </div>
            </section>
        </template>
    </b-table>
</template>

<script>
import { mapGetters } from 'vuex'
import ContentEditable from '../ui/ContentEditable.vue'

export default {
    components: { ContentEditable },
    name: 'inventory-table',

    props: {
        inventoryProducts: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        ...mapGetters(['currency'])
    },

    data() {
        return {
            perPage: 50
        }
    },

    methods: {
        emitDelete(inventoryProduct) {
            this.$emit('delete', inventoryProduct)
        },

        emitUpdate(inventoryProduct) {
            this.$emit('update', inventoryProduct)
        },

        emitUpdateValue(value, id, field) {
            this.$emit('update-price', { [field]: value, id })
        }
    }
}
</script>

<style lang="scss">
.table-wrapper {
    overflow-x: hidden;
}
</style>
