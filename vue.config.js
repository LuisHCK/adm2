module.exports = {
    /* ... other config ... */
    transpileDependencies: ['vuex-persist'],
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true
        }
    },
    configureWebpack: {
        devtool: 'source-map'
    }
}
