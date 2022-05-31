import express, { Router } from 'express';

import compras from './purchases.';
import vendas from './vendas';
const app = express();
const router = Router();

resourceRoutes(app, models(), '/api/v1/resources');

router.get('/', function (request, res) {
    res.json({
        message: 'Hooray! Welcome to our API!!!',
        timestamp: Date.now(),
    });
});
app.use('/', router);
app.use('/api/v1/compras', compras);
app.use('/api/v1/vendas', vendas);


export default app;
