import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  AdminAddUserToGroupCommand,
  AdminGetUserCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const region = process.env.COGNITO_REGION || 'eu-west-2';
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

const client = new CognitoIdentityProviderClient({ region });

export async function signUp({ email, password, firstName, lastName, phone }) {
  const command = new SignUpCommand({
    ClientId: clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'given_name', Value: firstName },
      { Name: 'family_name', Value: lastName },
      { Name: 'phone_number', Value: phone },
    ],
  });
  return client.send(command);
}

export async function confirmSignUp({ email, code }) {
  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    Username: email,
    ConfirmationCode: code,
  });
  return client.send(command);
}

export async function login({ email, password }) {
  const command = new InitiateAuthCommand({
    ClientId: clientId,
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });
  return client.send(command);
}

export async function refreshToken({ refreshToken: token }) {
  const command = new InitiateAuthCommand({
    ClientId: clientId,
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    AuthParameters: {
      REFRESH_TOKEN: token,
    },
  });
  return client.send(command);
}

export async function addUserToGroup({ email, groupName }) {
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: userPoolId,
    Username: email,
    GroupName: groupName,
  });
  return client.send(command);
}

export async function getUser({ email }) {
  const command = new AdminGetUserCommand({
    UserPoolId: userPoolId,
    Username: email,
  });
  return client.send(command);
}

export async function forgotPassword({ email }) {
  const command = new ForgotPasswordCommand({
    ClientId: clientId,
    Username: email,
  });
  return client.send(command);
}

export async function confirmForgotPassword({ email, code, newPassword }) {
  const command = new ConfirmForgotPasswordCommand({
    ClientId: clientId,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  });
  return client.send(command);
}

export { userPoolId, clientId, region };
