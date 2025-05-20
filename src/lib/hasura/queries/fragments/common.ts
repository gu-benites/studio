import { gql } from 'graphql-request';

export const TIMESTAMPS_FRAGMENT = gql`
  fragment Timestamps on timestamptz {
    created_at
    updated_at
  }
`;

export const PAGE_INFO_FRAGMENT = gql`
  fragment PageInfo on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

export const PAGINATION_FRAGMENT = gql`
  fragment Pagination on PageInfo {
    ...PageInfo
  }
  ${PAGE_INFO_FRAGMENT}
`;

export const ERROR_FRAGMENT = gql`
  fragment Error on Error {
    message
    code
    path
  }
`;
