<template>
    <div class="sales-list">
        <!-- Table header -->
        <b-table
            :data="customers"
            :striped="true"
            :hoverable="true"
            :sticky-header="true"
        >
            <template>
                <b-table-column label="" field="id">
                    <i class="user-icon mdi mdi-account-circle" />
                </b-table-column>

                <b-table-column label="Nombre" field="customer" v-slot="props">
                    {{ props.row.name }}
                </b-table-column>

                <b-table-column
                    label="Compras de contado"
                    field="customer"
                    v-slot="props"
                >
                    <b-tag
                        v-text="props.row.cash_purchases"
                        type="is-success"
                        class="has-text-weight-bold"
                        rounded
                    />
                </b-table-column>

                <b-table-column
                    label="Compras a crédito"
                    field="customer"
                    v-slot="props"
                >
                    <b-tag
                        v-text="props.row.credit_purchases"
                        type="is-danger"
                        class="has-text-weight-bold"
                        rounded
                    />
                </b-table-column>

                <b-table-column label="" v-slot="props">
                    <b-button
                        type="is-info"
                        @click="$router.push('/customers/' + props.row.id)"
                        size="is-small"
                        icon-left="eye"
                        rounded
                    >
                        Ver cliente
                    </b-button>
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
    name: 'customers-list',

    components: { EmptyTableCard },

    data() {
        return {
            ready: false,
            customers: []
        }
    },

    methods: {
        async getCustomers() {
            const customers = await Database.customer
                .orderBy('created_at')
                .reverse()
                .limit(5)
                .toArray()

            // Workaround: Wait until each customer is updated
            await Promise.all(
                customers.map(async customer => {
                    customer.cash_purchases = await this.getPurchasesCount(
                        customer.id,
                        'cash'
                    )
                    customer.credit_purchases = await this.getPurchasesCount(
                        customer.id,
                        'credit'
                    )
                })
            )

            this.customers = [...customers]
        },

        getPurchasesCount(customerId, saleType = 'cash') {
            return Database.sale
                .where({ customer_id: customerId, sale_type: saleType })
                .count()
        }
    },

    mounted() {
        this.getCustomers()
    }
}
</script>

<style lang="scss" scoped>
.sales-list {
    .user-icon {
        color: rgb(75, 101, 124);
    }
}
</style>
