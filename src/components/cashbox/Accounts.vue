<template>
    <card title="Dinero en caja">
        <ul class="accounts-list">
            <li>
                <div class="account-name grand-total">
                    TOTAL
                </div>
                <div
                    class="account-total grand-total"
                    :class="getTotalClass(totalCash)"
                >
                    {{ totalCash | money }}
                </div>
            </li>
        </ul>
    </card>
</template>

<script>
import EventBus from '@/event-bus'
import { CASHBOX_LOG_SAVE } from '@/event-bus/events'
import { getMoneyInCashBox } from '@/controllers/cashbox'
import Card from '@/components/ui/Card.vue'
export default {
    components: { Card },

    name: 'accounts',

    data() {
        return {
            totalCash: 0
        }
    },

    methods: {
        getTotalClass(value) {
            return value <= 0 ? 'has-text-danger' : 'has-text-success'
        },

        async getTotalCash() {
            this.totalCash = await getMoneyInCashBox()
        }
    },

    async mounted() {
        this.getTotalCash()
        EventBus.$on(CASHBOX_LOG_SAVE, () => this.getTotalCash())
    }
}
</script>

<style lang="scss" scoped>
ul.accounts-list {
    list-style: none;
    margin: 0px;

    li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 48px;
        cursor: pointer;
        padding: 0px 15px;
        border-bottom: 1px solid #f5f5f5;
        transition: 0.3s;

        &:hover {
            background-color: #f5f5f5;
        }

        &:last-child {
            border-bottom: none;
        }
    }

    .account-name {
        font-weight: 600;

        &.grand-total {
            font-weight: 700;
            font-size: 16px;
        }
    }

    .account-total {
        font-weight: 700;

        &.grand-total {
            font-weight: 700;
            font-size: 16px;
        }
    }
}
</style>
