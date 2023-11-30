/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createScribeMeeting = /* GraphQL */ `
  mutation CreateScribeMeeting(
    $input: CreateScribeMeetingInput!
    $condition: ModelScribeMeetingConditionInput
  ) {
    createScribeMeeting(input: $input, condition: $condition) {
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
export const updateScribeMeeting = /* GraphQL */ `
  mutation UpdateScribeMeeting(
    $input: UpdateScribeMeetingInput!
    $condition: ModelScribeMeetingConditionInput
  ) {
    updateScribeMeeting(input: $input, condition: $condition) {
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
export const deleteScribeMeeting = /* GraphQL */ `
  mutation DeleteScribeMeeting(
    $input: DeleteScribeMeetingInput!
    $condition: ModelScribeMeetingConditionInput
  ) {
    deleteScribeMeeting(input: $input, condition: $condition) {
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
