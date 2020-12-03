<template>
    <div class="sales-list">
        <!-- Table header -->
        <table class="table is-fullwidth">
            <thead>
                <tr>
                    <th>Total</th>
                    <th>Cliente</th>
                    <th>Hora</th>
                </tr>
            </thead>
            <tbody>
                <template v-if="sales.length">
                    <tr v-for="(item, i) in sales" :key="'sale_item' + i">
                        <td class="has-text-weight-bold">
                            {{ currency }}
                            {{ item.total }}
                        </td>
                        <td>{{ item.customer.name }}</td>
                        <td>
                            {{
                                item.created_at | moment('MMM DD YYYY, h:mm a')
                            }}
                        </td>
                    </tr>
                </template>

                <template v-else>
                    <tr>
                        <th colspan="3">No hay ventas registradas</th>
                    </tr>
                </template>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3">
                        <router-link :to="{ path: 'sales' }"
                            >Todas las ventas</router-link
                        >
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'sales-list',

    computed: {
        ...mapGetters(['currency'])
    },

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
