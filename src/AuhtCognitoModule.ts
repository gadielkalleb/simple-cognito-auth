import { CognitoUser,  CognitoUserPool, AuthenticationDetails, CognitoUserAttribute, CognitoRefreshToken, ISignUpResult } from 'amazon-cognito-identity-js'
import { IPoolData, IAuthenticationData, IAttributes, IUserCognito, ILoginResponse, IForgotPasswordResponse, IRefreshTokenResponse } from './interfaces'
import cognitoAttributes from './cognitoAttributtes'


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

  signUp (user: IUserCognito, validationData: CognitoUserAttribute[] = []): Promise<ISignUpResult> {
    const { username, password } = user

    const attributeList = AuthCognitoModule.buildCognitoUser(user)

    return new Promise((resolve, reject) => {
      this.userPool.signUp(username, password, attributeList, validationData,  (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })
  }

  confirmRegistration ({ username, smsCode }: { username: string, smsCode: string}): Promise<string> {
    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(smsCode, true, (err, result) => {
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

  confirmPassword ({ username, smsCode, newPassword }: { username: string, smsCode: string, newPassword: string }): Promise<'Password confirmed!' | Error> {

    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    return new Promise((resolve, reject) => {

      cognitoUser.confirmPassword(smsCode, newPassword, {
        onSuccess () {
          resolve('Password confirmed!')
        },
        onFailure (err) {
          reject(err)
        }
      })
    })
  }

  forgotPassword ({ username }:{ username:string}): Promise<IForgotPasswordResponse | Error> {

    const cognitoUser = AuthCognitoModule.cognitoUser(username, this.userPool)

    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: function (data) {
          resolve({ data, message: 'CodeDeliveryData from forgotPassword' })
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

}

export default AuthCognitoModule
