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
                Exportar copia de seguridad
            </b-button>
            <b-button
                v-if="exporting"
                type="is-link"
                class="is-margin-top-1"
                >{{ progress }}</b-button
            >
        </div>
        <div class="is-margin-top-1">
            <b-upload @update:model-value="importDatabase($event)">
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
import database from "@/db"
import products from '@/assets/products.json'
import { toPlain } from '@/lib/serialization'
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
            products.map(product => {
                product.categories = product.categories.split('&')
                product.subcategories = product.subcategories.split('&')
                // Insert into db (Oh God halp plz)
                database.product.add(toPlain(product)).then(() => {
                    console.debug('success')
                })
            })
            this.$buefy.toast.open({
                message: 'Success',
                type: 'is-success',
                position: 'is-bottom',
            })
        },

        async executeBackup() {
            this.exporting = true

            try {
                await backupDatabase(database)
                this.$buefy.toast.open({
                    message: 'Copia de seguridad exportada',
                    type: 'is-success',
                    position: 'is-bottom',
                })
            } catch (error) {
                this.$buefy.toast.open({
                    message: 'No se pudo exportar la copia de seguridad',
                    type: 'is-danger',
                    position: 'is-bottom',
                })
            } finally {
                this.exporting = false
            }
        },

        importDatabase(file) {
            restoreDatabase(database, file)
        },
    },
}
</script>

<style lang="scss" scoped></style>
