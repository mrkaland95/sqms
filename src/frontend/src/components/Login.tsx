import React, {useState} from 'react';
import {generateRandomString} from "../utils/utils";
import {useAuth} from "./AuthProvider";
import {logoutRequest} from "../utils/fetch";
import {Navigate, useNavigate} from "react-router-dom";

const loginButtonID = "login-button"

function AuthenticateWithDiscordButton() {
    return (
        <div className='button-div'>
            <button className='default-button' onClick={performLoginWithAuth} id={loginButtonID}>LOGIN WITH DISCORD</button>
        </div>
    )
}

/**
 * Performs the actual authentication process to the server.
 */
export function performLoginWithAuth() {
    const baseRedirectLink = new URL('http://localhost:5000/api/v1/auth/redirect')
    const authString: string = generateRandomString()
    localStorage.setItem('oauth-string', authString)

    baseRedirectLink.searchParams.set('state', btoa(authString))

    window.location.assign(baseRedirectLink.toString())
    // TODO remove this hardcode and take it in as an .env
}


export function LoggedIn() {
    const authString = localStorage.getItem('oauth-string')
}



// window.onload = () => {
//     const fragment = new URLSearchParams(window.location.hash.slice(1));
//     const [accessToken, tokenType, state] = [fragment.get('access_token'), fragment.get('token_type'), fragment.get('state')];
//
//     if (!accessToken) {
//         const randomString = generateRandomString();
//         localStorage.setItem('oauth-state', randomString);
//
//         document.getElementById('login').href += `&state=${encodeURIComponent(btoa(randomString))}`;
//         return document.getElementById('login').style.display = 'block';
//     }
//
//     if (localStorage.getItem('oauth-state') !== atob(decodeURIComponent(state))) {
//         return console.log('You may have been click-jacked!');
//     }
// }


export default AuthenticateWithDiscordButton