import 'source-map-support/register'
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../authorization/authToken/JwtPayload'
import { createLogger } from '../../helpers/utils/logger'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJfWOD1NCGFHHsMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1yNDZuMjlsdC5hdXRoMC5jb20wHhcNMjAwNDA3MTYwNTEwWhcNMzMx
MjE1MTYwNTEwWjAhMR8wHQYDVQQDExZkZXYtcjQ2bjI5bHQuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1splDUjDuVCPDh19wI1yv6Ns
fyuMUr8qknEeceoFsOWSjZ4zoze2XVG+r7kOs6Cf477pfRHhU6mcJfZiXmFVh4xs
dhYFYcPf59/o5WX5kTOJutbnINxGh0BqU/H2om2TLY3xBep1kJkQ319bN+JRcas4
ZtuEo2XlqSLLR7wHKSlPjFapHxZ328l0877IsDxzDcGrbIkT2BGooYpPRyqnljkP
Cfhf6etrVSpIzIaQXWtvddfY8xYJyi1uOtdQt8X84ov63mnyKQkDbtAulALwG9TZ
5PB9d3LUOGmUS+Q+4H031FnNTsLIs6oaV+aGrEWtjNh7CrfLNORWs8R4h5Dr6QID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS1uyQSrg/GB1ecsLPG
JZTYmGb6uDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAAopO5zp
Cc7AsGyEgNvck6NbpRu4dNANgq98bxobt7CEB/IBVstWMvJRMqMwqOYzWLTiUWcx
Hvb2bje9trMIvoAOYge2LH77373LfmLRhNgqQOUvuOfbcjJqzbarm7UqV7HaAxgU
R2qv95iN0ZxiSvDTMdM3vcbMw5oUCYzWQLyLc6po0ppb8GcLYAg8DiVE7mXSTfRG
n8ut3kEdCCqG5hRfh3vxo725HBRi2bMRoCqJEF9UoxQDSDe8kyfEEAjQjVGMriMy
OSEM1xbWHrdR6VqQBNMVNsv7v3STSWfR2iAIFXA8kbQxN35hckPV623sqp1GRc1w
2J6lf7HtAB10cUg=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken)

    try {
      const JwtPayload = await verifyToken(event.authorizationToken);
      logger.info('User was authorized', JwtPayload)

      return {
        principalId: JwtPayload.sub,
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Allow",
              Resource: "*",
            },
          ],
        },
      };
    } catch (e) {
      console.log("User was not authorized", e.message);

      return {
        principalId: "user",
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Deny",
              Resource: "*",
            },
          ],
        },
      };
    }
  }

  function verifyToken(authHeader: string): JwtPayload {
      if (!authHeader)
        throw new Error('No authentication header')
    if (!authHeader.toLowerCase().startsWith('bearer '))

    throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return verify(token, cert, { algorithms: ['RS256']}) as JwtPayload
  }