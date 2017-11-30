import React, { Component } from 'react';
import PropTypes from 'prop-types';
import useAPIService from '../services/useapi';



export default class UseAPIForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      venues:[{name:"JAJA"},{name:"NOOO"}],
      latitude:null,
      longitude:null,
      error: null,
      compound: {name:"",localEmail:"",photo:"",address:"",localPhone:""},
    }
    this.handleSubmit=this.handleSubmit.bind(this);
  }

  componentDidMount() {

    this.getgeolocation();


}

async getgeolocation(){
  await navigator.geolocation.getCurrentPosition(
    (position) => {
      this.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
      });
    },
    (error) => this.setState({ error: error.message }),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
  );

  if(this.state.latitude && this.state.longitude){

    this.getCompounds(this.state.latitude, this.state.longitude);
  }
  else{

    this.getCompounds(-33.45, -70.6667);

  }
}

async getCompounds(latitude,longitude){

  const compounds=await useAPIService.getNearbyCompound(latitude,longitude);

   this.setState({venues:compounds.body.response.venues});


}

async details(id){

  const details= await useAPIService.getDetails(id);

  this.setState({compound:{name:details.body.response.venue.name,localEmail:this.state.compound.localEmail,address:details.body.response.venue.location.address,localPhone:details.body.response.venue.contact.phone,photo:details.body.response.venue.photos.groups[0].items[0].prefix+"original"+details.body.response.venue.photos.groups[0].items[0].suffix}});

}


 handleCompoundNameChange(e){

   this.setState({compound:{name:e.target.value,localEmail:this.state.compound.localEmail,address:this.state.compound.address,localPhone:this.state.compound.localPhone,photo:this.state.compound.photo}});

 }

 handleCompoundlocalEmailChange(e){
   this.setState({compound:{name:this.state.compound.name,localEmail:e.target.value,address:this.state.compound.address,localPhone:this.state.compound.localPhone,photo:this.state.compound.photo}});
 }


 handleCompoundAddressChange(e){
   this.setState({compound:{name:this.state.compound.name,localEmail:this.state.compound.localEmail,address:e.target.value,localPhone:this.state.compound.localPhone,photo:this.state.compound.photo}});
 }
 handleCompoundLocalPhoneChange(e){
   this.setState({compound:{name:this.state.compound.name,localEmail:this.state.compound.localEmail,address:this.state.compound.address,localPhone:e.target.value,photo:this.state.compound.photo}});
 }

handleCompoundSelection(e){

  this.details(this.state.venues[e.target.value].id);

  }

handleSubmit(e){

  useAPIService.postCompound(this.state.compound);

  window.location.assign("/compounds/");
  e.preventDefault();
}


  render() {
    return (
      <div>


        <form onSubmit={this.handleSubmit}>

        <h4>{this.state.error}</h4>
        <select onChange={this.handleCompoundSelection.bind(this)}>
        <option> Seleccione un recinto </option>
        {this.state.venues.map((venue, sidx) => {
          return <option value={sidx}> {venue.name} </option>

        })}


        </select>
        <p> Name: </p>
        <input
          type="text"
          value={this.state.compound.name}
          onChange={this.handleCompoundNameChange.bind(this)}
         />
         <p> Local Phone: </p>
         <input
           type="text"
           value={this.state.compound.localPhone}
           onChange={this.handleCompoundLocalPhoneChange.bind(this)}
          />
          <p> Local email: </p>
          <input
            type="text"
            value={this.state.compound.localEmail}
            onChange={this.handleCompoundlocalEmailChange.bind(this)}
           />
           <p> Address: </p>
           <input
             type="text"
             value={this.state.compound.address}
             onChange={this.handleCompoundAddressChange.bind(this)}
            />
        <input type="submit" value="Listo!"/>

      </form>

      </div>

    )
  }
}
