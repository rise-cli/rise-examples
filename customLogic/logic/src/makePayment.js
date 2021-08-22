const { events } = require('rise-utils')

const wait = () => new Promise((r) => setTimeout(() => r(), 2000))

module.exports.main = async (event) => {
    // INPUT
    const input = event.detail

    // LOGIC
    await wait()
    const result = Math.random() > 0.2 ? 'completed' : 'error'

    // OUTPUT
    await events.send({
        event: 'processCompleted',
        data: {
            pk: input.pk,
            sk: input.sk,
            status: result
        }
    })
}
