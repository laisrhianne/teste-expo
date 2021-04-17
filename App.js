import React, {useState, useEffect, useRef} from 'react';
import {StatusBar} from 'expo-status-bar';
import MapView, {Marker, Circle} from 'react-native-maps';
import {Dimensions, StyleSheet, Text, View, SafeAreaView, TouchableWithoutFeedback} from 'react-native';
import * as ExpoLocation from 'expo-location';
import pontosJSON from './Pontos2.json';

export default function App() {
  // const pontos = (JSON.parse(pontosJSON));
  const array = [
    // {latitude: -5.88672272127, longitude: -5.88672272127},
    {latitude: -5.88672272127, longitude: -5.88672272127},
    {latitude: -5.881, longitude: -35.17542},
    {latitude: -5.882, longitude: -35.17543},
    {latitude: -5.883, longitude: -35.17544},
    {latitude: -5.884, longitude: -35.17545},
  ]

  const [location, setLocation] = useState(null);
  const [updatedLocation, setUpdatedLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [arrayPontos, setArrayPontos] = useState(pontosJSON);

  const mapRef = useRef();

  async function getCamera() {
    if (mapRef && mapRef.current) {
      const camera = await mapRef.current.getCamera();
      setUpdatedLocation(camera);
    }
    const locationAtual = await ExpoLocation.getCurrentPositionAsync({});
    setLocation(locationAtual);
  }

  useEffect(() => {
    (async () => {
      const {status} = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const locationAtual = await ExpoLocation.getCurrentPositionAsync({});
      setLocation(locationAtual);
    })();

    getCamera();

    // setArrayPontos(pontos);
    
  }, []);

  function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000;
  }
  
  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        {location ? (
          <MapView
            ref={mapRef}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.014,
              longitudeDelta: 0.014,
            }}
            style={styles.map}
            onRegionChange={async () => await getCamera()}
            showsUserLocation
            onPress={(event) => {
              const clickedCoordinate = event.nativeEvent.coordinate;
              // console.log(clickedCoordinate);
              arrayPontos.forEach((ponto) => {
              const distancia = measure(ponto.latitude, ponto.longitude, clickedCoordinate.latitude, clickedCoordinate.longitude);
              if (distancia < 5) {
                console.log('PONTO: ', ponto.nom_identificacao);
              }
              });
            }}
            >
            {updatedLocation ? <Marker
              title="Casa da Laís"
              coordinate={{latitude: updatedLocation.center.latitude, longitude: updatedLocation.center.longitude}}
              draggable
              onPress={async () => await getCamera()}
            /> : null}
            
            {arrayPontos ? arrayPontos.map((ponto) => (
              <Circle center={{latitude: ponto.latitude, longitude: ponto.longitude}} radius={5} key={ponto.seq_ponto_servico} fillColor="#FF0" strokeColor="#000" />
            )) : null}
            {/* <TouchableWithoutFeedback onPress={() => console.log('APERTOU')}>
              <Circle center={{latitude: -5.88672272127, longitude: -35.1754179495}} radius={5} fillColor="#FF0" strokeColor="#000" />
            </TouchableWithoutFeedback> */}

            
          </MapView>
        ) : null}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0.07 * Dimensions.get('screen').height,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
