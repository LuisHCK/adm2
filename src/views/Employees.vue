<template>
  <div>
    <ul>
      <li v-for="employee in employees" :key="employee.id">
        {{ employee }}
      </li>
    </ul>
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