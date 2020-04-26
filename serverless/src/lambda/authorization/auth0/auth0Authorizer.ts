import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { JwtPayload } from '../token/JwtPayload'
import { Jwt } from '../token/Jwt'
import { verify, decode } from 'jsonwebtoken'
import Axios from 'axios'
import { auth_url } from '../authConfig'
import { createLogger } from '../../../helpers/utils/logger'

const logger = createLogger('auth')

// const jwksUrl = 'https://dev-r46n29lt.auth0.com/.well-known/jwks.json'

export const handler = async (
    event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken)

    try {
        const jwtToken = await verifyToken(event.authorizationToken)
        logger.info('User was authorized', jwtToken)

        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        console.log('User was not authorized', e.message)

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
    const token = getToken(authHeader)
    const jwt: Jwt = decode(token, { complete: true }) as Jwt

    if (!jwt) {
        throw new Error('Invalid token')
    }

    try {
        const response = await Axios.get(auth_url)
        console.log(response)

        var verifiedToken = verify(token, response.data, { algorithms: ['RS256'] })

        console.log('verified token', verifiedToken)
        return verifiedToken as JwtPayload
    } catch (error) {
        console.error(error)
        return undefined
    }
}

function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authorization header')

    if (!authHeader.toLocaleLowerCase().startsWith('bearer '))
        throw new Error('Invalid authorization header')

    const split = authHeader.split(' ')
    const token = split[1]

    return token
}
