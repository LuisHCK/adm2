<template>
  <div>
    <button class="button is-success is-rounded is-pulled-right" @click="showForm=!showForm">
      <span>Nuevo</span>
      <b-icon icon="plus"></b-icon>
    </button>
    <h1 class="has-text-weight-bold">Inventarios</h1>

    <hr />

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
    }
  },

  mounted() {
    this.getInventories()
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