<template>
  <div class="sales-list">
    <!-- Table header -->
    <table class="table is-fullwidth">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Compras</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in 5" :key="'rw' + i">
          <td>
            <i class="user-icon mdi mdi-account-circle"></i>
          </td>
          <td>Jhon Doe</td>
          <td>6</td>
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
  .user-icon {
    color: rgb(75, 101, 124);
  }
}
</style>