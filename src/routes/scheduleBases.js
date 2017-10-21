const KoaRouter = require('koa-router');
const router = new KoaRouter();

function floatToStringHour(float){

  let hoursTwoDigits=false;
  let minutesTwoDigits=false;
  let hours=Math.floor(float);
  let minutes= Math.round((float%1)*60);
  let final="";
  if (hours>=24){
    hours-=24;
  }
  if (hours<10){
    final="0"
  }
  final+=hours.toString() +":";

  if (minutes<10){
    final+="0"
  }
final+=minutes.toString();
return final;

}

function arrayOfHours (field){
  let close=parseFloat(field.closingHour.substr(0,2))+parseFloat(field.closingHour.substr(3,2))/60;
  let open=parseFloat(field.openingHour.substr(0,2))+parseFloat(field.openingHour.substr(3,2))/60;
  if(open>=close){
    close+=24;
  }
  let moduleMinutes=(close-open)/field.modules;
  let final=[];
  let text="";
  let endModule=open + moduleMinutes;
  for (i=0;i<field.modules;i++){
    text=floatToStringHour(open)+" - "+ floatToStringHour(endModule);
    open=endModule;
    endModule+=moduleMinutes;
    final.push(text);
  }
  return final;
}


router.get('scheduleBases', '/', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  const scheduleBases= await ctx.state.field.getScheduleBases();
  await ctx.render('scheduleBases/index', {
    hasModifyPermission: ctx.state.hasOwnerModifyPermission(ctx, compoundOwner),
    scheduleBases,
    newScheduleBasePath: ctx.router.url('scheduleBaseNew',{fieldId:ctx.state.field.id, compoundId:ctx.state.compound.id}),
  });
});

router.get('scheduleBaseNew', '/new', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;

  const arrayOfHour= arrayOfHours(ctx.state.field);
    console.log(arrayOfHour[0]);
  const daysOfWeek=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  const scheduleBases = []
  for (i=0;i<7*ctx.state.field.modules;i++){
    const scheduleBase = ctx.orm.scheduleBase.build();
    scheduleBases.push(scheduleBase);
  }
  const scheduleBase = ctx.orm.scheduleBase.build();

  await ctx.render('scheduleBases/new', {
    scheduleBases,
    arrayOfHour,
    scheduleBase,
    daysOfWeek,
    field: ctx.state.field,
    submitScheduleBasePath: ctx.router.url('scheduleBaseCreate',{compoundId:ctx.state.compound.id,fieldId:ctx.state.field.id}),
    cancelPath: ctx.router.url('field',{id:ctx.state.field.id, compoundId:ctx.state.compound.id}),
  });
});

router.post('scheduleBaseCreate', '/', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;
  console.log("HOLAAA");
  try {
    for (i=0; i<7*ctx.state.field.modules;i++){
      console.log(ctx.request.body.scheduleBases[i]);
      const scheduleBase = await ctx.orm.scheduleBase.create(ctx.request.body.scheduleBases[i]);
    }
    ctx.redirect(ctx.router.url('field',{id: ctx.state.field.id, compoundId: ctx.state.compound.id}));
  } catch (validationError) {
    const arrayOfHour= arrayOfHours(ctx.state.field);
    const daysOfWeek=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
    const scheduleBases = []
    for (i=0;i<7*ctx.state.field.modules;i++){
      const scheduleBase = ctx.orm.scheduleBase.build(ctx.request.body.scheduleBases[i]);
      scheduleBases.push(scheduleBase);
    }
    await ctx.render('scheduleBases/new', {
      field: ctx.state.field,
      arrayOfHour,
      daysOfWeek,
      scheduleBase: ctx.orm.scheduleBase.build(),
      scheduleBases,
      errors: validationError.errors,
      submitScheduleBasePath: ctx.router.url('scheduleBaseCreate',{compoundId:ctx.state.compound.id,fieldId:ctx.state.field.id}),
      cancelPath: ctx.router.url('field',{id:ctx.state.field.id, compoundId:ctx.state.compound.id}),
    });
  }
});

router.get('scheduleBaseEdit', '/edit', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;
  const scheduleBases = await ctx.state.field.getScheduleBases();
  scheduleBases.sort(function(a, b) {
    return a.id - b.id;
});
  const scheduleBase= scheduleBases[0];
  const arrayOfHour= arrayOfHours(ctx.state.field);
  const daysOfWeek=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  await ctx.render('scheduleBases/edit', {
    scheduleBases,
    arrayOfHour,
    daysOfWeek,
    scheduleBase,
    field:  ctx.state.field,
    submitScheduleBasePath: ctx.router.url('scheduleBaseUpdate', {fieldId:ctx.state.field.id, compoundId:ctx.state.compound.id}),
    deleteScheduleBasePath: ctx.router.url('scheduleBaseDelete', {fieldId:ctx.state.field.id, compoundId:ctx.state.compound.id}),
    cancelPath: ctx.router.url('field', {id:ctx.state.field.id, compoundId:ctx.state.compound.id}),
  });
});

router.patch('scheduleBaseUpdate', '/', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;
  const scheduleBases = await ctx.state.field.getScheduleBases();
  scheduleBases.sort(function(a, b) {
    return a.id - b.id;
});
  const scheduleBase= scheduleBases[0];
  const arrayOfHour= arrayOfHours(ctx.state.field);
  const daysOfWeek=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  try {
    for (i=0; i<7*ctx.state.field.modules;i++){
      console.log(ctx.request.body.scheduleBases[i]);
      await scheduleBases[i].update(ctx.request.body.scheduleBases[i]);
    }
    ctx.redirect(ctx.router.url('field',{id: ctx.state.field.id, compoundId: ctx.state.compound.id}));
  } catch (validationError) {
    await ctx.render('scheduleBases/edit', {
      scheduleBase,
      scheduleBases,
      arrayOfHour,
      daysOfWeek,
      field: ctx.state.field,
      errors: validationError.errors,
      submitScheduleBasePath: ctx.router.url('scheduleBaseUpdate', {fieldId:ctx.state.field.id, compoundId:ctx.state.compound.id}),
      cancelPath: ctx.router.url('field', {fieldId:ctx.state.field.id, compoundId:ctx.state.compound.id}),
      deleteScheduleBasePath: ctx.router.url('scheduleBaseDelete', {fieldId:ctx.state.field.id, compoundId:ctx.state.compound.id}),
    });
  }
});

router.get('scheduleBase', '/', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  //const compoundOwner=owner
  const scheduleBase = await ctx.orm.scheduleBase.findById(ctx.params.id);
  const field= await scheduleBase.getField();
  await ctx.render('scheduleBases/show', {
    hasModifyPermission: ctx.state.hasOwnerModifyPermission(ctx, compoundOwner),
    scheduleBase,
    scheduleBasesPath: ctx.router.url('scheduleBases', {fieldId: ctx.state.field.id}),
    fieldPath: field => ctx.router.url('field', { id: field.id, compoundId:ctx.state.compound.id }),
    editFieldPath: ctx.router.url('scheduleBaseEdit', {fieldId: ctx.state.field.id, id: scheduleBase.id}),

  });
});

router.delete('scheduleBaseDelete', '/', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;
  const scheduleBases = await ctx.state.field.getScheduleBases();
  for (i=0; i<7*ctx.state.field.modules;i++){
    console.log(scheduleBases[i]);
    await scheduleBases[i].destroy();
  }
  ctx.redirect(ctx.router.url('field',{id: ctx.state.field.id, compoundId: ctx.state.compound.id}));
});


module.exports = router;
