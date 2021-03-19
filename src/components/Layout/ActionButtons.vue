<template>
    <div
        class="action-buttons pr-3"
        v-if="actionButtons && actionButtons.length"
    >
        <b-dropdown position="is-bottom-left" append-to-body aria-role="menu">
            <template #trigger>
                <a class="navbar-item" role="button">
                    <span>Acciones</span>
                    <b-icon icon="menu-down" />
                </a>
            </template>

            <b-dropdown-item custom aria-role="menuitem">
                Acciones disponibles
            </b-dropdown-item>

            <hr class="dropdown-divider" />

            <b-dropdown-item
                v-for="(actionBtn, index) in actionButtons"
                :key="'action-item-' + index"
                aria-role="menuitem"
                @click="actionBtn.action"
            >
                <div class="media">
                    <b-icon class="media-left" :icon="actionBtn.icon" />
                    <div class="media-content">
                        <h3>
                            {{ actionBtn.label }}
                        </h3>
                        <small v-if="actionBtn.description">
                            {{ actionBtn.description }}
                        </small>
                    </div>
                </div>
            </b-dropdown-item>
        </b-dropdown>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'action-buttons',

    computed: {
        ...mapState(['actionButtons'])
    },

    watch: {
        windowsWidth(newValue) {
            this.isMobile = newValue <= 1024
        }
    },

    data() {
        return {
            windowsWidth: window.innerWidth,
            isMobile: false
        }
    },

    methods: {
        onResize() {
            this.windowsWidth = window.innerWidth
        }
    },

    mounted() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize)
        })
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.onResize)
    }
}
</script>
