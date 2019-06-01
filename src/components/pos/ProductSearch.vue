<template>
  <div class="product-search">
    <form autocomplete="off" @submit.prevent="submit">
      <input
        autocomplete="off"
        id="searchInput"
        type="text"
        class="input"
        required
        v-model="searchValue"
        placeholder="Buscar producto"
        @blur="blurredInput"
        @input="changeInput"
        @focus="focusInput"
      >
      <div class="search-result" v-if="showResults && loadComplete">
        <ul v-if="results.length">
          <li
            v-for="(inventoryProduct, i) in results"
            :key="`res-${i}`"
            @click="selectInventoryProduct(inventoryProduct)"
          >
            <div class="left-info">
              <strong>
                {{ inventoryProduct.product.name }}
                <b-tag>{{ inventoryProduct.product.codebar }}</b-tag>
              </strong>
              <small>{{ inventoryProduct.product.brand }} | {{ inventoryProduct.inventory.name }}</small>
            </div>
            <div class="right-info">
              <b-tag type="is-info">Disp: {{ inventoryProduct.stock }}</b-tag>
            </div>
          </li>
        </ul>
        <div class="no-results" v-else>
          <i class="mdi mdi-file-outline"></i>
          <span>No hay resultados</span>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'product-search',

  data() {
    return {
      searchValue: undefined,
      inventoryProducts: [],
      showResults: false,
      loadComplete: false
    }
  },

  computed: {
    results() {
      return this.searchProduct()
    }
  },

  methods: {
    submit() {
      if (this.inventoryProducts.length) {
        this.selectInventoryProduct(this.inventoryProducts[0])
        this.blurredInput()
      }
    },

    /**
     * Hide results on blur
     */
    blurredInput() {
      setTimeout(() => {
        this.showResults = false
      }, 300)
    },

    changeInput() {
      this.showResults = true
    },

    focusInput() {
      if (this.searchValue) {
        this.showResults = true
      }
    },

    /**
     * Load all inventory products
     */
    getInventoryProducts() {
      Database.inventory_product.toArray().then(data => {
        this.inventoryProducts = data
        this.getRelationships()
      })
    },

    /**
     * Force load relationships
     */
    getRelationships(data) {
      this.inventoryProducts.map(inventoryProduct => {
        // Get products
        Database.product.get(
          inventoryProduct.product_id,
          product => (inventoryProduct.product = product)
        )
        // Get inventory
        Database.inventory.get(
          inventoryProduct.inventory_id,
          inventory => (inventoryProduct.inventory = inventory)
        )
      })
      this.loadComplete = true
    },

    /**
     * Filter Inventory Products by search input value
     */
    searchProduct() {
      if (this.loadComplete) {
        return this.inventoryProducts.filter(inventoryProduct => {
          // If product codebar match instantly return
          if (this.codebarMatch(inventoryProduct.product.codebar)) {
            this.selectInventoryProduct(inventoryProduct)
            return true
          }
          return (
            this.compare(inventoryProduct.product.name, this.searchValue) ||
            this.compare(inventoryProduct.product.codebar, this.searchValue) ||
            this.compare(inventoryProduct.product.brand, this.searchValue) ||
            this.compare(inventoryProduct.product.brand, this.searchValue)
          )
        })
      } else {
        return []
      }
    },

    codebarMatch(codebar) {
      return String(codebar).toLowerCase() == this.searchValue.toLowerCase()
    },

    /**
     * Normalize and compare 2 values
     */
    compare(val1, val2) {
      const source = String(val1).toLowerCase()
      return source.search(val2.toLowerCase()) !== -1
    },

    /**
     * Emit Inventory Product selection
     */
    selectInventoryProduct(inventoryProduct) {
      this.$emit('input', inventoryProduct)
      this.searchValue = ''
      this.blurredInput()
    }
  },

  mounted() {
    this.getInventoryProducts()
    // Focus search box
    const searchInput = document.getElementById('searchInput').focus()
  }
}
</script>

<style lang="scss" scoped>
.product-search {
  position: relative;
  input {
    width: 100%;
  }
  .search-result {
    position: absolute;
    max-height: 200px;
    min-height: 100px;
    width: 100%;
    background-color: rgb(255, 255, 255);
    left: 0;
    border: 1px solid #dadada;
    border-end-end-radius: 6px;
    border-end-start-radius: 6px;
    overflow-y: scroll;
    transition: 0.3s;
    z-index: 1;

    li {
      padding: 8px 10px;
      border-bottom: 1px solid #eeeeee;
      cursor: pointer;
      display: flex;

      .left-info {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      .right-info {
        display: flex;
        justify-content: flex-end;
        width: 30%;
      }
      &:hover {
        background-color: #fafafa;
      }
    }

    .no-results {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;

      .mdi {
        font-size: 26pt;
      }
    }
  }
}
</style>