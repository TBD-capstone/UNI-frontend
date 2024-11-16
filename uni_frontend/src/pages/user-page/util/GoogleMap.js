import {AdvancedMarker, APIProvider, InfoWindow, Map, Pin, useAdvancedMarkerRef} from '@vis.gl/react-google-maps';
import {useCallback, useEffect, useState} from "react";

const GoogleMap = (props) =>{
    const position = {lat: 37.282826, lng: 127.043504};
    const [markerPosition, setMarkerPosition] = useState(null);
    const [markers, setMarkers] = useState(null);

    const handleMapClick = (e) => {
        if (props.setting)
            setting(e.detail.latLng);
    }
    const setting = (latLng) => {
        console.log(latLng);
        setMarkerPosition(latLng);
        props.setting(latLng);
    }

    const CustomMarker = (props) => {
        const [markerRef, marker] = useAdvancedMarkerRef();
        const [infoWindowShown, setInfoWindowShown] = useState(false);

        const handleMarkerClick = useCallback(
            () => setInfoWindowShown(isShown => !isShown),
            []
        );

        const handleClose = useCallback(() => setInfoWindowShown(false), []);

        return (
            <>
                <AdvancedMarker
                    position={{lat: props.data.latitude, lng: props.data.longitude}}
                    title={props.data.name}
                    ref={markerRef}
                    onClick={handleMarkerClick}
                />
                {infoWindowShown && (<InfoWindow anchor={marker} onClose={handleClose}>
                    <h2>{props.data.name}</h2>
                    <p>{props.data.description}</p>
                </InfoWindow>)}
            </>
        )
    };
    useEffect(() => {
        setMarkers(props.markers);
    }, [props.markers]);

    return (
        <APIProvider apiKey={`${process.env.REACT_APP_API_KEY}`}>
            <Map
                defaultCenter={position}
                defaultZoom={14}
                mapId='42ab71f8619ee4da'
                onClick={handleMapClick}>
                {markers && markers.map((data, i) => {
                    return <CustomMarker data={data} key={`CustomMarker-${i}`}/>;
                })}
                {props.setting && <>
                    <AdvancedMarker
                        position={markerPosition}
                    >
                        <Pin
                            background={'#0f9d58'}
                            borderColor={'#006425'}
                            glyphColor={'#60d98f'}
                        />
                    </AdvancedMarker>
                </>}
            </Map>
        </APIProvider>
    );
}

export default GoogleMap;