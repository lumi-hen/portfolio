const express=require('express');
const router=express.Router();

router.get('/portfolio', (req, res) => {
  res.render('admin/admin_panel');
});

module.exports = router;