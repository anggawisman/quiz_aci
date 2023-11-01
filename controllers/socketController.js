const { Server } = require('socket.io');

/** @type {Server} */
let socket = undefined

/**
 * 
 * @param {Express} express_instance 
 * @param {Array<string>} cors 
 */
exports.initSocketIO = (express_instance, cors) => {
    socket = new Server(express_instance, {
        cors: {
            origin: '*',
        },
    });
    socket.on('connection', (socket) => {
        socket.broadcast.emit('WELCOME')
    })
}
/**
 * 
 * @returns {Server}
 */
exports.getSocket = () => {
    return socket
}