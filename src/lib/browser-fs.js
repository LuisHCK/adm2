// Browser stub for EJS's optional Node-only include support.
export default {
    readFileSync() {
        throw new Error('fs.readFileSync is not available in the browser')
    },
}
