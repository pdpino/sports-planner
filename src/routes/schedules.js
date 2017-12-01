const KoaRouter = require('koa-router');
const router = new KoaRouter();


function floatToStringHour(float){

  let hoursTwoDigits=false;
  let minutesTwoDigits=false;
  let hours=Math.floor(float);
  let minutes= Math.round((float%1)*60);
  if (minutes>=60){
    minutes-=60;
    hours+=1;
  }
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

function modules(field){
  let close=parseFloat(field.closingHour.substr(0,2))+parseFloat(field.closingHour.substr(3,2))/60;
  let open=parseFloat(field.openingHour.substr(0,2))+parseFloat(field.openingHour.substr(3,2))/60;
  if(open>=close){
    close+=24;
  }
  return Math.floor((close-open)/(field.modules/60));
}

function arrayOfHours (field){
  let close=parseFloat(field.closingHour.substr(0,2))+parseFloat(field.closingHour.substr(3,2))/60;
  let open=parseFloat(field.openingHour.substr(0,2))+parseFloat(field.openingHour.substr(3,2))/60;
  if(open>=close){
    close+=24;
  }
  let totalmodules=modules(field);
  let final=[];
  let text="";
  let endModule=open + (field.modules/60);
  for (i=0;i<totalmodules;i++){
    text=floatToStringHour(open)+" - "+ floatToStringHour(endModule);
    open=endModule;
    endModule+=field.modules/60;
    final.push(text);
  }
  return final;
}

router.get('schedules', '/', async (ctx) => {

  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  const schedules= await ctx.state.field.getSchedules();
  await ctx.render('schedules/index', {
    hasModifyPermission: ctx.hasModifyPermission(compoundOwner),
    schedules,
    newScheduleBasePath: ctx.router.url('scheduleBaseNew',{fieldId:ctx.state.field.id, compoundId:ctx.state.compound.id}),
  });
});

router.post('scheduleCreate', '/', async (ctx) => {


  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  ctx.requireOwnerModifyPermission(compoundOwner);
  let arrayOfHour = arrayOfHours(ctx.state.field);
  let tomorrow= new Date();
  tomorrow.setHours(0);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  tomorrow.setMilliseconds(0);
  console.log("HolAAAAAAAAAAAAAAAAAAA");
  for (i=0;i<14;i++){
    tomorrow.setDate(tomorrow.getDate() + 1);
    let exist= await ctx.state.field.getSchedules({
      where:{
        date:tomorrow,
        fieldId: ctx.state.field.id,
      }
    });
    if (exist.length!=0){
      continue;
    }
    let scheduleBase= await ctx.state.field.getScheduleBases({
      where:{
        weekday: tomorrow.getDay(),
        fieldId: ctx.state.field.id,
      }
    });

    let modulesofday= scheduleBase.length;
    for(j=0;j<modulesofday;j++){

        let state="Available";

        await ctx.orm.schedule.create({price:scheduleBase[j].price,hours:scheduleBase[j].hours,date:tomorrow,fieldId:ctx.state.field.id,status:state});
      }
    }
  ctx.redirect(ctx.router.url('field',{id: ctx.state.field.id, compoundId: ctx.state.compound.id}));
});

router.get('scheduleEdit', '/:date/edit', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  ctx.requireOwnerModifyPermission(compoundOwner);
  const realDate= new Date(ctx.params.date);

  const field= ctx.state.field;
  realDate.setHours(0);
  realDate.setMinutes(0);
  realDate.setSeconds(0);
  realDate.setMilliseconds(0);
  realDate.setDate(realDate.getDate()+1);
    console.log("FIONAAAAAAAAAAAAAA");
  const schedules = await field.getSchedules({where:{date:realDate}});
  schedules.sort(function(a, b) {
    return a.id - b.id;
  });
  const arrayOfHour= arrayOfHours(ctx.state.field);
  const daysOfWeek=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  await ctx.render('schedules/edit', {
    schedules,
    arrayOfHour,
    daysOfWeek,
    field: ctx.state.field,
    submitSchedulePath: ctx.router.url('scheduleUpdate', {
      date:ctx.params.date,
      fieldId:ctx.state.field.id,
      compoundId:ctx.state.compound.id,
    }),
    cancelPath: ctx.router.url('field', {
      id:ctx.state.field.id,
      compoundId:ctx.state.compound.id,
    }),
  });
});

router.patch('scheduleUpdate', '/:date', async (ctx) => {

  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  ctx.requireOwnerModifyPermission(compoundOwner);
  const realDate= new Date(ctx.params.date);
  realDate.setHours(0);
  realDate.setMinutes(0);
  realDate.setSeconds(0);
  realDate.setMilliseconds(0);
  realDate.setDate(realDate.getDate()+1);

  const schedules = await ctx.state.field.getSchedules({ where: { date: realDate }});

  schedules.sort(function(a, b) {
    return a.id - b.id;
  });
  const arrayOfHour= arrayOfHours(ctx.state.field);
  const daysOfWeek=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  try {
    for (let i=0; i < schedules.length; i++){

      const params = ctx.request.body.schedules[i];
      await schedules[i].update(params);

      // Send notification
      if (params.status === 'Accepted'){ // HACK: status hardcoded
        console.log("SENDING NOTIFICATIONS");
        const match = await ctx.orm.match.findById(schedules[i].matchId);
        const matchAdmins = await match.getAdmins();
        await ctx.acceptFieldReservation(compoundOwner, matchAdmins, match, ctx.state.field);
      }
    }
    ctx.redirect(ctx.router.url('field', {
      id: ctx.state.field.id,
      compoundId: ctx.state.compound.id,
    }));
  } catch (validationError) {
    await ctx.render('schedules/show', {
      schedules,
      arrayOfHour,
      hasModifyPermission: ctx.hasModifyPermission(compoundOwner),
      editSchedulePath: ctx.router.url('scheduleEdit', {
        date: ctx.params.date,
        fieldId: ctx.state.field.id,
        compoundId: ctx.state.compound.id,
      }),
      daysOfWeek,
      field: ctx.state.field,
      errors: validationError.errors,
      submitSchedulePath: ctx.router.url('scheduleBaseUpdate', {
        date: ctx.params.date,
        fieldId: ctx.state.field.id,
        compoundId: ctx.state.compound.id,
      }),
      cancelPath: ctx.router.url('field', {
        id: ctx.state.field.id,
        compoundId: ctx.state.compound.id,
      })
    });
  }
});

router.get('schedule', '/:date', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  const realDate= new Date(ctx.params.date);
  const newDate= realDate;
  console.log(realDate)
  const field= ctx.state.field;

  newDate.setHours(0);
  newDate.setMinutes(0);
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  newDate.setDate(realDate.getDate()+1);
  const schedules = await ctx.state.field.getSchedules({
    where:{
      date:realDate,
      fieldId:ctx.state.field.id
    }
  });
  schedules.sort(function(a, b) {
    return a.id - b.id;
  });
  await ctx.render('schedules/show', {
    hasModifyPermission: ctx.hasModifyPermission(compoundOwner),
    schedules,
    editSchedulePath: ctx.router.url('scheduleEdit', {
      date:ctx.params.date,
      fieldId:ctx.state.field.id,
      compoundId:ctx.state.compound.id,
    }),
    field,
  });
});

router.delete('scheduleDelete', '/', async (ctx) => {
  ctx.orm.schedule.destroy({
    where: {
      date: {
        [Op.lt]: new Date(),
      }
    }
  });
  ctx.redirect(ctx.router.url('field',{id: ctx.state.field.id, compoundId: ctx.state.compound.id}));
});

module.exports = router;
