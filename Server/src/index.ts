import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as fileUpload from 'express-fileupload';

import { ErrorHandling } from './errorHandling';
import { Routing } from './routing';


// App init
const app = express();
const errorHandling = new ErrorHandling();


app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const routing = new Routing(app);
routing.init();

errorHandling.handle(app);
