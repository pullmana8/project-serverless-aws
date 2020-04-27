// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'eure6ws4kb'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-r46n29lt.auth0.com',            // Auth0 domain
  clientId: 'zQ4EX5yxCaxLt0eVKw7DcIm5LSsCOOuZ',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
