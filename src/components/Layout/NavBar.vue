<template>
    <nav
        class="navbar is-transparent"
        role="navigation"
        aria-label="main navigation"
    >
        <div class="navbar-brand">
            <button class="navbar-toggle-menu" @click="toggleSidenav()">
                <b-icon icon="menu"></b-icon>
            </button>
            <div class="navbar-item">
                <span
                    class="strong is-size-2-desktop is-size-6-mobile"
                    v-text="$route.meta.title"
                />
            </div>

            <action-buttons />
        </div>
    </nav>
</template>

<script>
import { mapState } from 'vuex'
import ActionButtons from './ActionButtons.vue'
export default {
    name: 'nav-bar',

    components: {
        ActionButtons
    },

    computed: {
        ...mapState(['user', 'store', 'actionButtons'])
    },

    methods: {
        toggleSidenav() {
            this.$store.commit('TOGGLE_SIDENAV')
        }
    }
}
</script>

<style lang="scss" scoped>
.navbar {
    width: 100%;

    .action-buttons {
        display: flex;
        align-items: center;
        justify-content: flex-end;

        button {
            margin-right: 6px;
        }
        button:last-of-type {
            margin-right: 12px;
        }
    }
}
.navbar-brand {
    display: flex;
    justify-content: space-between;
    width: 100%;
}
.navbar-toggle-menu {
    display: none;
    width: 48px;
    color: rgb(73, 73, 73);
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: 0.3s;
    &:active {
        background-color: rgba(94, 94, 94, 0.37);
    }

    @media only screen and (max-width: $sidenav-break-point) {
        display: block;
    }
}
</style>
