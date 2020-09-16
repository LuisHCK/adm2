<template>
    <div class="container">
        <b-table
            :paginated="true"
            :pagination-simple="true"
            :per-page="perPage"
            :data="products"
            :striped="true"
            :hoverable="true"
            :loading="loading"
            :sticky-header="true"
            height="350px"
        >
            <template slot-scope="props">
                <b-table-column field="id" label="ID" width="40" numeric>{{
                    props.row.id
                }}</b-table-column>

                <b-table-column field="name" label="Nombre">
                    <strong>{{ props.row.name }}</strong>
                </b-table-column>

                <b-table-column field="brand" label="Marca">{{
                    props.row.brand
                }}</b-table-column>

                <b-table-column field="unit" label="Presentación">
                    <b-tag type="is-primary">
                        {{ props.row.content }}
                        {{ props.row.unit }}
                    </b-tag>
                </b-table-column>

                <b-table-column field="codebar" label="Código">{{
                    props.row.codebar
                }}</b-table-column>

                <b-table-column field="stock" label="Existencias">
                    <b-field>
                        <b-numberinput
                            :controls="false"
                            type="is-info"
                            :min="0"
                            :step="0.01"
                            controls-position="compact"
                            v-model="props.row.stock"
                            @focus="handleFocus"
                        />
                    </b-field>
                </b-table-column>
                <b-table-column field="price" label="Precio">
                    <b-field>
                        <b-numberinput
                            :controls="false"
                            type="is-info"
                            :min="0"
                            :step="0.01"
                            controls-position="compact"
                            v-model="props.row.price"
                            @focus="handleFocus"
                        />
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

        <!-- Submit -->

        <div class="options">
            <div class="buttons">
                <b-button
                    :type="selectedInventory? 'is-success':'is-primary'"
                    icon-left="content-save"
                    @click="$emit('save')"
                >
                    {{selectedInventory? 'Guardar':'Continuar'}}
                </b-button>

                <b-button @click="$emit('close')">
                    Cancelar
                </b-button>
            </div>

            <span>
                <b>Inventario: </b>
                <span class="inventory-name" @click="$emit('select-inventory')">
                    {{
                        selectedInventory
                            ? selectedInventory.name
                            : 'Sin seleccionar'
                    }}
                </span>
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ImportProducts',

    props: {
        products: {
            type: Array,
            default: () => []
        },
        selectedInventory: {
            type: Object,
            default: () => {}
        }
    },

    data() {
        return {
            loading: false,
            perPage: 100
        }
    },

    methods: {
        handleClose() {
            this.$emit('cancel')
        },

        handleFocus(e) {
            e.target.select()
        }
    }
}
</script>

<style>
.options {
    display: flex;
    align-items: center;
}

.buttons,
.button {
    margin-bottom: 0px !important;
}

.buttons {
    margin-right: 24px;
}

.inventory-name {
    text-decoration: underline;
    cursor: pointer;
}
</style>
