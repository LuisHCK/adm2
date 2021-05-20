<template>
    <div class="sales-list">
        <!-- Table header -->
        <b-table
            :data="sales"
            :striped="true"
            :hoverable="true"
            :sticky-header="true"
        >
            <template>
                <b-table-column field="total" label="Total" v-slot="props">
                    <span class="has-text-weight-bold">
                        {{ props.row.total | money }}
                    </span>
                </b-table-column>

                <b-table-column field="customer" label="Cliente" v-slot="props">
                    {{ props.row.customer.name || "--" }}
                </b-table-column>

                <b-table-column field="customer" label="Fecha" v-slot="props">
                    {{ props.row.created_at | moment('MMM DD YYYY, h:mm a') }}
                </b-table-column>
            </template>

            <template slot="empty">
                <empty-table-card />
            </template>
        </b-table>
    </div>
</template>

<script>
import EmptyTableCard from '../ui/EmptyTableCard.vue'
export default {
    name: 'sales-list',

    components: {EmptyTableCard},

    props: {
        sales: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<style lang="scss" scoped>
.sales-list {
    .list-item {
    }
}
</style>
