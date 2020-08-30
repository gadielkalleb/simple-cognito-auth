import { CognitoUser,  CognitoUserPool, AuthenticationDetails, CognitoUserAttribute, CognitoRefreshToken, ISignUpResult, CognitoUserSession } from 'amazon-cognito-identity-js'
import { IPoolData, IAuthenticationData, IAttributes, IUserCognito, ILoginResponse, IForgotPasswordResponse, IRefreshTokenResponse } from './interfaces'
import cognitoAttributes from './cognitoAttributtes'

global.fetch = require('node-fetch')

class AuthCognitoModule {
  poolData: IPoolData
  poolRegion: string
  userPool: CognitoUserPool

  constructor (poolData: IPoolData, poolRegion: string) {
    this.poolData = poolData
    this.poolRegion = poolRegion || 'us-east-1'
    this.userPool = new CognitoUserPool(poolData)
  }

  static cognitoUser (username: string, pool: CognitoUserPool): CognitoUser {
    return new CognitoUser({
      Username: username,
      Pool: pool
    })
  }

  static authenticationDetails (authenticationData: IAuthenticationData): AuthenticationDetails {
    return new AuthenticationDetails(authenticationData)
  }


  static buildCognitoUser (attributes: IAttributes): CognitoUserAttribute[] {
    if (Object.keys(attributes).includes('password')) {
      delete attributes['password']
    }
    const cognitoAtt = cognitoAttributes

    const cognitoUserAttribute = Object
      .keys(attributes)
      .map(attribute => {
        if (cognitoAtt.includes(attribute)) {
          return new CognitoUserAttribute({ Name: attribute, Value: `${attributes[attribute]}` })
        }
        return new CognitoUserAttribute({ Name: `custom:${attribute}`, Value: `${attributes[attribute]}` })
      })

    return cognitoUserAttribute
  }

  signUp (user: IUserCognito, usernameKey: string, validationData: CognitoUserAttribute[] = []): Promise<ISignUpResult> {
    const { password } = user

    const attributeList = AuthCognitoModule.buildCognitoUser(user)

    return new Promise((resolve, reject) => {
      this.userPool.signUp(user[usernameKey], password, attributeList, validationData,  (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })
  }

  confirmRegistration ({ username, code }: { username: string, code: string}): Promise<string> {
    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })
  }

  signIn ({ username, password }: { username: string, password: string }): Promise<ILoginResponse> {
    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    const authenticationDetails = AuthCognitoModule
      .authenticationDetails({
        Username: username,
        Password: password
      })

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          resolve({
            accessToken: result.getAccessToken().getJwtToken(),
            idToken: result.getIdToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
            payload: result.getAccessToken().payload,
            isValid: result.isValid()
          })
        },
        onFailure: function (err) {
          reject(err)
        }
      })
    })
  }

  changePassword ({ username, oldPassword, newPassword }: { username: string, oldPassword: string, newPassword: string}): Promise<"SUCCESS" | Error> {

    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    const authenticationDetails = AuthCognitoModule.authenticationDetails({
      Username: username,
      Password: oldPassword
    })

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function () {
          return cognitoUser.changePassword(
            oldPassword,
            newPassword,
            (err, result) => {
              if (err) reject(err)
              resolve(result)
            })
        },
        onFailure: function (err) {
          reject(err)
        }
      })
    })
  }

  confirmPassword ({ username, code, newPassword }: { username: string, code: string, newPassword: string }): Promise<'Password confirmed!' | Error> {

    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    return new Promise((resolve, reject) => {

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess () {
          resolve('Password confirmed!')
        },
        onFailure (err) {
          reject(err)
        }
      })
    })
  }

  forgotPassword ({ username }:{ username:string }): Promise<any | Error> {

    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: function (data) {
          resolve(data)
        },
        onFailure: function (err) {
          reject(err)
        }
      })
    })
  }

  refreshToken ({ username, refreshTokenUser }: { username: string, refreshTokenUser: string }): Promise<IRefreshTokenResponse | Error> {
    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    const RefreshToken = new CognitoRefreshToken({
      RefreshToken: refreshTokenUser
    })

    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(RefreshToken, (err, result) => {
        if (err) reject(err)
        resolve({
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken()
        })
      })
    })
  }

  resendConfirmationCode ({ username }: { username: string }): Promise<"SUCCESS" | Error> {

    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    return new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })
  }


  changeDefaultPassword({ username, defaultPassword, newPassword }: { username: string, defaultPassword: string, newPassword: string}): Promise<ILoginResponse> {
    const sessionUserAttributes = {
      userAttributes: null
    }

    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    const authenticationDetails = AuthCognitoModule
      .authenticationDetails({
        Username: username,
        Password: defaultPassword
      })

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {},
        onFailure: function (err) {
          console.log("err1", err)
          reject(err)
        },
        newPasswordRequired: function(userAttributes, requiredAttributes) {

          delete userAttributes.email_verified;

          sessionUserAttributes.userAttributes = userAttributes;

          cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
            onSuccess: function (result) {
              resolve({
                accessToken: result.getAccessToken().getJwtToken(),
                idToken: result.getIdToken().getJwtToken(),
                refreshToken: result.getRefreshToken().getToken(),
                payload: result.getAccessToken().payload,
                isValid: result.isValid()
              })
            },
            onFailure: function (err) {
              reject(err)
            },
          })
        }
      })


    })
  }

}

export default AuthCognitoModule
