<template>
    <component :is="layout"></component>
</template>

<script>
import AuthLayout from './layouts/AuthLayout.vue'
import MainLayout from './layouts/MainLayout.vue'

export default {
    components: {
        AuthLayout,
        MainLayout
    },

    computed: {
        layout() {
            return this.$route.meta.layout
        }
    }
}
</script>
<style lang="scss">
@import url('./assets/_fonts.scss');

html {
    font-size: 11pt !important;
}

body {
    background-color: #fafafa;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;

    * {
        font-family: 'Poppins', sans-serif;
    }
}

#nav {
    padding: 30px;
    a {
        font-weight: bold;
        color: #2c3e50;
        &.router-link-exact-active {
            color: #42b983;
        }
    }
}
.is-white {
    color: white;
}

.panel {
    background-color: white;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid rgb(241, 241, 241);
}

.page {
    @media only screen and (max-width: 1023px) {
        padding: 8px;
    }
}

.modal {
    z-index: 1000 !important;
}
</style>
