<template>
    <div class="main-layout">
        <side-nav />
        <div
            class="view-container"
            :class="sidenavVisible ? 'with-sidenav-open' : ''"
        >
            <nav-bar />
            <router-view />
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import NavBar from '../components/Layout/NavBar.vue'
import SideNav from '../components/Layout/SideNav.vue'

export default {
    name: 'main-layout',

    computed: {
        ...mapState(['sidenavVisible']),
    },

    components: {
        NavBar,
        SideNav,
    },
}
</script>

<style lang="scss" scoped>
.main-layout {
    display: flex;
}
.view-container {
    width: 100%;
    min-height: 100vh;
    transition: 0.3s;
    padding-left: 280px;

    @media only screen and (max-width: $sidenav-break-point) {
        display: block;
        padding-left: 0px;
    }
}

.view-container.with-sidenav-open {
    filter: blur(3px);
}
</style>
