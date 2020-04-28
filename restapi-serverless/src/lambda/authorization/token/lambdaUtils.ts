// import { APIGatewayProxyEvent } from 'aws-lambda'
// import { parseUserId } from '../tokenUtils'
import { JwtPayload } from "./JwtPayload";
import { decode } from 'jsonwebtoken';

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

/* export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
} */

export function parseAuthorizationHeader(authorization: string): string {
  const split = authorization.split(' ')
  const jwtToken = split[1]
  return jwtToken
}