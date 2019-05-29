<template>
  <div>
    <button class="button is-primary is-small is-pulled-right" @click="showForm=!showForm">Nuevo</button>
    <h1 class="has-text-weight-bold" v-text="inventory.name"/>
    <hr>

    <ul>
      <li>item</li>
      <li
        v-for="inventoryProduct in inventoryProducts"
        :key="inventoryProduct.id"
      >{{ inventoryProduct }}</li>
    </ul>

    <!-- Product modal form -->
    <b-modal :active.sync="showForm" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Agregar un nuevo producto</p>
        </header>
        <section class="modal-card-body">
          <inventory-product-form
            :inventory-id="inventory.id"
            :show="showForm"
            @submit="saveInventoryProduct"
          />
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import InventoryProductForm from "@/components/inventory/InventoryProductForm.vue";

export default {
  components: {
    InventoryProductForm
  },

  data() {
    return {
      inventory: {},
      inventoryProducts: [],
      showForm: false
    };
  },

  methods: {
    getInventoryProducts() {
      Database.inventory_product
        .where({ inventory_id: this.inventory.id })
        .toArray()
        .then(data => (this.inventoryProducts = data))
        .catch(err => console.log(err));
    },

    saveInventoryProduct(data) {
      Database.inventory_product
        .add(data)
        .then(() => this.getInventoryProducts())
        .catch(err => console.log(err));
    },

    getInventory() {
      const inventoryId = this.$route.params.id;

      Database.inventory.get(inventoryId, data => {
        this.inventory = data;
        this.getInventoryProducts();
      });
    }
  },

  mounted() {
    this.getInventory();
  }
};
</script>

<style lang="scss" scoped>
</style>