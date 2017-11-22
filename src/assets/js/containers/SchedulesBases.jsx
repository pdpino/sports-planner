import React, { Component } from 'react';
import PropTypes from 'prop-types';
import scheduleBasesService from '../services/scheduleBases';



export default class ScheduleBaseForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      days:["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],
      scheduleBases: [],


      generics:[{done:false,hours:'00:00-00:00',day:1,price:0,duration:5},{done:false,hours:'00:00-00:00',day:2,price:0,duration:5},{done:false,hours:'00:00-00:00',day:3,price:0,duration:5},{done:false,hours:'00:00-00:00',day:4,price:0,duration:5},{done:false,hours:'00:00-00:00',day:5,price:0,duration:5},{done:false,hours:'00:00-00:00',day:6,price:0,duration:5},{done:false,hours:'00:00-00:00',day:0,price:0,duration:5}],
    };
    //this.arrayOfHours=this.arrayOfHours.bind(this);
    //this.handleScheduleBaseHoursChange=this.handleScheduleBaseHoursChange.bind(this);
    //this.handleScheduleBaseHourDDChange=this.handleScheduleBaseHourDDChange.bind(this);
    //this.handleGenericHourDDChange=this.handleGenericHourDDChange.bind(this);
    //this.handleGenericPriceChange=this.handleGenericPriceChange.bind(this);
    //this.handleGenericDurationChange=this.handleGenericDurationChange.bind(this);
    //this.handleScheduleBasePriceChange=this.handleScheduleBasePriceChange.bind(this);
    //this.handleScheduleBaseDayChange=this.handleScheduleBaseDayChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
    //this.handleAddScheduleBase=this.handleAddScheduleBase.bind(this);
    //this.handleRemoveScheduleBase=this.handleRemoveScheduleBase.bind(this);
    //this.generateScheduleBase=this.generateScheduleBase.bind(this);
  }



 floatToStringHour(float){

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


componentDidMount(){


this.hello();



}

async hello(){
  const lel = await scheduleBasesService.get(this.props.compoundId, this.props.fieldId);
  alert(Object.keys(lel.scheduleBases[0]));
  alert(lel.scheduleBases[0].weekday);
  this.setState({scheduleBases:lel.scheduleBases});
}

 modules(generic){

  let close=parseFloat(generic.hours.substr(8,2))+parseFloat(generic.hours.substr(11,2))/60;
  let open=parseFloat(generic.hours.substr(0,2))+parseFloat(generic.hours.substr(3,2))/60;
  if(open>=close){
    close+=24;
  }
  return Math.floor((close-open)/(generic.duration/60));
}

 arrayOfHours (generic){

  let close=parseFloat(generic.hours.substr(8,2))+parseFloat(generic.hours.substr(11,2))/60;
  let open=parseFloat(generic.hours.substr(0,2))+parseFloat(generic.hours.substr(3,2))/60;
  if(open>=close){
    close+=24;
  }

  let totalmodules=this.modules(generic);

  let final=[];
  let text="";
  let endModule=open + (generic.duration/60);


  for(var i=0;i<totalmodules;i++){

    text=this.floatToStringHour(open)+" - "+ this.floatToStringHour(endModule);
    open=endModule;
    endModule+=generic.duration/60;
    final.push(text);
  }

  return final;
}

checkDay(day){
  return function(element){
    return element.weekday==day;
  }
}


 handleScheduleBaseHoursChange(idx,e){

    const newScheduleBases = this.state.scheduleBases.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      return { ...scheduleBase, hours:e.target.value };
    });

    this.setState({ scheduleBases: newScheduleBases });
  }

handleScheduleBaseHourDDChange (idx,e) {

    const newScheduleBases = this.state.scheduleBases.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      if ((document.getElementsByClassName('hours1')[idx].value=="2" && parseInt(document.getElementsByClassName('hours2')[idx].value)>3)||(document.getElementsByClassName('hours3')[idx].value=="2" && parseInt(document.getElementsByClassName('hours4')[idx].value)>3)) return scheduleBase;
      return { ...scheduleBase, hours: document.getElementsByClassName('hours1')[idx].value+document.getElementsByClassName('hours2')[idx].value+":"+document.getElementsByClassName('minutes1')[idx].value+document.getElementsByClassName('minutes2')[idx].value+ " - "+document.getElementsByClassName('hours3')[idx].value+document.getElementsByClassName('hours4')[idx].value+":"+document.getElementsByClassName('minutes3')[idx].value+document.getElementsByClassName('minutes4')[idx].value};
    });

    this.setState({ scheduleBases: newScheduleBases });
  }

handleGenericHourDDChange(idx,e){

    const newScheduleBases = this.state.generics.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      if ((document.getElementsByClassName('ghours1')[idx].value=="2" && parseInt(document.getElementsByClassName('ghours2')[idx].value)>3)||(document.getElementsByClassName('ghours3')[idx].value=="2" && parseInt(document.getElementsByClassName('ghours4')[idx].value)>3)) return scheduleBase;
      return { ...scheduleBase, hours: document.getElementsByClassName('ghours1')[idx].value+document.getElementsByClassName('ghours2')[idx].value+":"+document.getElementsByClassName('gminutes1')[idx].value+document.getElementsByClassName('gminutes2')[idx].value+ " - "+document.getElementsByClassName('ghours3')[idx].value+document.getElementsByClassName('ghours4')[idx].value+":"+document.getElementsByClassName('gminutes3')[idx].value+document.getElementsByClassName('gminutes4')[idx].value};
    });

    this.setState({ generics: newScheduleBases });
  }

handleGenericPriceChange(idx,e) {

    const newScheduleBases = this.state.generics.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      return { ...scheduleBase, price: e.target.value};
    });

    this.setState({ generics: newScheduleBases });
  }

handleGenericDurationChange(idx,e){

    const newScheduleBases = this.state.generics.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      return { ...scheduleBase, duration: e.target.value};
    });

    this.setState({ generics: newScheduleBases });
  }


handleScheduleBasePriceChange(idx,e) {

    const newScheduleBases = this.state.scheduleBases.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      return { ...scheduleBase, price: e.target.value};
    });

    this.setState({ scheduleBases: newScheduleBases });
  }

handleScheduleBaseDayChange(idx,e){

    const newScheduleBases = this.state.scheduleBases.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      return { ...scheduleBase, weekday: parseInt(e.target.value)};
    });

    this.setState({ scheduleBases: newScheduleBases });
  }

handleSubmit(e){

  console.log("HELLLOOOOO!!")
  scheduleBasesService.postBases(this.props.compoundId, this.props.fieldId, this.state);
  }

handleAddScheduleBase(didx,e){
    this.setState({ scheduleBases: this.state.scheduleBases.concat([{ hours:'00:00 - 00:00',price: 0,weekday:this.state.generics[didx].day,fieldId:this.props.fieldId }]) });
  }

handleRemoveScheduleBase(idx){
    this.setState({ scheduleBases: this.state.scheduleBases.filter((s, sidx) => idx !== sidx) });
  }

generateScheduleBase(idx){

    const arrayhours= this.arrayOfHours(this.state.generics[idx]);

    const modules= this.modules(this.state.generics[idx]);
    var cachar=this.state.scheduleBases;

        for (var i = 0; i < modules; i++) {
          cachar.push({ hours:arrayhours[i],price: this.state.generics[idx].price,weekday:this.state.generics[idx].day,fieldId:this.props.fieldId }) ;
        }
        this.setState({scheduleBases: cachar});
  }


  render() {
    return (
      <div className="center">


        <form onSubmit={this.handleSubmit}>
        <h4>ScheduleBases</h4>

        {this.state.generics.map((generic, idx) => (
        <div class="generator">
          <p> {this.state.days[generic.day]} </p>
          <h4> {generic.hours} </h4>

        <p>Hora inicio:  </p>
   <select className="ghours1"  onChange={this.handleGenericHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  </select>

<select className="ghours2" onChange={this.handleGenericHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
<option value="6">6</option>
<option value="7">7</option>
<option value="8">8</option>
<option value="9">9</option>
  </select>
:
<select className="gminutes1" onChange={this.handleGenericHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
  </select>

<select className="gminutes2" onChange={this.handleGenericHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
<option value="6">6</option>
<option value="7">7</option>
<option value="8">8</option>
<option value="9">9</option>
  </select>




<p>Hora fin:  </p>
   <select className="ghours3"  onChange={this.handleGenericHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  </select>

<select className="ghours4" onChange={this.handleGenericHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
<option value="6">6</option>
<option value="7">7</option>
<option value="8">8</option>
<option value="9">9</option>
  </select>
:
<select className="gminutes3" onChange={this.handleGenericHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
  </select>

<select className="gminutes4" onChange={this.handleGenericHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
<option value="6">6</option>
<option value="7">7</option>
<option value="8">8</option>
<option value="9">9</option>
  </select>

<p> Precio más común </p>
<input
  type="number"
  min="0"
  value={generic.price}
  onChange={this.handleGenericPriceChange.bind(this,idx)}
 />

<p> Duración modulo (en minutos) </p>

<input
  type="number"
  min="5"
  max="1440"
  value={generic.duration}
  onChange={this.handleGenericDurationChange.bind(this,idx)}
 />

<div>
<button type="button" onClick={this.generateScheduleBase.bind(this,idx)}>Generar Horario Base</button>
</div>
       </div>

          ) )

  }



<div className="scheduleBases">
{this.state.days.map((currentday,didx)=>(
  <div className="scheduleBase">
  <h3> {this.state.days[this.state.generics[didx].day]} </h3>
  <table>
  <tr>
  <th> Hora</th>
  <th> Precio </th>
  <th> Dia </th>
  <th> Eliminar </th>
  </tr>

  {this.state.scheduleBases.filter(this.checkDay(this.state.generics[didx].day)).map((scheduleBase, idx) => (




<tr>
<th>
<h3> {didx} - {idx} </h3>
            <h3>{scheduleBase.hours} </h3>
            <p>Hora inicio:  </p>
   <select className="hours1"  value={scheduleBase.hours.substr(0,1)} onChange={this.handleScheduleBaseHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  </select>

<select className="hours2" value={scheduleBase.hours.substr(1,1)} onChange={this.handleScheduleBaseHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
  <option value="7">7</option>
  <option value="8">8</option>
  <option value="9">9</option>
 </select>
:
<select className="minutes1" value={scheduleBase.hours.substr(3,1)} onChange={this.handleScheduleBaseHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
 </select>

<select className="minutes2" value={scheduleBase.hours.substr(4,1)} onChange={this.handleScheduleBaseHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
  <option value="7">7</option>
  <option value="8">8</option>
  <option value="9">9</option>
</select>




<p>Hora fin:  </p>
   <select className="hours3" value={scheduleBase.hours.substr(8,1)} onChange={this.handleScheduleBaseHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  </select>

<select className="hours4" value={scheduleBase.hours.substr(9,1)} onChange={this.handleScheduleBaseHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
  <option value="7">7</option>
  <option value="8">8</option>
  <option value="9">9</option>
 </select>
:
<select className="minutes3" value={scheduleBase.hours.substr(11,1)} onChange={this.handleScheduleBaseHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
 </select>

<select className="minutes4" value={scheduleBase.hours.substr(12,1)} onChange={this.handleScheduleBaseHourDDChange.bind(this,idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
  <option value="7">7</option>
  <option value="8">8</option>
  <option value="9">9</option>
</select>

</th>
  <td>

    <input
              type="number"
              min="0"
              placeholder={`ScheduleBase #${idx + 1} price`}
              value={scheduleBase.price}
              onChange={this.handleScheduleBasePriceChange.bind(this,idx)}
            />
    </td>
    <td>
    <select name='dayofweek' value={scheduleBase.weekday} onChange={this.handleScheduleBaseDayChange.bind(this,idx)}>

      <option value="1">Lunes</option>
      <option value="2">Martes</option>
    <option value="3">Miércoles</option>
    <option value="4">Jueves</option>
    <option value="5">Viernes</option>
    <option value="6">Sabado</option>
    <option value="0">Domingo</option>
      </select>
      </td>
<td>
            <button type="button" onClick={this.handleRemoveScheduleBase.bind(this,idx)} className="small">-</button>

</td>
          </tr>



        ))}
        <button type="button" onClick={this.handleAddScheduleBase.bind(this,didx)} className="small"> Agregar Hora</button>
          </table>
            </div>
      ))}



      </div>
        <input type="submit" value="Listo!"/>

      </form>

      </div>
    )

  }
}
