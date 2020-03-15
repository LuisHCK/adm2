const userAgent = navigator.userAgent.toLowerCase();
const onElectron = userAgent.indexOf(' electron/') > -1

export { onElectron }