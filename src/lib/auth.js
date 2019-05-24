import bcrypt from "bcryptjs"
import db from "../db"
import store from "../store"

const salt = bcrypt.genSaltSync(10)

/**
 * Hash plain text
 * @param {String} plainText Plain text to hash
 * @returns {Hash} Hashed plain text
 */
export function hashSync(plainText) {
  return bcrypt.hashSync(plainText, salt)
}

/**
 * Compare password an hash Sync
 * @param {String} plainText Plain text to compare
 * @param {String} hash Hashed text to compare
 * @returns {Boolean} True if match
 */
function compareSync(plainText, hash) {
  return bcrypt.compareSync(plainText, hash)
}

/**
 * Search and login an user by Email or username
 * @param {String} auth username or email
 * @param {String} password
 * @returns {Boolean}
 */
export async function logIn(auth, password) {
  const user = await db.user
    .where("username")
    .equalsIgnoreCase(auth)
    .or("email")
    .equalsIgnoreCase(auth)
    .first()

  let success

  if (user && compareSync(password, user.password_digest)) {
    store.commit("setUser", user)
    success = true
  } else {
    success = false
  }

  return success
}

/**
 * Check if theres any user in db
 */
export function getUserCount() {
  return db.user.count()
}
