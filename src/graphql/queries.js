/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getScribeMeeting = /* GraphQL */ `
  query GetScribeMeeting($id: ID!) {
    getScribeMeeting(id: $id) {
      id
      meetingID
      meetingTime
      isParticipant
      username
      code
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listScribeMeetings = /* GraphQL */ `
  query ListScribeMeetings(
    $filter: ModelScribeMeetingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listScribeMeetings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        meetingID
        meetingTime
        isParticipant
        username
        code
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
