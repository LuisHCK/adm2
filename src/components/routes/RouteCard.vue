<template>
  <div class="route-card">
      <h1>{{ route.name }}</h1>
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