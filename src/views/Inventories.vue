<template>
  <div class="page-container">
    <div class="columns is-mobile is-multiline">
      <div
        class="column is-half-desktop"
        v-for="inventory in inventories"
        :key="inventory.id"
        :inventory="inventory"
      >
        <inventory-card :inventory="inventory" />
      </div>
    </div>

    <section class="section" v-if="!inventories.length">
      <div class="content has-text-grey has-text-centered">
        <p>
          <b-icon icon="package-variant" size="is-large"></b-icon>
        </p>
        <p>No hay inventarios para mostrar.</p>
      </div>
    </section>

    <!-- inventory modal form -->
    <b-modal :active.sync="showForm" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Agregar un nuevo producto</p>
        </header>
        <section class="modal-card-body">
          <inventory-form :show="showForm" @submit="saveInventory" />
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import InventoryCard from '@/components/inventory/InventoryCard.vue'
import InventoryForm from '@/components/inventory/InventoryForm.vue'

export default {
  name: 'inventories',

  components: {
    InventoryCard,
    InventoryForm
  },

  data() {
    return {
      inventories: [],
      showForm: false
    }
  },

  methods: {
    getInventories() {
      Database.inventory
        .toArray()
        .then(inventories => {
          this.inventories = inventories
        })
        .catch(err => console.log(err))
    },

    saveInventory(data) {
      // Append timestaps
      const now = new Date()
      data.created_at = now.toISOString()
      data.updated_at = now.toISOString()

      Database.inventory
        .add(data)
        .then(res => {
          this.getInventories()
          this.showForm = false
        })
        .catch(err => console.log(err))
    },

    setActionButtons() {
      const addInventory = {
        type: 'is-success',
        icon: 'plus',
        label: 'Nuevo Inventario',
        action: () => {
          this.showForm = true
        }
      }
      this.$store.commit('SET_ACTION_BUTTONS', [addInventory])
    }
  },

  mounted() {
    this.getInventories()
    this.setActionButtons()
  }
}
</script>

<style lang="scss" scoped>
.inventory-list {
  display: flex;
  flex-wrap: wrap;
  .inventory-card {
    width: 50%;
  }
}
</style>
