import { h } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
)

export default {
    name: 'line-chart',

    props: {
        chartData: {
            type: Object,
            default: () => ({ labels: [], datasets: [] }),
        },
        options: {
            type: Object,
            default: () => ({
                responsive: true,
                maintainAspectRatio: false,
            }),
        },
    },

    render() {
        const chartData = this.chartData?.datasets
            ? this.chartData
            : { labels: [], datasets: [] }

        return h(Line, {
            data: chartData,
            options: this.options,
        })
    },
}
