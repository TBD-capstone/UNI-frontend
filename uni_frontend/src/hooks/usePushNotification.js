import { useRef } from 'react';

const usePushNotification = () => {
    const notificationRef = useRef(null);

    // Notification이 지원되지 않는 브라우저가 있을 수 있기 때문에, 이를 대비해 Early return 문을 걸어준다.
    if (!Notification) {
        return;
    }

    // 만약 이미 유저가 푸시 알림을 허용해놓지 않았다면,
    if (Notification.permission !== 'granted') {
        // Chrome - 유저에게 푸시 알림을 허용하겠냐고 물어보고, 허용하지 않으면 return!
        try {
            Notification.requestPermission().then((permission) => {
                if (permission !== 'granted') return;
            });
        } catch (error) {
            // Safari - 유저에게 푸시 알림을 허용하겠냐고 물어보고, 허용하지 않으면 return!
            if (error instanceof TypeError) {
                Notification.requestPermission().then((permission) => {
                    if (permission !== 'granted') return;
                });
            } else {
                console.error(error)
            }
        }
    }

    const setPermission = () => {
        Notification.requestPermission().then((permission) => {
            if (permission !== 'granted') return;
        });
    }

    const setNotificationClickEvent = () => {
        notificationRef.current.onclick = (event) => {
            event.preventDefault();
            window.focus();
            notificationRef.current.close();
        };
    };

    const fireNotification = (title, body) => {
        const newOption = {
            body: body || 'test body',
            icon: '/UNI_Logo.png'
        }

        notificationRef.current = new Notification(title||'title', newOption)

        setNotificationClickEvent();
    }

    return { fireNotification, setPermission }
}

export default usePushNotification;