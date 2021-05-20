import database from '../db'

/**
 * Return an inventory by it's id
 * @param {number | string} inventoryId
 * @returns {Promise} Inventory promise
 */
export const getInventoryById = async inventoryId => {
    const inventory = await database.inventory.get(inventoryId)
    return inventory
}

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

/**
 *
 * @param {*} data
 * @returns {Promise}
 */
export const updateInventoryProduct = data => {
    return database.inventory_product.update(data.id, data)
}

export const createInventoryProduct = data => {
    return database.inventory_product.add(data)
}

/**
 * remove product relation with inventory
 * @param {number | string} productId
 * @returns {Promise} Deletion promise
 */
export const deleteProductFromInventory = productId => {
    return database.inventory_product.delete(productId)
}
