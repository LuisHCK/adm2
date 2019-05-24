import Dexie from "dexie"
import classes from "./classes"

const database = new Dexie("adm_2")

database.version(0.1).stores({
  user: "++id,name,email,username,role",
  provider: "++id,name,email,phone_number",
  customer: "++id,name,email,phone_number",
  product: "++id,name,description,brand,codebar,user_id",
  product_provider: "++id,product_id,provider_id,active,user_id",
  inventory: "++id,name,location,user_id",
  inventory_product: "++id,product_id,inventory_id,price,lot,quantity",
  tax: "++id,name,amount,user_id",
  coupon: "++id,name,amount",
  sale: "++id,inventory_product_id,quantity,user_id"
})

const User = database.user.defineClass(classes.User)
const Provider = database.provider.defineClass(classes.Provider)
const Customer = database.customer.defineClass(classes.Customer)
const Product = database.product.defineClass(classes.Product)
const ProductProvider = database.product_provider.defineClass(
  classes.ProductProvider
)
const Inventory = database.inventory.defineClass(classes.Inventory)
const InventoryProduct = database.inventory_product.defineClass(
  classes.InventoryProduct
)
const Tax = database.tax.defineClass(classes.Tax)
const Coupon = database.coupon.defineClass(classes.Coupon)
const Sale = database.sale.defineClass(classes.Sale)

database.open()

window.Database = database

export default database
