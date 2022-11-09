import crypto from 'crypto'
import CognitoHelper from '../helpers/cognito';

export default class Cognito {
    private cognitoIdentity;

    constructor() {
        this.cognitoIdentity = new CognitoHelper();
        this.cognitoIdentity.initAWS();
    }

    public async signUpUser(email: string, password: string, userAttr: Array<any>, agent: string = 'none'): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cognitoIdentity.setCognitoAttributeList(email, agent);
            this.cognitoIdentity.getUserPool.signUp(email, password, this.cognitoIdentity.getCognitoAttributeList(), null, function (err, result) {
                if (err) {
                    return reject(err);
                }
                return resolve({
                    username: result.user.username,
                    userConfirmed: result.userConfirmed,
                    userAgent: result.user.client.userAgent,
                });
            });
        })

    }

    public async signInUser(email: string, password: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cognitoIdentity.getCognitoUser(email).authenticateUser(this.cognitoIdentity.getAuthDetails(email, password), {
                onSuccess: (result) => {
                    const token = {
                        accessToken: result.getAccessToken().getJwtToken(),
                        idToken: result.getIdToken().getJwtToken(),
                        refreshToken: result.getRefreshToken().getToken(),
                    }
                    return resolve(this.cognitoIdentity.decodeJWTToken(token))
                },

                onFailure: (err) => {
                    return reject(err);
                },
            });
        });
    }

    public async confirmSignUp(email: string, code: string): Promise<any> {
      return new Promise((resolve, reject) => {
        this.cognitoIdentity.getCognitoUser(email).confirmRegistration(code, true, (err, result) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        });
      });
    }

    public async forgotPassword(email): Promise<boolean> {
        return new Promise( (resolve, reject) => {
            this.cognitoIdentity.getCognitoUser(email).forgotPassword({
                onSuccess: (result) => {
                    console.log(result);
                    return resolve(result)
                },

                onFailure: (err) => {
                    return reject(err);
                },
            });
        })
    }

    public async confirmNewPassword(email: string, password: string, code: string): Promise<boolean> {
        return new Promise( (resolve, reject) => {
            this.cognitoIdentity.getCognitoUser(email).confirmPassword(code, password, {
                onSuccess: (result) => {
                    return resolve(result)
                },
                onFailure: (err) => {
                    return reject(err);
                },
            });
        })
    }

}
