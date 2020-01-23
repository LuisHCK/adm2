<template>
  <div class="route-card card-item">
    <section class="main">
      <div>
        <strong class="is-size-4" v-text="route.name" />
      </div>
      <div>
        <strong>Telefono:</strong>
        <span style="padding-left: 12px" v-text="route.phone || '--'" />
      </div>
      <div>
        <strong>Descripción:</strong>
        <span style="padding-left: 12px" v-text="route.description || '--'" />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'route-card',

  props: {
    route: {
      type: Object,
      default: {}
    }
  }
}
</script>

<style>
</style>