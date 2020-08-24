"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
const cognitoAttributtes_1 = __importDefault(require("./cognitoAttributtes"));
class AuthCognitoModule {
    constructor(poolData, poolRegion) {
        this.poolData = poolData;
        this.poolRegion = poolRegion || 'us-east-1';
        this.userPool = new amazon_cognito_identity_js_1.CognitoUserPool(poolData);
    }
    static cognitoUser(username, pool) {
        return new amazon_cognito_identity_js_1.CognitoUser({
            Username: username,
            Pool: pool
        });
    }
    static authenticationDetails(authenticationData) {
        return new amazon_cognito_identity_js_1.AuthenticationDetails(authenticationData);
    }
    static buildCognitoUser(attributes) {
        const cognitoAtt = cognitoAttributtes_1.default;
        const cognitoUserAttribute = Object
            .keys(attributes)
            .map(attribute => {
            if (cognitoAtt.includes(attribute)) {
                return new amazon_cognito_identity_js_1.CognitoUserAttribute({ Name: attribute, Value: `${attributes[attribute]}` });
            }
            return new amazon_cognito_identity_js_1.CognitoUserAttribute({ Name: `custom:${attribute}`, Value: `${attributes[attribute]}` });
        });
        return cognitoUserAttribute;
    }
    signUp(user, validationData = []) {
        const { username, password } = user;
        const attributeList = AuthCognitoModule.buildCognitoUser(user);
        return new Promise((resolve, reject) => {
            this.userPool.signUp(username, password, attributeList, validationData, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
    confirmRegistration({ username, smsCode }) {
        const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool);
        return new Promise((resolve, reject) => {
            cognitoUser.confirmRegistration(smsCode, true, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
    signIn({ username, password }) {
        const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool);
        const authenticationDetails = AuthCognitoModule
            .authenticationDetails({
            Username: username,
            Password: password
        });
        return new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {
                    resolve({
                        accessToken: result.getAccessToken().getJwtToken(),
                        idToken: result.getIdToken().getJwtToken(),
                        refreshToken: result.getRefreshToken().getToken(),
                        payload: result.getAccessToken().payload,
                        isValid: result.isValid()
                    });
                },
                onFailure: function (err) {
                    reject(err);
                }
            });
        });
    }
    changePassword({ username, oldPassword, newPassword }) {
        const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool);
        const authenticationDetails = AuthCognitoModule.authenticationDetails({
            Username: username,
            Password: oldPassword
        });
        return new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function () {
                    return cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
                        if (err)
                            reject(err);
                        resolve(result);
                    });
                },
                onFailure: function (err) {
                    reject(err);
                }
            });
        });
    }
    confirmPassword({ username, smsCode, newPassword }) {
        const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool);
        return new Promise((resolve, reject) => {
            cognitoUser.confirmPassword(smsCode, newPassword, {
                onSuccess() {
                    resolve('Password confirmed!');
                },
                onFailure(err) {
                    reject(err);
                }
            });
        });
    }
    forgotPassword({ username }) {
        const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool);
        return new Promise((resolve, reject) => {
            cognitoUser.forgotPassword({
                onSuccess: function (data) {
                    resolve({ data, message: 'CodeDeliveryData from forgotPassword' });
                },
                onFailure: function (err) {
                    reject(err);
                }
            });
        });
    }
    refreshToken({ username, refreshTokenUser }) {
        const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool);
        const RefreshToken = new amazon_cognito_identity_js_1.CognitoRefreshToken({
            RefreshToken: refreshTokenUser
        });
        return new Promise((resolve, reject) => {
            cognitoUser.refreshSession(RefreshToken, (err, result) => {
                if (err)
                    reject(err);
                resolve({
                    accessToken: result.getAccessToken().getJwtToken(),
                    idToken: result.getIdToken().getJwtToken(),
                    refreshToken: result.getRefreshToken().getToken()
                });
            });
        });
    }
    resendConfirmationCode({ username }) {
        const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool);
        return new Promise((resolve, reject) => {
            cognitoUser.resendConfirmationCode((err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
}
exports.default = AuthCognitoModule;
//# sourceMappingURL=AuhtCognitoModule.js.map