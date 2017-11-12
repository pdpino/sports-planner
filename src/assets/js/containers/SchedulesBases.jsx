import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CreateScheduleBaseComponent from '../components/CreateScheduleBaseComponent';

export deafult class ScheduleBaseForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      days:["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],
      scheduleBases: [],
      generics:[{done:false,hours:'',day:1,price:0,duration:5},{done:false,hours:'',day:2,price:0,duration:5},{done:false,hours:'',day:3,price:0,duration:5},{done:false,hours:'',day:4,price:0,duration:5},{done:false,hours:'',day:5,price:0,duration:5},{done:false,hours:'',day:6,price:0,duration:5},{done:false,hours:'',day:0,price:0,duration:5}],
    };
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

  for (i=0;i<totalmodules;i++){

    text=this.floatToStringHour(open)+" - "+ this.floatToStringHour(endModule);
    open=endModule;
    endModule+=generic.duration/60;
    final.push(text);
  }
  return final;
}


 handleScheduleBaseHoursChange = (idx) => (evt) => {
    const newScheduleBases = this.state.scheduleBases.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      return { ...scheduleBase, hours:evt.target.value };
    });

    this.setState({ scheduleBases: newScheduleBases });
  }

  handleScheduleBaseHourDDChange = (idx) => (evt) => {
    const newScheduleBases = this.state.scheduleBases.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      if ((document.getElementsByClassName('hours1')[idx].value=="2" && parseInt(document.getElementsByClassName('hours2')[idx].value)>3)||(document.getElementsByClassName('hours3')[idx].value=="2" && parseInt(document.getElementsByClassName('hours4')[idx].value)>3)) return scheduleBase;
      return { ...scheduleBase, hours: document.getElementsByClassName('hours1')[idx].value+document.getElementsByClassName('hours2')[idx].value+":"+document.getElementsByClassName('minutes1')[idx].value+document.getElementsByClassName('minutes2')[idx].value+ " - "+document.getElementsByClassName('hours3')[idx].value+document.getElementsByClassName('hours4')[idx].value+":"+document.getElementsByClassName('minutes3')[idx].value+document.getElementsByClassName('minutes4')[idx].value};
    });

    this.setState({ scheduleBases: newScheduleBases });
  }

  handleGenericHourDDChange = (idx) => (evt) => {
    const newScheduleBases = this.state.generics.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      if ((document.getElementsByClassName('ghours1')[idx].value=="2" && parseInt(document.getElementsByClassName('ghours2')[idx].value)>3)||(document.getElementsByClassName('ghours3')[idx].value=="2" && parseInt(document.getElementsByClassName('ghours4')[idx].value)>3)) return scheduleBase;
      return { ...scheduleBase, hours: document.getElementsByClassName('ghours1')[idx].value+document.getElementsByClassName('ghours2')[idx].value+":"+document.getElementsByClassName('gminutes1')[idx].value+document.getElementsByClassName('gminutes2')[idx].value+ " - "+document.getElementsByClassName('ghours3')[idx].value+document.getElementsByClassName('ghours4')[idx].value+":"+document.getElementsByClassName('gminutes3')[idx].value+document.getElementsByClassName('gminutes4')[idx].value};
    });

    this.setState({ generics: newScheduleBases });
  }

  handleGenericPriceChange = (idx) => (evt) => {
    const newScheduleBases = this.state.generics.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      return { ...scheduleBase, price: evt.target.value};
    });

    this.setState({ generics: newScheduleBases });
  }

  handleGenericDurationChange = (idx) => (evt) => {
    const newScheduleBases = this.state.generics.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      return { ...scheduleBase, duration: evt.target.value};
    });

    this.setState({ generics: newScheduleBases });
  }


  handleScheduleBasePriceChange = (idx) => (evt) => {
    const newScheduleBases = this.state.scheduleBases.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      return { ...scheduleBase, price: evt.target.value};
    });

    this.setState({ scheduleBases: newScheduleBases });
  }

   handleScheduleBaseDayChange = (idx) => (evt) => {
    const newScheduleBases = this.state.scheduleBases.map((scheduleBase, sidx) => {
      if (idx !== sidx) return scheduleBase;
      return { ...scheduleBase, weekday: parseInt(evt.target.value)};
    });

    this.setState({ scheduleBases: newScheduleBases });
  }

  handleSubmit = (evt) => {

  }

  handleAddScheduleBase = () => {
    this.setState({ scheduleBases: this.state.scheduleBases.concat([{ hours:'',price: 0,weekday:'' }]) });
  }

  handleRemoveScheduleBase = (idx) => () => {
    this.setState({ scheduleBases: this.state.scheduleBases.filter((s, sidx) => idx !== sidx) });
  }

  generateScheduleBase = (idx) => () => {
        const arrayhours= this.arrayOfHours(this.state.generics[idx]);
        const modules= this.modules(this.state.generics[idx]);
        let cachar=this.state.scheduleBases;
      console.log(arrayhours);
      console.log(modules);
        for (i = 0; i < modules; i++) {
          cachar.push({ hours:arrayhours[i],price: this.state.generics[idx].price,weekday:this.state.generics[idx].day }) ;
        }
        this.setState({scheduleBases: cachar});

  }


  render() {
    return (

        <form onSubmit={this.handleSubmit}>
        <h4>ScheduleBases</h4>
        {this.state.generics.map((generic, idx) => (
        <div>
          <p> {this.state.days[generic.day]} </p>
          <input
            type="text"
            value={generic.hours}
            placeholder={`Hora del dia ${this.state.days[generic.day]} `}
            disabled
           />

        <p>Hora inicio:  </p>
   <select className="ghours1"  onChange={this.handleGenericHourDDChange(idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  </select>

<select className="ghours2" onChange={this.handleGenericHourDDChange(idx)}>
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
<select className="gminutes1" onChange={this.handleGenericHourDDChange(idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
  </select>

<select className="gminutes2" onChange={this.handleGenericHourDDChange(idx)}>
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
   <select className="ghours3"  onChange={this.handleGenericHourDDChange(idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  </select>

<select className="ghours4" onChange={this.handleGenericHourDDChange(idx)}>
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
<select className="gminutes3" onChange={this.handleGenericHourDDChange(idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
  </select>

<select className="gminutes4" onChange={this.handleGenericHourDDChange(idx)}>
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
  onChange={this.handleGenericPriceChange(idx)}
 />

<p> Duración modulo (en minutos) </p>

<input
  type="number"
  min="5"
  max="1440"
  value={generic.duration}
  onChange={this.handleGenericDurationChange(idx)}
 />


<button type="button" onClick={this.generateScheduleBase(idx)} className="small">Generar Horario Base</button>
       </div>

          ) )

  }

{this.state.scheduleBases.map((scheduleBase, idx) => (
  <div className="scheduleBase">
   <table>
<tr>
<th> </th>
<th> <p> Dia </p>
<select name='dayofweek' value={scheduleBase.weekday} onChange={this.handleScheduleBaseDayChange(idx)}>

  <option value="1">Lunes</option>
  <option value="2">Martes</option>
<option value="3">Miércoles</option>
<option value="4">Jueves</option>
<option value="5">Viernes</option>
<option value="6">Sabado</option>
<option value="0">Domingo</option>
  </select> </th>

<th> Eliminar </th>
</tr>
<tr>
<td>
<input
              type="text"
              value={scheduleBase.hours}
              placeholder={`ScheduleBase #${idx + 1} a`}
              onChange={this.handleScheduleBaseHoursChange(idx)}
              disabled
            />
            <p>Hora inicio:  </p>
   <select className="hours1"  value={scheduleBase.hours.substr(0,1)} onChange={this.handleScheduleBaseHourDDChange(idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  </select>

<select className="hours2" value={scheduleBase.hours.substr(1,1)} onChange={this.handleScheduleBaseHourDDChange(idx)}>
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
<select className="minutes1" value={scheduleBase.hours.substr(3,1)} onChange={this.handleScheduleBaseHourDDChange(idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
 </select>

<select className="minutes2" value={scheduleBase.hours.substr(4,1)} onChange={this.handleScheduleBaseHourDDChange(idx)}>
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
   <select className="hours3" value={scheduleBase.hours.substr(8,1)} onChange={this.handleScheduleBaseHourDDChange(idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  </select>

<select className="hours4" value={scheduleBase.hours.substr(9,1)} onChange={this.handleScheduleBaseHourDDChange(idx)}>
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
<select className="minutes3" value={scheduleBase.hours.substr(11,1)} onChange={this.handleScheduleBaseHourDDChange(idx)}>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
 </select>

<select className="minutes4" value={scheduleBase.hours.substr(12,1)} onChange={this.handleScheduleBaseHourDDChange(idx)}>
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

</td>
  <td>
    <p> Precio </p>
    <input
              type="number"
              min="0"
              placeholder={`ScheduleBase #${idx + 1} price`}
              value={scheduleBase.price}
              onChange={this.handleScheduleBasePriceChange(idx)}
            />
    </td>
<td>
            <button type="button" onClick={this.handleRemoveScheduleBase(idx)} className="small">-</button>

</td>
          </tr>
</table>

            </div>
        ))}

        <button type="button" onClick={this.handleAddScheduleBase} className="small">Add ScheduleBase</button>
        <button>Listo!</button>
      </form>
    )
  }
}
