import 'whatwg-fetch';
import settings from '../static/settings.json';

const root = settings['chan-reactor'].hostUrl;
const apiRoot = root + '/rest/api/';

export const client = (entity, request) => {
    return fetch(entity, request)
};

export const collection = (entity, params) => {
    const url = new URL(`${apiRoot}${entity}`);
    if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    return fetch(url)
        .then(checkStatus)
        .then(parseJSON)
};

export const entity = (entity, id, params) => {
    const url = new URL(`${apiRoot}${entity}/${id}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return fetch(url)
        .then(checkStatus)
        .then(parseJSON)
};

export const custom = (path, request) => {
    return fetch(root + path, request);
};

export const search = (entity, method, params) => {
    const url = new URL(`${apiRoot}${entity}/search/${method}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return fetch(url)
        .then(checkStatus)
        .then(parseJSON)
};

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error
    }
}

function parseJSON(response) {
    return response.json()
}

export default client;