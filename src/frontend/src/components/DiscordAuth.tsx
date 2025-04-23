import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {generateRandomString} from "../utils/utils";

const accessTokenName = 'access_token'


function DiscordAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = fragment.get(accessTokenName);
        const state = fragment.get('state');

        if (accessToken) {
            const storedState = localStorage.getItem('oauth-state');
            const decodedState = atob(decodeURIComponent(state || ''));

            if (storedState === decodedState) {
                localStorage.setItem(accessTokenName, accessToken)
                setIsLoggedIn(true)
            } else {
                console.warn('Potential click-jacking attack detected!');
            }
        }

        if (localStorage.getItem(accessTokenName)) {
            setIsLoggedIn(true)
        }
    }, [])

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/user');
        }
    }, [isLoggedIn, navigate])
}



export default DiscordAuth