/**
 * Define models
 */
const timestamps = {
  created_at: String,
  updated_at: String
}

//  User model
export const User = {
  name: String,
  email: String,
  age: Number,
  phone_number: String,
  address: String,
  status: Array,
  photo: String,
  password_digest: String,
  ...timestamps
}

// Provider Model
export const Provider = {
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
export const Customer = {
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
export const Product = {
  name: String,
  description: String,
  brand: String,
  photo: String,
  categories: Array,
  codebar: String,
  status: String,
  user_id: Number,
  ...timestamps
}

// Product Provider Model
export const ProductProvider = {
  product_id: Number,
  provider_id: Number,
  active: Boolean,
  ...timestamps
}

// Inventory Model
export const Inventory = {
  name: String,
  description: String,
  location: String,
  user_id: Number,
  ...timestamps
}

// Product Inventory Relationship
export const InventoryProduct = {
  product_id: Number,
  invetory_id: Number,
  quantity: Number,
  price: Number,
  minimum: Number,
  alert_on_min: Boolean,
  lot: String,
  ...timestamps
}

// Tax Model
export const Tax = {
  name: String,
  amount: Number,
  user_id: Number,
  ...timestamps
}

// Coupon
export const Coupon = {
  name: String,
  amount: Number,
  valid_until: String,
  ...timestamps
}

// Sale Model
export const Sale = {
  invetory_product_id: Number,
  quantity: Number,
  user_id: Number,
  discount: Number,
  ...timestamps
}
