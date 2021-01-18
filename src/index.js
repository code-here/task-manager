const express = require('express');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
require('./db/mongoose');


const app = express();
app.disable('x-powered-by');
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


//starting the server
app.listen(port, () => {
    console.log(`server is up and running on port ${port}`)
});