const express = require('express');
const server = express();

server.use('*', (req, res, next) => {
    console.log(req.path);
    return next();
})
server.use(express.static('./dist'));

server.listen(8080, () => console.log('Express listening on port 8080'));