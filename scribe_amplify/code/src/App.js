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
      email: user["signInDetails"]["loginId"],
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
