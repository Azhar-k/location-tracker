import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { Component } from 'react';
import './Home.css';
import Location from '../components/Location/Location';

class Home extends Component {

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Location Tracker</IonTitle>
            </IonToolbar>
          </IonHeader>
          <Location/>
        </IonContent>
      </IonPage>
    );
  }
}
export default Home;
