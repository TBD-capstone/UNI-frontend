import {useEffect, useRef, useState} from "react";

const GoogleMap = (props) => {

    const ref = useRef(null);
    const [googleMap, setGoogleMap] = useState();

    useEffect(() => {
        if (ref.current) {
            const initialMap = new window.google.maps.Map(ref.current,
                props.data
            );

            setGoogleMap(initialMap);
        }
    }, [props.data]);

    return <div ref={ref} id="map" style={{ minHeight: '100%' }} />
}

export default GoogleMap;