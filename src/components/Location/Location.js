import React, { Component } from 'react'
import { Plugins } from '@capacitor/core';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import { db } from '../../firebase-config'
import { IonButton, IonLoading } from '@ionic/react';

const { App, BackgroundTask, Geolocation } = Plugins;


class Location extends Component {

    state = {
        currentCoordinate: null,
        pushingLocation: false,
        currentTime: new Date().getTime(),
    }

    async requestPermissions() {
        const permResult = await Plugins.Geolocation.requestPermissions();
        console.log('Perm request result: ', permResult);
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

    watchPosition = () => {
        const wait = Geolocation.watchPosition({}, (position, err) => {
            if (position.coords !== undefined) {
                console.log('inside watch position');
                console.log('response :' + position);
                console.log('error : ' + err);
                if (Math.abs(new Date().getTime() - this.state.currentTime) > 10000) {
                    this.setState({
                        currentCoordinate: position.coords,
                    })
                    // this.pushLocation('watch position');
                    // replace above with bttm
                    const rootRef = db.ref('locations');
                    rootRef.push({
                        latitude: this.state.currentCoordinate.latitude,
                        longitude: this.state.currentCoordinate.longitude,
                        source: 'background-task in while',
                    }).then(() => {

                    }).catch(error => {
                        console.log(error);
                    });
                }
            }
        })
        console.log('wait :' + wait)
    }

    componentDidMount = () => {
        this.requestPermissions();
        console.log('Inside GeoLocation : Component did mount');
        this.getCurrentPosition();
        this.watchPosition();
        this.performBackgroundAction();
        console.log('current date : ' + this.state.currentTime);


    }
    performBackgroundAction = () => {
        App.addListener('appStateChange', (state) => {

            console.log(' inside background task : listner')

            if (!state.isActive) {
                // The app has become inactive. We should check if we have some work left to do, and, if so,
                // execute a background task that will allow us to finish that work before the OS
                // suspends or terminates our app:
                // Example of long task

                let taskId = BackgroundTask.beforeExit(async () => {

                    console.log(' inside background task: before exit')
                    // In this function We might finish an upload, let a network request
                    // finish, persist some data, or perform some other task
                    const rootRef = db.ref('locations');
                    rootRef.push({
                        latitude: this.state.currentCoordinate.latitude,
                        longitude: this.state.currentCoordinate.longitude,
                        source: 'background-task outside while',
                    }).then(() => {


                    }).catch(error => {
                        console.log(error);
                        this.setState({ pushingLocation: false });
                    });

                    while (true) {

                        this.watchPosition()

                        // Geolocation.getCurrentPosition().then(coordinates => {
                        //     this.setState({
                        //         currentCoordinate: coordinates.coords,
                        //     })
                        //     this.pushLocation('background task')
                        //     LocalNotifications.schedule({
                        //         notifications: [
                        //             {
                        //                 title: "Last Known Location",
                        //                 body: "Latitude: " + coordinates.coords.latitude + "Longitude: " + coordinates.coords.longitude,
                        //                 id: 1,
                        //                 schedule: { at: new Date(Date.now() + 1000 * 10) },
                        //                 sound: null,
                        //                 attachments: null,
                        //                 actionTypeId: "",
                        //                 extra: null
                        //             }
                        //         ]
                        //     });

                        // }).catch(error => {
                        //     console.log('background task :' + error)

                        // })
                    }
                    // Must call in order to end our task otherwise
                    // we risk our app being terminated, and possibly
                    // being labeled as impacting battery life
                    // console.log('inside background task : near finish')

                });
                BackgroundTask.finish({
                    taskId
                });
            }
        })
    }

    pushLocation = (source) => {
        console.log('pushing location')
        this.setState({ pushingLocation: true });
        const rootRef = db.ref('locations');
        rootRef.push({
            latitude: this.state.currentCoordinate.latitude,
            longitude: this.state.currentCoordinate.longitude,
            source: source,
        }).then(reponse => {

            this.setState({ pushingLocation: false });
        }).catch(error => {
            console.log(error);
            this.setState({ pushingLocation: false });
        });
    }

    render() {
        const mapStyles = {
            width: '300px',
            height: '300px',
        };
        let content = null;
        if (this.state.currentCoordinate != null) {
            content = (

                <div>
                    <IonButton onClick={() => this.pushLocation('Manual push')}>Push Location</IonButton>
                    <p>latitude : {this.state.currentCoordinate.latitude}</p>
                    <p>longitude : {this.state.currentCoordinate.longitude}</p>
                    <p>Accuracy : {this.state.currentCoordinate.accuracy}</p>
                    <Map
                        google={this.props.google}
                        zoom={8}
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
