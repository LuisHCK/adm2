import database from '../db'
import { getProductById } from './products'

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
 * Find inventory product by it's id
 * @param {number | string} invProdId Inventory product id
 * @returns {Promise}
 */
export const getInventoryProductById = async invProdId => {
    return await database.inventory_product.get(invProdId)
}

/**
 * Get the total products in an inventory
 * @param {number | string} inventoryId Inventory ID
 * @returns {Promise<number>}
 */
export const countInventoryProducts = async inventoryId => {
    return database.inventory_product
        .where('inventory_id')
        .equals(inventoryId)
        .count()
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

/**
 * Return all product inventories
 * @returns {Promise<Array>} List of inventory products
 */
export const getAllInventoryProducts = async () => {
    const inventoryProducts = await database.inventory_product.toArray()

    await Promise.all(
        inventoryProducts.map(async invProd => {
            invProd.product = await getProductById(invProd.product_id)
            invProd.inventory = await getInventoryById(invProd.inventory_id)
        })
    )

    return inventoryProducts
}
