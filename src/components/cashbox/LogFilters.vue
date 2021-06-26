<template>
    <div class="is-flex">
        <b-dropdown class="mr-4" v-model="selectedFilter">
            <template #trigger>
                <b-button
                    label="Filtrar"
                    type="is-primary"
                    icon-left="filter"
                    icon-right="chevron-down"
                    rounded
                />
            </template>

            <b-dropdown-item value="search" aria-role="listitem">
                <div class="media">
                    <b-icon class="media-left" icon="card-text-outline" />
                    <div class="media-content">
                        <h3>Buscar</h3>
                        <small>
                            Busca por Concepto o Referencia
                        </small>
                    </div>
                </div>
            </b-dropdown-item>

            <b-dropdown-item value="date" aria-role="listitem">
                <div class="media">
                    <b-icon class="media-left" icon="calendar" />
                    <div class="media-content">
                        <h3>Fecha</h3>
                        <small>
                            Filtra en un rango de fechas
                        </small>
                    </div>
                </div>
            </b-dropdown-item>
        </b-dropdown>

        <b-field
            class="mb-0 is-flex is-align-items-center"
            v-if="selectedFilter === 'date'"
        >
            <b-datepicker
                icon="calendar-today"
                placeholder="Filtrar por fecha"
                v-model="dateRange"
                locale="es-NI"
                :month-names="months"
                :day-names="daysAbr"
                @input="submitDateChange"
                :mobile-native="false"
                range
            />
            <b-button
                class="clean-date-button"
                @click="emitCleanFilter"
                icon-left="close"
                type="is-text"
                v-show="dateRange && dateRange.length"
                rounded
            />
        </b-field>

        <b-field class="mb-0" v-if="selectedFilter === 'search'">
            <b-input
                placeholder="Buscar..."
                :value="searchValue"
                @input="handleSearch"
                icon="magnify"
                icon-right-clickable
                :icon-right="searchValue ? 'close' : null"
                @icon-right-click="emitCleanFilter"
                rounded
            />
        </b-field>
    </div>
</template>

<script>
import { months, daysAbr } from '@/lib/locale'

/**
 * LogFilters component
 * @emits onDateChange Emited when a date range is selected
 * @emits onSeachChange Emited when a search value is input
 */
export default {
    name: 'log-filters',

    data() {
        return {
            selectedFilter: 'search',
            searchValue: '',
            dateRange: [],
            searchTimeout: null
        }
    },

    computed: {
        months: () => months,
        daysAbr: () => daysAbr
    },

    methods: {
        submitDateChange() {
            this.$emit('onDateChange', this.dateRange)
        },

        submitSearchChange() {
            this.$emit('onSearchChange', this.searchValue)
        },

        emitCleanFilter() {
            this.dateRange = []
            this.searchValue = ''
            this.$emit('onCleanFilter')
        },

        handleSearch(val) {
            clearTimeout(this.searchTimeout)

            this.searchTimeout = setTimeout(() => {
                this.searchValue = val
                this.submitSearchChange()
            }, 500)
        }
    }
}
</script>

<style lang="scss" scoped>
.clean-date-button {
    position: absolute;
    right: 20px;
}
</style>
