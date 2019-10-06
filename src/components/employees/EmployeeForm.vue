<template>
  <form @submit.prevent="submit">
    <!-- Name -->
    <b-field label="Nombre*">
      <b-input v-model="form.name" placeholder="Nombre del Empleado"></b-input>
    </b-field>
    <!-- phone -->
    <b-field label="Teléfono">
      <b-input v-model="form.phone" placeholder="Número de teléfono"></b-input>
    </b-field>
    <!-- email -->
    <b-field label="Email">
      <b-input v-model="form.email" placeholder="Correo electrónico"></b-input>
    </b-field>
    <!-- Rol -->
    <b-field label="Cargo">
      <b-input v-model="form.role" placeholder="Cargo"></b-input>
    </b-field>

    <b-field>
      <button type="submit" class="button is-primary is-fullwidth">Guardar</button>
    </b-field>
  </form>
</template>

<script>
export default {
  name: 'employee-form',

  data() {
    return {
      form: {}
    }
  }
}
</script>

<style lang="scss" scoped>
</style>