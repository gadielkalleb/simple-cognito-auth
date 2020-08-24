import { CognitoUser, CognitoUserPool, AuthenticationDetails, CognitoUserAttribute, ISignUpResult } from 'amazon-cognito-identity-js';
import { IPoolData, IAuthenticationData, IAttributes, IUserCognito, ILoginResponse, IForgotPasswordResponse, IRefreshTokenResponse } from './interfaces';
declare class AuthCognitoModule {
    poolData: IPoolData;
    poolRegion: string;
    userPool: CognitoUserPool;
    constructor(poolData: IPoolData, poolRegion: string);
    static cognitoUser(username: string, pool: CognitoUserPool): CognitoUser;
    static authenticationDetails(authenticationData: IAuthenticationData): AuthenticationDetails;
    static buildCognitoUser(attributes: IAttributes): CognitoUserAttribute[];
    signUp(user: IUserCognito, validationData?: CognitoUserAttribute[]): Promise<ISignUpResult>;
    confirmRegistration({ username, smsCode }: {
        username: string;
        smsCode: string;
    }): Promise<string>;
    signIn({ username, password }: {
        username: string;
        password: string;
    }): Promise<ILoginResponse>;
    changePassword({ username, oldPassword, newPassword }: {
        username: string;
        oldPassword: string;
        newPassword: string;
    }): Promise<"SUCCESS" | Error>;
    confirmPassword({ username, smsCode, newPassword }: {
        username: string;
        smsCode: string;
        newPassword: string;
    }): Promise<'Password confirmed!' | Error>;
    forgotPassword({ username }: {
        username: string;
    }): Promise<IForgotPasswordResponse | Error>;
    refreshToken({ username, refreshTokenUser }: {
        username: string;
        refreshTokenUser: string;
    }): Promise<IRefreshTokenResponse | Error>;
    resendConfirmationCode({ username }: {
        username: string;
    }): Promise<"SUCCESS" | Error>;
}
export default AuthCognitoModule;
//# sourceMappingURL=AuhtCognitoModule.d.ts.map