import express from 'express';
import bodyParser from 'body-parser';

import routes from './routes';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('build'));
app.use(express.static('assets'));

routes(app);

const server = app.listen(PORT, () => {
    console.log("app running on port.", server.address().port);
});
