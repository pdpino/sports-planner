const KoaRouter = require('koa-router');
const scheduleBasesRouter = require('./scheduleBases');
const schedulesRouter = require('./schedules');
const FileStorage= require('../services/file-storage');

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

router.get('fields', '/', async (ctx) => {
  const fields = await ctx.state.compound.getFields();
  await ctx.render('fields/index', {
    hasModifyPermission: ctx.state.hasOwnerModifyPermission(ctx, ctx.state.compoundOwner),
    fields,
    newFieldPath: ctx.router.url('fieldNew', { compoundId: ctx.state.compound.id }),
  });
});

router.get('fieldNew', '/new', async (ctx) => {
  ctx.requireOwnerModifyPermission(ctx.state.compoundOwner);
  const field = ctx.orm.field.build();
  const scheduleBases=[];
  await ctx.render('fields/new', {
    field,
    scheduleBases,
    compound: ctx.state.compound,
    sports: ctx.state.sports,
    submitFieldPath: ctx.router.url('fieldCreate',{ id: field.id, compoundId: ctx.state.compound.id}),
    cancelPath: ctx.router.url('compound',{ id: ctx.state.compound.id }),
  });
});

router.post('fieldCreate', '/', async (ctx) => {
  ctx.requireOwnerModifyPermission(ctx.state.compoundOwner);
  try {
    const field = await ctx.orm.field.create(ctx.request.body.fields);
    ctx.request.body.fields.photo=FileStorage.url("field"+field.id,{});
    await field.update(ctx.request.body.fields);
    FileStorage.upload(ctx.request.body.files.photo, "field"+field.id);

    ctx.redirect(ctx.router.url('field', {compoundId: ctx.state.compound.id, id: field.id }));
  } catch (validationError) {
    await ctx.render('fields/new', {
      compound: ctx.state.compound,
      scheduleBases:[],
      sports: ctx.state.sports,
      field: ctx.orm.field.build(ctx.request.body),
      errors: ctx.parseValidationError(validationError),
      submitFieldPath: ctx.router.url('fieldCreate',{compoundId:ctx.state.compound.id}),
      cancelPath: ctx.router.url('compound',{id:ctx.state.compound.id}),
    });
  }
});

router.get('fieldEdit', '/:id/edit', async (ctx) => {
  ctx.requireOwnerModifyPermission(ctx.state.compoundOwner);
  const field = await ctx.findById(ctx.orm.field, ctx.params.id);
  const scheduleBases = await field.getScheduleBases();

  await ctx.render('fields/edit', {
    field,
    scheduleBases,
    compound: ctx.state.compound,
    sports: ctx.state.sports,
    submitFieldPath: ctx.router.url('fieldUpdate', {
      id: field.id,
      compoundId: ctx.state.compound.id
    }),
    deleteFieldPath: ctx.router.url('fieldDelete', {
      id: field.id,
      compoundId: ctx.state.compound.id
    }),
    cancelPath: ctx.router.url('field', {
      id: ctx.params.id,
      compoundId: ctx.state.compound.id
    }),
  });
});

router.patch('fieldUpdate', '/:id', async (ctx) => {
  ctx.requireOwnerModifyPermission(ctx.state.compoundOwner);
  const field = await ctx.findById(ctx.orm.field, ctx.params.id);
  try {
    FileStorage.upload(ctx.request.body.files.photo, "field"+field.id);
    await field.update(ctx.request.body.fields);

    ctx.redirect(ctx.router.url('field', {
      id: field.id,
      compoundId: ctx.state.compound.id,
    }));
  } catch (validationError) {
    const scheduleBases = await field.getScheduleBases();
    await ctx.render('fields/edit', {
      field,
      scheduleBases,
      sports: ctx.state.sports,
      compound: ctx.state.compound,
      errors: ctx.parseValidationError(validationError),
      submitFieldPath: ctx.router.url('fieldUpdate', {
        id:field.id,
        compoundId: ctx.state.compound.id,
      }),
      cancelPath: ctx.router.url('field', { id:
        ctx.params.id,
        compoundId: ctx.state.compound.id,
      }),
      deleteFieldPath: ctx.router.url('fieldDelete', {
        id:field.id,
        compoundId: ctx.state.compound.id,
      }),
    });
  }
});

router.get('field', '/:id', async (ctx) => {
  const field = await ctx.findById(ctx.orm.field, ctx.params.id);
  const sport = await field.getSport();
  const schedules = DateArray();
  const schedules2 = await field.getSchedules();
  const scheduleBases= await field.getScheduleBases();

  await ctx.render('fields/show', {
    hasModifyPermission: ctx.state.hasOwnerModifyPermission(ctx, ctx.state.compoundOwner),
    field,
    schedules,
    schedules2,
    scheduleBases,
    newScheduleBasePath: ctx.router.url('scheduleBaseNew',{fieldId: field.id, compoundId: ctx.state.compound.id}),
    editScheduleBasePath: ctx.router.url('scheduleBaseEdit',{fieldId: field.id, compoundId: ctx.state.compound.id}),
    generateSchedulePath: ctx.router.url('scheduleCreate',{fieldId: field.id, compoundId: ctx.state.compound.id}),
    getSchedulePath: schedule => ctx.router.url('schedule', {compoundId:ctx.state.compound.id, fieldId: field.id, date:schedule }),
    sportName: sport.name,
    fieldsPath: ctx.router.url('fields', { compoundId: ctx.state.compound.id }),
    compoundPath: compound => ctx.router.url('compound', { id: compound.id }),
    editFieldPath: ctx.router.url('fieldEdit', {
      compoundId: ctx.state.compound.id,
      id: field.id,
    }),
    deleteFieldPath: ctx.router.url('fieldDelete', {
      compoundId: ctx.state.compound.id,
      id: field.id,
    }),
  });
});

router.delete('fieldDelete', '/:id', async (ctx) => {
  ctx.requireOwnerModifyPermission(ctx.state.compoundOwner);
  const field = await ctx.findById(ctx.orm.field, ctx.params.id);
  FileStorage.destroy("field"+field.id);
  await field.destroy();
  ctx.redirect(ctx.router.url('compound', { id: ctx.state.compound.id }));
});

router.use(
  '/:fieldId/scheduleBases',
  async (ctx, next) => {
    ctx.state.sports = await ctx.orm.sport.findAll();
    ctx.state.field = await ctx.findById(ctx.orm.field, ctx.params.fieldId);
    ctx.state.compound = await ctx.state.field.getCompound();
    return next();
  },
  scheduleBasesRouter.routes(),
);

router.use(
  '/:fieldId/schedules',
  async (ctx, next) => {
    ctx.state.sports = await ctx.orm.sport.findAll();
    ctx.state.field = await ctx.findById(ctx.orm.field, ctx.params.fieldId);
    ctx.state.compound = await ctx.state.field.getCompound();
    return next();
  },
  schedulesRouter.routes(),
);


module.exports = router;
