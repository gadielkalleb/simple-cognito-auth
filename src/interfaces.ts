export interface CodeDeliveryDetails {
  AttributeName: string
  DeliveryMedium: string
  Destination: string
}

export interface IPoolData {
  UserPoolId: string
  ClientId: string
}

export interface  IAuthenticationData {
  Username: string
  Password: string
}

export interface IAttributes {
  [key: string]: unknown;
}

export interface IUserCognito {
  [key: string]: string;
}

type IForgotPasswordData = CodeDeliveryDetails

export interface IForgotPasswordResponse {
  message: string
  data: IForgotPasswordData
}

export interface IRefreshTokenResponse {
  accessToken: string
  idToken: string
  refreshToken: string
}

// interface IPayload   {
//   sub: string
//   'cognito:groups': string[]
//   event_id: string
//   token_use: string
//   scope: string
//   auth_time: number
//   iss: string
//   exp: number
//   iat: number
//   jti: string
//   client_id: string
//   username: any
// }

export interface ILoginResponse extends IRefreshTokenResponse {
  payload: any
  isValid: boolean
}
