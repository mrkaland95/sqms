import React, {useState} from 'react';
import {generateRandomString} from "../utils/utils";
import {useAuth} from "./AuthProvider";
import {logoutRequest} from "../utils/fetch";
import {Navigate, useNavigate} from "react-router-dom";

const loginButtonID = "login-button"

function AuthenticateWithDiscordButton() {
    return (
        <div className='button-div'>
            <button className='default-button' onClick={redirectToDiscordAuth} id={loginButtonID}>LOGIN WITH DISCORD</button>
        </div>
    )
}


export function redirectToDiscordAuth() {
    const baseRedirectLink = 'http://localhost:5000/api/v1/auth/redirect'
    const randomString: string = generateRandomString()
    localStorage.setItem('oauth-string', randomString)
    // const redirectURL = `${baseRedirectLink}&state=${btoa(randomString)}`
    const redirectURL = `${baseRedirectLink}`

    window.location.assign(redirectURL)
    // TODO remove this hardcode and take it in as an .env
}


export function LoggedIn() {

}



export async function handleLogout() {
    await logoutRequest()
        .then(() => {
        })
        .catch(error => console.error(error))
    return (<></>)
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