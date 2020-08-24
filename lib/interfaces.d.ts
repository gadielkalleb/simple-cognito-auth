export interface CodeDeliveryDetails {
    AttributeName: string;
    DeliveryMedium: string;
    Destination: string;
}
export interface IPoolData {
    UserPoolId: string;
    ClientId: string;
}
export interface IAuthenticationData {
    Username: string;
    Password: string;
}
export interface IAttributes {
    [key: string]: unknown;
}
export interface IUserCognito {
    [key: string]: string;
}
declare type IForgotPasswordData = CodeDeliveryDetails;
export interface IForgotPasswordResponse {
    message: string;
    data: IForgotPasswordData;
}
export interface IRefreshTokenResponse {
    accessToken: string;
    idToken: string;
    refreshToken: string;
}
export interface ILoginResponse extends IRefreshTokenResponse {
    [key: string]: unknown;
    isValid: boolean;
}
export {};
//# sourceMappingURL=interfaces.d.ts.map