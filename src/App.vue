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
    },

    methods: {
        async getStoreData() {
            const storeData = await Database.settings.get({ name: 'store' })

            if (storeData) {
                this.$store.commit('SET_STORE', storeData.value)
            }
        }
    },

    mounted() {
        this.getStoreData()
    }
}
</script>
<style lang="scss">
@import '@/buefy.scss';
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
    @media only screen and (max-width: $sidenav-break-point) {
        padding: 8px;
    }
}

.modal {
    z-index: 1000 !important;
}
</style>
