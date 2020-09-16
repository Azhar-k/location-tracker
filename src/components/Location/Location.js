import React, { Component } from 'react'
import { Plugins } from '@capacitor/core';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import { db } from '../../firebase-config'
import { IonButton, IonLoading,IonItem, IonLabel,IonSelect,IonSelectOption } from '@ionic/react';

const { App, BackgroundTask, LocalNotifications, Geolocation } = Plugins;


class Location extends Component {

    state = {
        currentCoordinate: null,
        pushingLocation: false,
        currentTime: new Date().getTime(),
        user:'faris'
    }

    componentDidMount = () => {
        console.log('Inside GeoLocation : Component did mount');
        this.getCurrentPosition();
        this.watchPosition('Foreground watchPosition');
        this.performBackgroundAction();

    }
    getCurrentPosition = () => {
        console.log('GeoLocation : getCurrentPosition');
        Geolocation.getCurrentPosition().then(coordinates => {
            console.log(coordinates.coords)
            this.setState({
                currentCoordinate: coordinates.coords,
            })

        }).catch(error => {
            console.log('getCurrentPosition normal:' + error)

        })


    }

    watchPosition = (source = null) => {
        const wait = Geolocation.watchPosition({}, (position, err) => {
            if (position.coords !== undefined) {
                console.log('inside watch position');
                console.log('response :' + position);
                console.log('error : ' + err);
                if (Math.abs(new Date().getTime() - this.state.currentTime) > 2000) {
                    console.log('entered in if after 10sec');
                    this.setState({
                        currentCoordinate: position.coords,
                    })
                    this.pushLocation(source);
                    this.setState({
                        currentTime: new Date().getTime()
                    });
                }
            }
        })
    }

    performBackgroundAction = () => {
        App.addListener('appStateChange', (state) => {

            console.log(' inside background task : listner')

            if (!state.isActive) {
                this.getCurrentPosition();
                this.pushLocation('This is the first bg location')

                let taskId = BackgroundTask.beforeExit(async () => {

                    while (true) {
                        if (new Date().getTime() % 10000 === 0) {
                            this.getCurrentPosition();
                            this.pushLocation('This is a background location')
                        }
                    }
                    BackgroundTask.finish({
                        taskId
                    });
                });

            }
        })
    }
    pushLocation = (source) => {

        const rootRef = db.ref('locations');
        rootRef.push({
            latitude: this.state.currentCoordinate.latitude,
            longitude: this.state.currentCoordinate.longitude,
            source: source,
            time: new Date().toLocaleString()
        }).then((response) => {

            console.log("database response : " + response);
        }).catch(error => {
            console.log(error);

        });
        // static field
        const constLoc = db.ref('fixedlocation/'+this.state.user);
        constLoc.set({
            latitude: this.state.currentCoordinate.latitude,
            longitude: this.state.currentCoordinate.longitude,
            source: source,
            update_time: new Date().toLocaleString()
        })
    }
    displayNotification = () => {
        LocalNotifications.schedule({
            notifications: [
                {
                    title: "Last Known Location",
                    body: "Latitude: " + this.state.currentCoordinate.latitude + "Longitude: " + this.state.currentCoordinate.longitude,
                    id: 1,
                    schedule: { at: new Date(Date.now() + 1000 * 10) },
                    sound: null,
                    attachments: null,
                    actionTypeId: "",
                    extra: null
                }
            ]
        });
    }


    pushLocationButtonHandler = () => {
        console.log('pushing location')
        this.setState({ pushingLocation: true });
        this.pushLocation("manually pushed");
        this.setState({ pushingLocation: false });
    }

    setUser=(user)=>{
        this.setState({
            user:user
        })
    }

    render() {
        const mapStyles = {
            width: '100%',
            height: '300px',
        };
        let content = null;
        if (this.state.currentCoordinate != null) {
            content = (

                <div>
                    <IonItem>
                        <IonLabel>Select User</IonLabel>
                        <IonSelect value={this.state.user} placeholder="Select One" onIonChange={e => this.setUser(e.detail.value)}>
                            <IonSelectOption value="faris">Faris</IonSelectOption>
                            <IonSelectOption value="azhar">Azhar</IonSelectOption>
                            <IonSelectOption value="fasal">Fasal</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonButton onClick={() => this.pushLocationButtonHandler()}>Push Location</IonButton>
                    <p>latitude : {this.state.currentCoordinate.latitude}</p>
                    <p>longitude : {this.state.currentCoordinate.longitude}</p>
                    <p>Accuracy : {this.state.currentCoordinate.accuracy}</p>
                    <Map
                        google={this.props.google}
                        zoom={16}
                        style={mapStyles}
                        initialCenter={{ lat: this.state.currentCoordinate.latitude, lng: this.state.currentCoordinate.longitude }}
                    >
                        <Marker lat={this.state.currentCoordinate.latitude} log={this.state.currentCoordinate.longitude} />
                    </Map>
                    <IonLoading isOpen={this.state.pushingLocation} />

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
