<template>
    <div
        class="side-nav is-primary"
        :class="sidenavVisible ? classes : 'hidden'"
    >
        <div class="items-container">
            <div class="store-logo">
                <div class="store-cover has-text-centered">
                    <img
                        :src="store.logo || require('@/assets/logo.png')"
                        alt=""
                        class="logo"
                    />
                    <h2
                        class="has-text-weight-bold is-size-4 is-margin-top-1 is-white"
                        v-text="store ? store.name : ''"
                    />
                </div>
            </div>
            <div class="nav-items">
                <div
                    v-for="(item, i) in items"
                    @click="setRoute(item)"
                    :key="`item-${i}`"
                    class="nav-item"
                    :class="{ active: item.path == currentPath }"
                >
                    <div class="item-details">
                        <b-icon :icon="item.icon" />
                        <span class="text-item" v-text="item.label" />
                    </div>
                    <b-icon
                        v-if="item.path == currentPath"
                        icon="chevron-left"
                    />
                </div>
                <div class="nav-item" @click="logOut()">
                    <div class="item-details has-text-danger">
                        <b-icon icon="exit-to-app" />
                        <span class="text-item" v-text="'Cerrar sesión'" />
                    </div>
                </div>
            </div>
        </div>
        <!-- Overlay -->
        <div
            @click="toggleSidenav()"
            class="overlay"
            :class="sidenavVisible ? classes : 'hidden'"
        ></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import EventBus from '@/event-bus'

export default {
    name: 'side-nav',

    data() {
        return {
            logo: localStorage.getItem('company_logo'),
            currentPath: 'home',
        }
    },

    computed: {
        ...mapState(['store', 'sidenavVisible']),
        classes() {
            return 'is-2-desktop ' + 'is-2-mobile' + ' is-2-tablet'
        },

        items() {
            return [
                { label: 'Inicio', path: 'home', icon: 'view-dashboard' },
                { label: 'Punto de venta', path: 'pos', icon: 'point-of-sale' },
                {
                    label: 'Productos',
                    path: 'products',
                    icon: 'package-variant',
                },
                { label: 'Clientes', path: 'customers', icon: 'account-group' },
                {
                    label: 'Inventarios',
                    path: 'inventories',
                    icon: 'format-list-checks',
                },
                {
                    label: 'Registro de Ventas',
                    path: 'sales',
                    icon: 'cart-arrow-down',
                },
                {
                    label: 'Proveedores',
                    path: 'providers',
                    icon: 'account-group',
                },
                { label: 'Ajustes', path: 'settings', icon: 'cog' },
                // { label: 'Rutas', path: 'routes', icon: 'truck-fast-outline' },
            ]
        },
    },

    methods: {
        to(path) {
            this.$router.push({ name: path }).catch(err => {})
        },

        updateLogo() {
            this.logo = localStorage.getItem('company_logo')
        },

        toggleSidenav() {
            this.$store.commit('TOGGLE_SIDENAV')
        },

        setRoute(item) {
            this.to(item.path)
            this.currentPath = item.path

            if (this.sidenavVisible) {
                this.toggleSidenav()
            }
        },
        logOut() {
            this.$buefy.dialog.confirm({
                title: 'Cerrar sesión',
                message: 'Su sesión actual será cerrada.',
                cancelText: 'Cancelar',
                confirmText: 'Confirmar',
                type: 'is-info',
                onConfirm: () => {
                    this.$store.dispatch('LOGOUT')
                    this.$router.push('/login')
                },
            })
        },
    },

    mounted() {
        // Listen event bus
        EventBus.$on('UPDATE_LOGO', () => {
            this.updateLogo()
        })
    },
}
</script>

<style lang="scss" scoped>
.side-nav {
    display: flex;
    flex-direction: column;
    z-index: 1000;
    position: fixed;
    width: 280px;
    min-height: 100vh;
    padding: 0px;

    border-right: 1px solid #f1f1f1;
    background-color: #292f46;
    transition: 0.3s;
    .store-logo {
        padding-bottom: 8px;
        img {
            width: auto;
            height: 120px;
        }
    }
    .store-cover {
        height: 220px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        img.logo {
            height: 120px;
            width: auto;
        }
    }
    .items-container {
        flex-grow: 1;
    }
    .bottom-items {
        display: flex;
        z-index: 1000;
        .btn {
            border: none;
            width: 100%;
            height: 48px;
            color: white;
            cursor: pointer;
            transition: 0.3s;
        }
        .settings {
            background-color: #00acc1;
            &:hover {
                background-color: #1e88e5;
            }
        }
        .logout {
            background-color: #f4511e;
            &:hover {
                background-color: #e64a19;
            }
        }
    }
    // break points
    @media only screen and (max-width: $sidenav-break-point) {
        position: fixed;
        z-index: 1000;
        left: 0px;

        &.hidden {
            left: -280px;
        }

        .overlay {
            display: block;
            width: 150vw;
            height: 100vh;

            &.hidden {
                display: none;
            }
        }

        .items-container {
            z-index: 1000;
        }
    }
}
.nav-items {
    height: calc(100vh - 228px);
    overflow-y: auto;

    .nav-item {
        padding: 18px 30px;
        cursor: pointer;
        transition: 0.3s;
        display: flex;
        align-items: center;
        justify-content: space-between;

        color: #eeeeee;

        // border-bottom: 1px solid #f1f1f1;
        .text-item {
            padding: 0px 15px;
        }
        .item-details {
            display: flex;
            align-items: center;
        }

        i.mdi {
            color: whitesmoke !important;
        }

        &.active {
            background-color: #424b70;
        }

        &:hover {
            background-color: rgb(38, 43, 65);
        }
    }
}
.overlay {
    opacity: 0;
    transition: 0.3s;
    position: absolute;
    background-color: #00000073;
    z-index: 99;
}
</style>
