<template>
    <div id="settings-page">
        <section class="panel">
            <b-tabs v-model="activeTab">
                <b-tab-item label="Tienda">
                    <store />
                </b-tab-item>

                <b-tab-item label="Punto de venta">
                    <pos />
                </b-tab-item>

                <b-tab-item label="Base de datos">
                    <database />
                </b-tab-item>
            </b-tabs>
        </section>
    </div>
</template>

<script>
import EventBus from '@/event-bus'
import Store from '../components/settings/Store.vue'
import Pos from '@/components/settings/Pos'
import Database from '../components/settings/Database.vue'
import { loadSettings } from '@/controllers/settings'

export default {
    components: { Store, Database, Pos },

    name: 'settings',

    data() {
        return {
            removeLogo: false,
            exporting: false,
            progress: 0,
            activeTab: 0
        }
    },

    methods: {
        async setStoreState() {
            const data = await loadSettings()
            this.$store.commit('SET_STORE', data.value)
        }
    },

    mounted() {
        EventBus.$on('EXPORTING_DB', progress => {
            this.exporting = true
            this.progress = progress
        })

        EventBus.$on('EXPORT_FINISH', () => {
            this.exporting = false
            this.progress = 0
        })

        this.setStoreState()
    }
}
</script>
