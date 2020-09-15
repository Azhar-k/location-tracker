import React, { Component } from 'react'
import { Plugins } from '@capacitor/core';
import { Map, GoogleApiWrapper } from 'google-maps-react';

const { Geolocation } = Plugins;

class Location extends Component {

    state = {
        currentCoordinate: null,
    }
    async getCurrentPosition() {
        console.log('GeoLocation : getCurrentPosition');
        const coordinates = await Geolocation.getCurrentPosition();
        console.log('Current', coordinates.coords);
        this.setState({
            currentCoordinate: coordinates.coords,
        })
    }

    watchPosition() {
        const wait = Geolocation.watchPosition({}, (position, err) => {
        })
    }

    componentDidMount = () => {
        console.log('GeoLocation : Component did mount');
        this.getCurrentPosition();
    }

    render() {
        const mapStyles = {
            width: '300px',
            height: '300px',
          };
        let content=null;  
        if(this.state.currentCoordinate!=null){
            content = (
            
                <div>
                    <p>latitude : {this.state.currentCoordinate.latitude}</p>
                    <p>longitude : {this.state.currentCoordinate.longitude}</p>
                    <Map
                        google={this.props.google}
                        zoom={8}
                        style={mapStyles}
                        initialCenter={{ lat:this.state.currentCoordinate.latitude, lng:this.state.currentCoordinate.longitude }}
                    />
    
                </div>
            );
        }
        return (
            
            <div>
                {content}

            </div>
        );
    }

}


export default GoogleApiWrapper({
    apiKey: 'AIzaSyCdvIE86J76z5rS_Dj8gko - kJDCN7pgsMI'
  })(Location);
