<template>
  <div class="pos-page">
    <div class="panel">
      <div class="columns">
        <div class="column is-6">
          <product-search @input="addInventoryProduct"/>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="panel">
          <table class="table is-full-width">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Existencias</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Sub total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(inventoryProduct, index) in shoppingCart" :key="'ip-' + index">
                <td>{{ index + 1 }}</td>
                <td>
                  <div>{{ inventoryProduct.product.name }}</div>
                  <small>{{ inventoryProduct.inventory.name }}</small>
                </td>
                <td>
                  <b-tag
                    :type="inventoryProduct.quantity > 1? 'is-success':'is-warning'"
                    v-text="`${inventoryProduct.quantity} ${inventoryProduct.product.unit}`"
                  />
                </td>
                <td>
                  <input
                    :ref="`qty-input-${index}`"
                    class="quantity-input"
                    type="number"
                    min="1"
                    :value="inventoryProduct.buyQty || 1"
                    :max="inventoryProduct.quantity"
                    @input="setInventoryProductBuyQty(index, $event)"
                  >
                </td>
                <td>
                  <span v-text="`C$${inventoryProduct.price}`"/>
                </td>
                <td>
                  <b-tag type="is-success" v-text="`C$${getSubTotal(inventoryProduct)}`"/>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="column is-4-desktop is-4-tablet">
        <div class="panel">
          <div class="has-text-centered">
            <h3 class="is-size-5">Venta</h3>
            <hr>
            <h1 class="is-size-2 has-text-primary">C$150</h1>
            <span>Total</span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductSearch from "@/components/pos/ProductSearch.vue";
import { mapState } from "vuex";

export default {
  components: {
    ProductSearch
  },

  computed: {
    ...mapState(["shoppingCart"])
  },

  data() {
    return {
      quantities: []
    };
  },

  methods: {
    addInventoryProduct(data) {
      let index;
      const exists = this.shoppingCart.find((inventoryProduct, idx) => {
        if (inventoryProduct.id == data.id) {
          index = idx;
          return true;
        }
      });

      // if exists increase by 1
      if (exists) {
        // Get current value or set 0 by default, then add 1
        let buyQty = exists.buyQty || 0;
        buyQty += 1;

        // Call Mutation if quantity is smaller o eq to existences
        if (buyQty <= exists.quantity) {
          this.$store.commit("setInventoryProductBuyQty", {
            index,
            quantity: buyQty
          });

          // If theres no enoguht products show error
        } else {
          this.showErrorToast("Inventario agotado");
        }

        // Update Quantity input
        this.$refs[`qty-input-${index}`].value = buyQty;

        // Add product to cart
      } else {
        this.$store.commit("addInventoryProduct", data);
      }
    },

    /**
     * Call muttation to add Product Buy Quantity
     */
    setInventoryProductBuyQty(index, event) {
      this.$store.commit("setInventoryProductBuyQty", {
        index,
        quantity: event.target.value
      });
    },

    getSubTotal(inventoryProduct) {
      return Number(inventoryProduct.price) * Number(inventoryProduct.buyQty);
    },

    showErrorToast(message) {
      this.$toast.open({
        message: message,
        type: "is-danger",
        position: "is-bottom"
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.quantity-input {
  width: 80px;
  height: 32px;
}
</style>