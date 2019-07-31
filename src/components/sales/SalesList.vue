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
        <tr v-for="(item, i) in sales" :key="'sale_item' + i">
          <td class="has-text-weight-bold">C${{ item.total }}</td>
          <td>{{ item.customer.name }}</td>
          <td>{{ item.created_at | moment("MMM DD YYYY, h:mm a") }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'sales-list',
  
  props: {
    sales: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style lang="scss" scoped>
.sales-list {
  .list-item {
  }
}
</style>