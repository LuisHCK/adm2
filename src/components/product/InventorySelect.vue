<template>
    <div class="modal-card">
        <header class="modal-card-head">
            <span class="modal-card-title"
                >Seleccione el inventario destino</span
            >
        </header>

        <section class="modal-card-body">
            <section class="inventory-select">
                <div
                    v-for="(inventory, index) in inventories"
                    :key="'inventory-' + index"
                    class="field"
                >
                    <b-radio
                        v-model="selecetedInventory"
                        :native-value="inventory.id"
                    >
                        {{ inventory.name }}
                    </b-radio>
                </div>
            </section>
        </section>

        <footer class="modal-card-foot">
            <button
                :disabled="!selecetedInventory"
                class="button is-primary"
                @click="emitSelection"
            >
                Guardar
            </button>
            <button class="button" @click="$emit('cancel')">
                Cancelar
            </button>
        </footer>
    </div>
</template>

<script>
import InventoryCard from '@/components/inventory/InventoryCard.vue'

export default {
    name: 'inventory-select',

    components: {
        InventoryCard
    },

    data() {
        return {
            selecetedInventory: undefined
        }
    },

    props: {
        inventories: {
            type: Array,
            default: () => []
        }
    },

    methods: {
        emitSelection() {
            if (this.selecetedInventory) {
                this.$emit(
                    'select',
                    this.inventories.find(i => i.id === this.selecetedInventory)
                )
            }
        }
    }
}
</script>

<style lang="scss" scoped></style>
