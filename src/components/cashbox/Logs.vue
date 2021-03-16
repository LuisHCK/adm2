<template>
    <card title="Movimientos de caja">
        <b-table
            :data="data"
            :loading="loading"
            :paginated="true"
            :pagination-simple="true"
            :per-page="50"
            :striped="true"
            :hoverable="true"
            sticky-header
            height="75vh"
        >
            <template>
                <b-table-column label="#" v-slot="props">
                    {{ props.row.id }}
                </b-table-column>

                <b-table-column label="Cantidad" v-slot="props">
                    <b-tag type="is-info" class="has-text-weight-bold" rounded>
                        {{ props.row.amount | money }}
                    </b-tag>
                </b-table-column>

                <b-table-column label="Tipo" v-slot="props">
                    <b-tag
                        class="has-text-weight-bold"
                        v-text="typeTypeOptions(props.row.type).label"
                        :type="typeTypeOptions(props.row.type).className"
                        rounded
                    />
                </b-table-column>

                <b-table-column label="Concepto" v-slot="props">
                    {{ props.row.concept }}
                </b-table-column>

                <b-table-column label="Referencia" v-slot="props">
                    {{ props.row.reference }}
                </b-table-column>

                <b-table-column label="Creado por" v-slot="props">
                    {{ props.row.created_by.name }}
                </b-table-column>

                <b-table-column label="Fecha" v-slot="props">
                    {{ props.row.date | moment('MMM DD YYYY, h:mm a') }}
                </b-table-column>
            </template>

            <template slot="empty">
                <section class="section">
                    <div class="content has-text-grey has-text-centered">
                        <p>
                            <b-icon icon="package-variant" size="is-large" />
                        </p>
                        <p>No hay registros para mostrar</p>
                    </div>
                </section>
            </template>
        </b-table>
    </card>
</template>

<script>
import Card from '../ui/Card.vue'
export default {
    components: { Card },

    name: 'logs',

    props: {
        data: {
            type: Array,
            default: () => []
        },

        loading: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        /**
         * @param {('add'|'subtract'|'close')} type
         */
        typeTypeOptions(type) {
            switch (type) {
                case 'add':
                    return {
                        label: 'Ingreso',
                        className: 'is-success'
                    }

                case 'subtract':
                    return {
                        label: 'Egreso',
                        className: 'is-warning'
                    }

                case 'close':
                    return {
                        label: 'Cierre',
                        className: 'is-danger'
                    }

                default:
                    return {
                        label: 'Tipo inválido',
                        className: 'is-dark'
                    }
            }
        }
    }
}
</script>

<style lang="scss" scoped></style>
