<template>
  <div class="panel chart-container" @click="fillData()">
    <div>Rendimiento de ventas</div>
    <line-chart :chart-data="datacollection" :options="options" style="height: 300px;"></line-chart>
  </div>
</template>

<script>
import LineChart from "./LineChart.js";

export default {
  components: {
    LineChart
  },

  props: {
    title: {
      type: String,
      default: ""
    },
    labels: {
      type: Array,
      default: () => ['label']
    },
    datasets: {
      type: Array,
      default: () => [{
        label: 'label',
        data: [0]
      }]
    }
  },

  data() {
    return {
      datacollection: {},
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    };
  },

  mounted() {
    this.fillData();
  },

  methods: {
    fillData() {
      this.datacollection = {
        labels: this.labels,
        datasets: this.datasets,
        // [
        //   {
        //     label: "Data One",
        //     backgroundColor: "#039BE5",
        //     data: [
        //       this.getRandomInt(),
        //       this.getRandomInt(),
        //       this.getRandomInt(),
        //       this.getRandomInt(),
        //       this.getRandomInt(),
        //       this.getRandomInt(),
        //       this.getRandomInt()
        //     ]
        //   }
        // ]
      };
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    }
  }
};
</script>

<style>
.chart-container {
  min-height: 300px;
}
</style>
