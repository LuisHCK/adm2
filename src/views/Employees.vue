<template>
  <div>
    <button class="button is-success is-pulled-right is-rounded">
      <span>Nuevo</span>
      <b-icon icon="plus"></b-icon>
    </button>
    <h1 class="has-text-weight-bold" v-text="'Empleados'" />
    <hr />
  </div>
</template>

<script>
export default {
  name: 'employees',

  data() {
    return {
      employees: []
    }
  },

  methods: {
    getEmployees() {
      Database.employee.toArray().then(employees => {
        this.employees = employees
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>