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
                        {{ $money(props.row.total) }}
                    </span>
                </b-table-column>

                <b-table-column field="customer" label="Cliente" v-slot="props">
                    {{ props.row.customer.name || "--" }}
                </b-table-column>

                <b-table-column field="customer" label="Fecha" v-slot="props">
                    {{ $date(props.row.created_at, 'MMM dd yyyy, h:mm a') }}
                </b-table-column>
            </template>

            <template #empty>
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
