/**
 * Define models
 */
const timestamps = {
  created_at: String,
  updated_at: String
}

//  User model
const User = {
  name: String,
  email: String,
  username: String,
  age: Number,
  phone_number: String,
  address: String,
  status: Array,
  photo: String,
  password_digest: String,
  role: String,
  ...timestamps
}

// Provider Model
const Provider = {
  name: String,
  categories: Array,
  phone_number: String,
  email: String,
  status: String,
  address: String,
  user_id: Number,
  ...timestamps
}

// Customer Model
const Customer = {
  name: String,
  email: String,
  age: Number,
  phone_number: String,
  address: String,
  status: Array,
  photo: String,
  categories: Array,
  ...timestamps
}

// Produce Model
const Product = {
  name: String,
  description: String,
  brand: String,
  photo: String,
  categories: Array,
  codebar: String,
  status: String,
  unit: String,
  user_id: Number,
  ...timestamps
}

// Product Provider Model
const ProductProvider = {
  product_id: Number,
  provider_id: Number,
  active: Boolean,
  ...timestamps
}

// Inventory Model
const Inventory = {
  name: String,
  description: String,
  location: String,
  user_id: Number,
  ...timestamps
}

// Product Inventory Relationship
const InventoryProduct = {
  product_id: Number,
  invetory_id: Number,
  quantity: Number,
  price: Number,
  minimum: Number,
  alert_on_min: Boolean,
  lot: String,
  product: Object,
  ...timestamps
}

// Tax Model
const Tax = {
  name: String,
  amount: Number,
  user_id: Number,
  ...timestamps
}

// Coupon
const Coupon = {
  name: String,
  amount: Number,
  is_percent: Boolean,
  valid_until: String,
  ...timestamps
}

// Sale Model
const Sale = {
  invetory_product_id: Number,
  quantity: Number,
  user_id: Number,
  discount: Number,
  ...timestamps
}

export default {
  User,
  Provider,
  Customer,
  Product,
  ProductProvider,
  Inventory,
  InventoryProduct,
  Tax,
  Coupon,
  Sale
}
