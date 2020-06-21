<template>
  <div class="panel chart-container" @click="fillData()">
    <div class="columns">
      <div class="column">
        Rendimiento de ventas
      </div>
      <div class="column">
        <b-field>
          <b-datepicker
            placeholder="Filtrar por fecha"
            position="is-bottom-left"
            v-model="dateRange"
            icon="calendar-today"
            @input="emitChange()"
            :month-names="months"
            :day-names="daysAbr"
            range
            rounded
          >
          </b-datepicker>
        </b-field>
      </div>
    </div>
    <line-chart
      :chart-data="datacollection"
      :options="options"
      style="height: 300px;"
    ></line-chart>
  </div>
</template>

<script>
import LineChart from './LineChart.js'
import { months, daysAbr } from '@/lib/locale'

export default {
  components: {
    LineChart
  },

  computed: {
    months: () => months,
    daysAbr: () => daysAbr
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    labels: {
      type: Array,
      default: () => ['label']
    },
    datasets: {
      type: Array,
      default: () => [
        {
          label: 'label',
          data: [0]
        }
      ]
    }
  },

  data() {
    return {
      datacollection: {},
      options: {
        responsive: true,
        maintainAspectRatio: false
      },

      dateRange: []
    }
  },

  mounted() {
    this.fillData()
  },

  methods: {
    fillData() {
      this.datacollection = {
        labels: this.labels,
        datasets: this.datasets
      }
    },

    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5
    },

    emitChange() {
      this.$emit('onDateChange', this.dateRange)
    }
  }
}
</script>

<style>
.chart-container {
  min-height: 300px;
}
</style>
