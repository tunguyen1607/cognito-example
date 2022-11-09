import AWS from 'aws-sdk';
import jwt_decode from 'jwt-decode';
import config from '../config';
import 'cross-fetch/polyfill';
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
    UserPoolId : config.cognito.poolId,
    ClientId : config.cognito.clientId
};

const attributes = (key, value) => {
    return {
        Name : key,
        Value : value
    }
};

export default class CognitoHelper {
    public getUserPool;
    private cognitoAttributeList = [];
    constructor() {
        this.getUserPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    }

    setCognitoAttributeList = (email, agent) => {
        let attributeList = [];
        attributeList.push(attributes('email',email));
        attributeList.forEach(element => {
            this.cognitoAttributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(element));
        });
    };

    getCognitoAttributeList() {
        return this.cognitoAttributeList;
    }

    getCognitoUser(email) {
        const userData = {
            Username: email,
            Pool: this.getUserPool
        };
        return new AmazonCognitoIdentity.CognitoUser(userData);
    }

    getAuthDetails(email, password) {
        var authenticationData = {
            Username: email,
            Password: password,
        };
        return new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    }

    initAWS(region = process.env.AWS_COGNITO_REGION, identityPoolId = process.env.AWS_COGNITO_IDENTITY_POOL_ID) {
        AWS.config.region = region; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId,
        });
    }

    decodeJWTToken(token) {
        const {  email, exp, auth_time , token_use, sub} = jwt_decode(token.idToken);
        return {  token, email, exp, uid: sub, auth_time, token_use };
    }
}

