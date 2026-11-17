<template>
    <div class="card">
        <header class="card-header">
            <p class="card-header-title">
                Detalles
            </p>
        </header>

        <div class="card-content">
            <div class="content">
                <list-item title="Nombre" :content="inventory.name" />

                <list-item
                    title="Ubicación"
                    :content="inventory.location || '-'"
                />

                <list-item
                    title="Descripción"
                    :content="inventory.description || '-'"
                />

                <list-item title="Total de productos">
                    <b-tag
                        type="is-info"
                        class="has-text-weight-bold"
                        rounded
                        >{{ totalProducts }}</b-tag
                    >
                </list-item>

                <list-item title="Ganancia bruta estimada">
                    <b-tag
                        type="is-success"
                        class="has-text-weight-bold"
                        rounded
                        >{{ currency }}{{ grossProfit }}</b-tag
                    >
                </list-item>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from '@/store/vuex-compat'
import ListItem from '../ui/ListItem.vue'

export default {
    name: 'inventory-summary',

    components: { ListItem },

    props: {
        inventory: {
            type: Object,
            default: () => ({})
        },

        totalProducts: {
            type: Number,
            default: 0
        },

        grossProfit: {
            type: [Number, String],
            default: 9
        }
    },

    computed: {
        ...mapGetters(['currency'])
    }
}
</script>

<style lang="scss" scoped></style>
