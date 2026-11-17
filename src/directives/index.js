export default {
    install(app) {
        app.directive('click-outside', {
            beforeMount(element, binding) {
                element.clickOutsideEvent = function (event) {
                    if (
                        !(
                            element === event.target ||
                            element.contains(event.target)
                        )
                    ) {
                        const handler = binding.instance
                            ? binding.instance[binding.expression]
                            : undefined

                        if (typeof handler === 'function') {
                            handler(event)
                        }
                    }
                }
                document.body.addEventListener(
                    'click',
                    element.clickOutsideEvent,
                )
            },

            unmounted(element) {
                document.body.removeEventListener(
                    'click',
                    element.clickOutsideEvent,
                )
                delete element.clickOutsideEvent
            },
        })
    },
}
