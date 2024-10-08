import { gql } from "graphql-tag";

export const exchangeSpotifyCodeForToken = gql`
    mutation ExchangeSpotifyCodeForToken($code: String, $refreshToken: String) {
        exchangeSpotifyCodeForToken(code: $code, refreshToken: $refreshToken) {
            accessToken
            refreshToken
            expiresIn
            tokenType
            error
        }
    }
`;

export const addSnsEndpoint = gql`
  mutation addSnsEndpoint($deviceToken: String!) {
    addSnsEndpoint(deviceToken: $deviceToken)
  }
`;