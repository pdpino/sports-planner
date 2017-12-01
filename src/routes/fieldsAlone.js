const KoaRouter = require('koa-router');

const router = new KoaRouter();

function DateArray(){
  let tomorrow= new Date();
  tomorrow.setHours(0);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  let array=[];
  for (let i=0;i<14;i++){
    tomorrow.setDate(tomorrow.getDate() + 1);
    let string=tomorrow.getFullYear().toString() + "-"+(tomorrow.getMonth()+1).toString()+"-"+(tomorrow.getDate()).toString();
    array.push(string);
  }
  return array;
}

router.get('fieldAlone', '/:id', async (ctx) => {
  // NOTE: this router is used to be able to get an url of a field with just the field id
  // this is needed in the notifications

  const field = await ctx.findById(ctx.orm.field, ctx.params.id);
  ctx.redirect(ctx.router.url('field', {
    id: field.id,
    compoundId: field.compoundId,
  }));
});

module.exports = router;
