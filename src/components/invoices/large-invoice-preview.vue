<template>
    <div class="LargeInvoicePreview">
        <div class="columns is-mobile is-multiline">
            <div class="column is-half">
                <h1 class="has-text-weight-bold is-size-5">Factura</h1>
                <h2 class="has-text-weight-bold mt-2" v-text="store.name" />
            </div>

            <div class="column is-half has-text-right">
                <img :src="store.logo" :alt="store.name" class="store-logo" />
            </div>

            <div class="column is-full">
                <div v-text="store.address" />
                <div v-text="store.phone" />
                <div v-text="store.legal_id" />
            </div>

            <div class="column is-half">
                <div class="has-text-weight-bold">
                    Cliente
                </div>
                <div>Demo</div>
            </div>

            <div class="column is-half">
                <div class="has-text-weight-bold">Consecutivo</div>
                <div>#00007</div>
            </div>

            <div class="column is-half">
                <div class="has-text-weight-bold">Tipo de pago</div>
                <span>Efectivo</span>
            </div>

            <div class="column is-half">
                <div class="has-text-weight-bold">Fecha</div>
                <span>22/06/2021 7:23pm</span>
            </div>

            <div class="column is-full">
                <div class="table-wrapper">
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th class="has-text-right">Cantidad</th>
                                <th>Descripción</th>
                                <th class="has-text-right">
                                    Precio Unit.
                                </th>
                                <th class="has-text-right">Descuento</th>
                                <th class="has-text-right">Subtotal</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr class="product-row">
                                <td class="has-text-right">1</td>
                                <td>Producto 15gr</td>
                                <td class="has-text-right">
                                    C$32
                                </td>
                                <td class="has-text-right">--</td>
                                <td class="has-text-right">
                                    C$21
                                </td>
                            </tr>
                        </tbody>

                        <tfoot>
                            <tr>
                                <td
                                    class="has-text-right has-text-weight-bold"
                                    colspan="4"
                                >
                                    TOTAL
                                </td>
                                <td class="has-text-right has-text-weight-bold">
                                    C$32
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'full-invoice-preview',

    computed: {
        ...mapGetters(['store'])
    }
}
</script>

<style lang="scss" scoped>
* {
    font-size: 0.8rem;
}

.table-wrapper {
    overflow-x: auto;
}

table.invoice-table {
    width: 100%;

    td,
    th {
        font-size: 0.8rem;
        padding: 8px;
    }

    thead {
        border-bottom: 1px solid rgb(12, 12, 12);
        border-top: 1px solid rgb(12, 12, 12);
    }

    tr.product-row {
        border-bottom: 1px solid rgb(12, 12, 12);
    }
}

.store-logo {
    height: 64px;
}

.LargeInvoicePreview {
    background-color: white;
    box-shadow: 1px -1px 12px 1px rgba(0, 0, 0, 0.322);
    padding: 24px;
    width: 460px;
    max-width: 100%;
    border-radius: 6px;
}
</style>
