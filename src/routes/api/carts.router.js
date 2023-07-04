import { Router } from 'express';
import { getAll_Carts, getID_Carts, post_Carts, postProds_Carts, put_Carts, putProds_Carts, deleteProdsOne_Carts, delete_Carts, deleteProds_Carts } from '../../controllers/carts.controller.js';

const router = Router();

//======== { Métodos GET } ========
router.get('/getAll', getAll_Carts);
router.get('/:cid', getID_Carts);
//======== { Métodos GET } ========

//======== { Métodos POST } ========
router.post('/', post_Carts);
router.post('/:cid/product/:pid', postProds_Carts);
//======== { Métodos POST } ========

//======== { Métodos PUT } ========
router.put('/:cid', put_Carts);
router.put('/:cid/product/:pid', putProds_Carts);
//======== { Métodos PUT } ========

//======== { Métodos DELETE } ========
router.delete('/:cid/product/:pid', deleteProdsOne_Carts);
router.delete('/deleteCart/:cid', delete_Carts);
router.delete('/:cid', deleteProds_Carts);
//======== { Métodos DELETE } ========



export default router;
