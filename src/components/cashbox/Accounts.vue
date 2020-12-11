<template>
    <card title="Detalle de cuentas">
        <ul class="accounts-list">
            <li
                v-for="(account, index) in accounts"
                :key="'account-detail-' + index"
            >
                <div class="account-name">
                    {{ account.name }}
                </div>

                <div
                    class="account-total"
                    :class="getTotalClass(account.value)"
                >
                    {{ account.value | money }}
                </div>
            </li>
            <li>
                <div class="account-name grand-total">
                    TOTAL
                </div>
                <div
                    class="account-total grand-total"
                    :class="getTotalClass(total)"
                >
                    {{ total | money }}
                </div>
            </li>
        </ul>
    </card>
</template>

<script>
import Card from '../ui/Card.vue'
export default {
    components: { Card },

    name: 'accounts',

    props: {
        accounts: {
            type: Array,
            default: () => []
        },

        total: {
            type: Number,
            default: 0
        }
    },

    methods: {
        getTotalClass(value) {
            return value <= 0 ? 'has-text-danger' : 'has-text-success'
        }
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
