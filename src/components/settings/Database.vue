<template>
    <div class="column is-full-mobile is-half-desktop">
        <div class="has-text-weight-semibold">
            Base de datos
        </div>
        <div class="is-margin-top-1">
            <b-button
                icon-left="cloud-download"
                class="is-margin-top-1"
                type="is-success"
                @click="executeBackup()"
                :loading="exporting"
            >
                Exportar copida de seguridad
            </b-button>
            <b-button
                v-if="exporting"
                type="is-link"
                class="is-margin-top-1"
                v-text="progress"
            />
        </div>
        <div class="is-margin-top-1">
            <b-upload @input="importDatabase($event)">
                <a class="button is-warning">
                    <b-icon icon="upload"></b-icon>
                    <span>Importar copia de seguridad</span>
                </a>
            </b-upload>
        </div>
        <div class="is-margin-top-1">
            <b-button @click="seedProducts" type="is-info" icon-left="sprout">
                Seed products
            </b-button>
        </div>
    </div>
</template>

<script>
import { backupDatabase, restoreDatabase } from '../../db/backup'

export default {
    name: 'database',

    data() {
        return {
            exporting: false,
            progress: 0,
        }
    },

    methods: {
        /**
         * this insert all products in products.json
         */
        seedProducts() {
            const products = require('@/assets/products.json')
            products.map(product => {
                product.categories = product.categories.split('&')
                product.subcategories = product.subcategories.split('&')
                // Insert into db (Oh God halp plz)
                Database.product.add(product).then(() => {
                    console.log('success')
                })
            })
            this.$buefy.toast.open({
                message: 'Success',
                type: 'is-success',
                position: 'is-bottom'
            })
        },

        async executeBackup() {
            await backupDatabase(Database)
            this.exporting = false
        },

        importDatabase(file) {
            restoreDatabase(Database, file)
        }
    }
}
</script>

<style lang="scss" scoped></style>
