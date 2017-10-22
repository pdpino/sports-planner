const KoaRouter = require('koa-router');
const scheduleBasesRouter = require('./scheduleBases');
const schedulesRouter = require('./schedules');

const router = new KoaRouter();

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

var date = new Date();
date.yyyymmdd();


function DateArray(){
  let tomorrow= new Date();
  tomorrow.setHours(0);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  let array=[];
  for (i=0;i<14;i++){
    tomorrow.setDate(tomorrow.getDate() + 1);
    let string=tomorrow.getFullYear().toString() + "-"+(tomorrow.getMonth()+1).toString()+"-"+tomorrow.getDate().toString();
    array.push(string);
  }
  return array;
}


router.get('fields', '/', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  fields= await ctx.state.compound.getFields();
  await ctx.render('fields/index', {
    hasModifyPermission: ctx.state.hasOwnerModifyPermission(ctx, compoundOwner),
    fields,
    fieldPath: field => ctx.router.url('field', {compoundId:ctx.state.compound.id, id: field.id }),
    newFieldPath: ctx.router.url('fieldNew',{compoundId:ctx.state.compound.id}),
  });
});

router.get('fieldNew', '/new', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;
  const field = ctx.orm.field.build();
  const sports= await ctx.orm.sport.findAll();
  const scheduleBases=[];
  await ctx.render('fields/new', {
    field,
    scheduleBases,
    compound: ctx.state.compound,
    sports,
    submitFieldPath: ctx.router.url('fieldCreate',{id:field.id,compoundId:ctx.state.compound.id}),
    cancelPath: ctx.router.url('compound',{id:ctx.state.compound.id}),
  });
});

router.post('fieldCreate', '/', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;
  const sports= await ctx.orm.sport.findAll();
  try {
    const field = await ctx.orm.field.create(ctx.request.body);

    ctx.redirect(ctx.router.url('field', {compoundId: ctx.state.compound.id, id: field.id }));
  } catch (validationError) {
    await ctx.render('fields/new', {
      compound: ctx.state.compound,
      sports,
      scheduleBases:[],
      field: ctx.orm.field.build(ctx.request.body),
      errors: validationError.errors,
      submitFieldPath: ctx.router.url('fieldCreate',{compoundId:ctx.state.compound.id}),
      cancelPath: ctx.router.url('compound',{id:ctx.state.compound.id}),
    });
  }
});

router.get('fieldEdit', '/:id/edit', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;
  const sports= await ctx.orm.sport.findAll();
  const field = await ctx.orm.field.findById(ctx.params.id);
  const scheduleBases= await field.getScheduleBases();

  await ctx.render('fields/edit', {
    field,
    compound:  ctx.state.compound,
    sports,
    scheduleBases,
    submitFieldPath: ctx.router.url('fieldUpdate', {id:field.id,compoundId:ctx.state.compound.id}),
    deleteFieldPath: ctx.router.url('fieldDelete', {id:field.id,compoundId:ctx.state.compound.id}),
    cancelPath: ctx.router.url('field', { id: ctx.params.id,compoundId:ctx.state.compound.id }),
  });
});

router.patch('fieldUpdate', '/:id', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;
  const sports= await ctx.orm.sport.findAll();
  const field = await ctx.orm.field.findById(ctx.params.id);
  try {
    await field.update(ctx.request.body);
    ctx.redirect(ctx.router.url('field', { id: field.id,compoundId:ctx.state.compound.id }));
  } catch (validationError) {
    const scheduleBases= await field.getScheduleBases();
    await ctx.render('fields/edit', {
      field,
      scheduleBases,
      sports,
      compound: ctx.state.compound,
      errors: validationError.errors,
      submitFieldPath: ctx.router.url('fieldUpdate', {id:field.id,compoundId:ctx.state.compound.id}),
      cancelPath: ctx.router.url('field', { id: ctx.params.id,compoundId:ctx.state.compound.id }),
      deleteFieldPath: ctx.router.url('fieldDelete', {id:field.id,compoundId:ctx.state.compound.id}),
    });
  }
});

router.get('field', '/:id', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  //const compoundOwner=owner
  const field = await ctx.orm.field.findById(ctx.params.id);
  const compound= await field.getCompound();
  const scheduleBases= await field.getScheduleBases();
  const schedules= DateArray();
  const schedules2=await field.getSchedules();

  await ctx.render('fields/show', {
    hasModifyPermission: ctx.state.hasOwnerModifyPermission(ctx, compoundOwner),
    field,
    schedules,
    schedules2,
    scheduleBases,
    fieldsPath: ctx.router.url('fields', {compoundId: ctx.state.compound.id}),
    compoundPath: compound => ctx.router.url('compound', { id: compound.id }),
    editFieldPath: ctx.router.url('fieldEdit', {compoundId: ctx.state.compound.id, id: field.id}),
    newScheduleBasePath: ctx.router.url('scheduleBaseNew',{fieldId: field.id, compoundId: ctx.state.compound.id}),
    editScheduleBasePath: ctx.router.url('scheduleBaseEdit',{fieldId: field.id, compoundId: ctx.state.compound.id}),
    generateSchedulePath: ctx.router.url('scheduleCreate',{fieldId: field.id, compoundId: ctx.state.compound.id}),
    getSchedulePath: schedule => ctx.router.url('schedule', {compoundId:ctx.state.compound.id, fieldId: field.id, date:schedule }),





  });
});

router.delete('fieldDelete', '/:id', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;
  const field = await ctx.orm.field.findById(ctx.params.id);
  await field.destroy();
  ctx.redirect(ctx.router.url('compound',{id: ctx.state.compound.id}));
});

router.use(
  '/:fieldId/scheduleBases',
  async (ctx, next) => {

    const field = await ctx.orm.field.findById(ctx.params.fieldId);
    const compound= await field.getCompound();
    ctx.state.sports = await ctx.orm.sport.findAll();
    ctx.state.compound = compound;
    ctx.state.field=field;
    await next();
  },
  scheduleBasesRouter.routes(),
);

router.use(
  '/:fieldId/schedules',
  async (ctx, next) => {

    const field = await ctx.orm.field.findById(ctx.params.fieldId);
    const compound= await field.getCompound();
    ctx.state.sports = await ctx.orm.sport.findAll();
    ctx.state.compound = compound;
    ctx.state.field=field;
    await next();
  },
  schedulesRouter.routes(),
);


module.exports = router;
