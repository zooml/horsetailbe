import express, {Request, Response} from 'express';

const router = express.Router();

/* GET users listing. */
router.get('/', (req: Request, res: Response) => {
  res.send([{id: '1234', name: 'Joe'}]);
});

export default router;
