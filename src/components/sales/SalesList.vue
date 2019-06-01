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
        <tr v-for="(item, i) in 5" :key="'rw' + i">
          <td>C$150</td>
          <td>Jhon Doe</td>
          <td>31 May, 8:32 am</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.sales-list {
  .list-item {
  }
}
</style>