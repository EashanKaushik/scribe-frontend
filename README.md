# Setup Frontend using AWS Amplify

## Pre-requisites

### Step 1: AWS Cloud9 Environment
Create an AWS Cloud9 Environment, use the following configurations:


> *Instance type*: t3.small (2 GiB RAM + 2 vCPU) <br>
> *Platform:* Amazon Linux 2 <br>


### Create a new IAM User

1. Create IAM User, you can follow instruction [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html).
2. Atttach AWS Managed ***AdministratorAccess-Amplify*** policy to the user.
3. Create Access Keys for Command Line Interface (CLI), you can follow instructions [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey).

## Creat React App

Open Cloud9 environment, and run the following commands in the terminal:

```
mkdir scribebot-amplify

cd scribebot-amplify

npx create-react-app . -y
```

## Configure AWS Amplify CLI

### Step 1: Install Amplify CLI

Install the following packages:

```
npm install -g @aws-amplify/cli
curl -sL https://aws-amplify.github.io/amplify-cli/install | bash && $SHELL
npm install aws-amplify @aws-amplify/ui-react
```

### Step 2: Initialize Amplify App

To add initialize Amplify App, run the following command:

```
amplify init
```

Answer the following questions

> Enter a name for the project: **<appname>** <br>
> Initialize the project with the above configuration?: **yes** <br>
> Select the authentication method you want to use: **AWS access keys** <br>
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;accessKeyId:  ******************** <br>
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;secretAccessKey:  **************************************** <br>
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;region:  **<region>** <br>

## Add Authentication

1. To add a Cognito Authenticaion, we can use the following command:

```
amplify add auth
```
Answer the following questions

> Do you want to use the default authentication and security configuration?: **Default configuration** <br>
> How do you want users to be able to sign in?: **Username** <br>
> Do you want to configure advanced settings?: **No, I am done.** <br>

2. Add to **src/index.js** the following lines:

```
/* Add to imports */
import { Amplify } from 'aws-amplify';
import config from './aws-exports';


/* Add after all imports */
Amplify.configure(config);
```

## Add API - GraphQL

1. To add a GraphQl API, we can use the following command:

```amplify add api ```

Answer the following questions

> Select from one of the below mentioned services: **GraphQL** <br>
> Here is the GraphQL API that we will create. Select a setting to edit or continue Authorization modes: **API key (default, expiration time: 7 days from now)** <br>
> Choose the default authorization type for the API: **Amazon Cognito User Pool** <br>
> Configure additional auth types?: **No** <br>
> Here is the GraphQL API that we will create. Select a setting to edit or continue: **Continue** <br>
> Choose a schema template: **Single object with fields (e.g., “Todo” with ID, name, description)** <br>
> Do you want to edit the schema now? (Y/n): **n** <br>

2. Replace contents of **amplify/backend/api/scribeamplify/schema.graphql** with: 

```
type ScribeMeeting @model @auth(rules: [ { allow: public } ] ){
  id: ID!
  meetingID: String!
  meetingTime: AWSDateTime!
  isParticipant: Boolean!
  username: String!
  code: String!
}
```

## Replace src/App.js code

Replace contents of **src/App.js** with: 

```
import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { Amplify} from "aws-amplify";
import { generateClient } from 'aws-amplify/api';
import config from './amplifyconfiguration.json';
import{
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
  CheckboxField
} from "@aws-amplify/ui-react";
import { listScribeMeetings } from "./graphql/queries";
import {
  createScribeMeeting as createScribeMeetingMutation,
  deleteScribeMeeting as deleteScribeMeetingMutation,
} from "./graphql/mutations";
Amplify.configure(config);
const client = generateClient();
const App = ({ signOut, user }) => {
  const [Meetings, setMeetings] = useState([]);
  // State to track the value of the datetime-local input
  const [meetingTime, setMeetingTime] = useState('');
  useEffect(() => {
    fetchMeetings();
  }, []);
  const handleMeetingTimeChange = (event) => {
    const selectedTime = event.target.value;
    const isoTime = new Date(selectedTime).toISOString();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Check if the selected time is in the future
    // Get the current date and time
    var currentTime = new Date();
    // Add 15 minutes to the current time
    currentTime.setMinutes(currentTime.getMinutes() + 5);
    // Format the result as a string in the 'YYYY-MM-DDTHH:mm' format
    currentTime = currentTime.toISOString().slice(0, 16);
    currentTime.toLocaleString('en-US', { timeZone: timezone });
    if (isoTime > currentTime) {
      setMeetingTime(selectedTime);
    } else {
      // Optionally, you can provide feedback to the user about selecting a future date/time
      alert('Meeting time should be 5 mins from now!');
      // You can choose to clear the input or handle it in another way based on your requirements
      setMeetingTime('');
    }
  };
  async function fetchMeetings() {
    const apiData = await client.graphql({ query: listScribeMeetings
});
    const MeetingsFromAPI = apiData.data.listScribeMeetings.items;
    setMeetings(MeetingsFromAPI);
  }
  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }
  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    var isParticipant = null;
    if(form.get("isParticipant") === null){
      isParticipant = false;
    } else {
      isParticipant = true;
    };
    const data = {
      id: String(form.get("meetingID")).concat('-', String(form.get("meetingtime"))),
      meetingID: form.get("meetingID"),
      meetingTime: new Date(form.get("meetingtime")),
      isParticipant: isParticipant,
      username: user["signInDetails"]["loginId"],
      code: generateRandomString(6)
    };
    await client.graphql({
      query: createScribeMeetingMutation,
      variables: { input: data },
    });
    fetchMeetings();
    setMeetingTime('');
    event.target.reset();
  }
  async function deleteNote({ id }) {
    const newMeetings = Meetings.filter((note) => note.id !== id);
    setMeetings(newMeetings);
    await client.graphql({
      query: deleteScribeMeetingMutation,
      variables: { input: { id } },
    });
  }
  return (
    <View className="App">
      <Heading level={1}>Scribe Meeting</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="meetingID"
            placeholder="MeetingID"
            label="MeetingID"
            labelHidden
            variation="quiet"
            required
          />
          <CheckboxField
            name="isParticipant"
            placeholder="Annoymize"
            label="Anonymize"
            type="checkbox"  // Assuming this is a checkbox for a boolean
field
          />
          <TextField
            name="meetingtime"
            placeholder="meetingtime"
            label="meetingtime"
            labelHidden
            variation="quiet"
            type="datetime-local"  // Assuming this is an input for a
timestamp field
            onChange={handleMeetingTimeChange}
            value={meetingTime}
            required
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
      <View margin="3rem 0">
        <Heading level={2}>Future Meetings</Heading>
        {Meetings.filter((note) => new Date(note.meetingTime) > new Date())
          .sort((a, b) => new Date(a.meetingTime) - new Date(b.meetingTime))
          .map((note) => (
          <Flex
            key={note.meetingID}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              Meeting ID: {note.meetingID}
            </Text>
            <Text as="strong" fontWeight={700}>
              Security code: {note.code}
            </Text>
            <Text as="span">Meeting Time: {new Date(note.meetingTime).toLocaleString()}</Text>
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <View margin="3rem 0">
        <Heading level={2}>Past Meetings</Heading>
        {Meetings.filter((note) => new Date(note.meetingTime) <= new Date())
          .sort((a, b) => new Date(b.meetingTime) - new Date(a.meetingTime))
          .map((note) => (
          <Flex
            key={note.meetingID}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              Meeting ID: {note.meetingID}
            </Text>
            <Text as="strong" fontWeight={700}>
              Security code: {note.code}
            </Text>
            <Text as="span">Meeting Time: {new Date(note.meetingTime).toLocaleString()}</Text>
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};
export default withAuthenticator(App, {
 hideSignUp: "true"
});

```
## Add Hosting

Run the following command: 

```
amplify add hosting
```

Answer the following questions

> Select the plugin module to execute: **Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)** <br>
> Choose a type: **Manual deployment** <br>

## Deploy Web Application

Run the following command: 

```amplify publish```

Answer the following questions

> Are you sure you want to continue? (Y/n): **yes** <br>
> Enter a description for the API key: <br>
> After how many days from now the API key should expire (1-365): **365** <br>
> Do you want to generate code for your newly created GraphQL API: **Yes** <br>
> Choose the code generation language target: **javascript** <br>
> Enter the file name pattern of graphql queries, mutations and subscriptions src/graphql/**/*.js <br>
> Do you want to generate/update all possible GraphQL operations - queries, mutations and subscriptions: **Yes** <br>
> Enter maximum statement depth [increase from default if your schema is deeply nested]: **2** <br>


