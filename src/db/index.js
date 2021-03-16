import Dexie from 'dexie'
import classes from './classes'

const database = new Dexie('adm_2')

database.version(0.1).stores({
    user: '++id,name,email,username,role,created_at,updated_at',
    provider: '++id,name,email,phone_number,created_at,updated_at',
    customer: '++id,name,email,phone_number,created_at,updated_at',
    settings: '++id,name,value,active',
    product:
        '++id,name,description,brand,&codebar,user_id,*providers,created_at,updated_at',
    product_provider:
        '++id,product_id,provider_id,active,user_id,created_at,updated_at',
    inventory: '++id,name,location,user_id,created_at,updated_at',
    inventory_product:
        '++id,product_id,inventory_id,price,lot,stock,created_at,updated_at',
    tax: '++id,name,amount,user_id,created_at,updated_at',
    coupon: '++id,name,amount,created_at,updated_at',
    sale:
        '++id,inventory_product_id,quantity,user_id,customer_id,sale_type,[customer_id+sale_type],refund_type,created_at,updated_at',
    route: '++id,name,description,phone,created_at,updated_at',
    customer_payment: '++id,amount,balance,customer_id,created_at,updated_at',
    cash_box:
        '++id,amount,concept,type,reference,notes,date,user_id,created_at,updated_at'
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
const CashBox = database.cash_box.defineClass(classes.CashBox)

database.open()

window.Database = database

export default database

export {
    User,
    Provider,
    Customer,
    Product,
    ProductProvider,
    Inventory,
    InventoryProduct,
    Tax,
    Coupon,
    Sale,
    CashBox
}
