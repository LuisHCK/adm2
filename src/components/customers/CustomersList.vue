<template>
    <div class="sales-list">
        <!-- Table header -->
        <table class="table is-fullwidth">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Compras de contado</th>
                    <th>Compras al crédito</th>
                    <th align="right">Opciones</th>
                </tr>
            </thead>
            <tbody>
                <template v-if="customers.length">
                    <tr v-for="(customer, i) in customers" :key="i">
                        <td>
                            <i class="user-icon mdi mdi-account-circle"></i>
                        </td>
                        <td v-text="customer.name"></td>
                        <td>
                            <b-tag
                                v-text="customer.cash_purchases"
                                type="is-success"
                                class="has-text-weight-bold"
                                rounded
                            />
                        </td>
                        <td>
                            <b-tag
                                v-text="customer.credit_purchases"
                                type="is-danger"
                                class="has-text-weight-bold"
                                rounded
                            />
                        </td>
                        <td align="right">
                            <b-button
                                type="is-info"
                                @click="
                                    $router.push('/customers/' + customer.id)
                                "
                                size="is-small"
                                icon-left="eye"
                                rounded
                            >
                                Ver cliente
                            </b-button>
                        </td>
                    </tr>
                </template>
                <template v-else>
                    <tr>
                        <th colspan="5">No hay resultados</th>
                    </tr>
                </template>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5">
                        <router-link :to="{ path: 'customers' }"
                            >Todos los clientes</router-link
                        >
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<script>
export default {
    name: 'customers-list',

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
