import * as dotenv from "dotenv";
if (process.env.NODE_ENV !== 'production') 
{
    dotenv.config();
}

import * as express from 'express';
import apiRouter from './routes';

const app = express();

app.use(express.static('public'));
app.use(express.json()); // this middlewre must come first
app.use(apiRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server Started, Currently listening on port: ${port}`));
