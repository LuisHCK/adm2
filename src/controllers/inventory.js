import database from '../db'

export const getInventoryProducts = async inventoryId => {
    const query = database.inventory_product.where({
        inventory_id: inventoryId
    })

    let data = await query.toArray()

    await Promise.all(
        data.map(async d => {
            d.product = await database.product.get(d.product_id)
        })
    )

    return data
}
