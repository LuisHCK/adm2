<template>
    <card title="Movimientos de caja">
        <b-table :data="data" :loading="loading" sticky-header>
            <template>
                <b-table-column label="#" v-slot="props">
                    {{ props.row.id }}
                </b-table-column>

                <b-table-column label="Cantidad" v-slot="props">
                    {{ props.row.amount | money }}
                </b-table-column>

                <b-table-column label="Concepto" v-slot="props">
                    {{ props.row.gender }}
                </b-table-column>

                <b-table-column label="Creado por" v-slot="props">
                    {{ props.row.user_id }}
                </b-table-column>

                <b-table-column label="Fecha" v-slot="props">
                    {{ props.row.date }}
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

    name: 'transactions',

    props: {
        data: {
            type: Array,
            default: () => []
        },

        loading: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style lang="scss" scoped></style>
