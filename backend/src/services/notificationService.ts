import { fcm } from "./firebase";

export const sendPushNotifications = async (
  tokens: string[],
  title: string,
  body: string,
  data: any,
  thumbnail?: string, 
  url?: string // Optional url parameter
) => {
  const message = {
    notification: {
      title,
      body,
      image: thumbnail,
    },
    data: {
      ...data,
      url,
    },
    tokens,
  };

  try {

    const response = await fcm.sendEachForMulticast(message);
    // const response = await fcm.sendEachForMulticast(message);
    console.log("Successfully sent messages:", response.responses);
  } catch (error : any) {
    console.log("Error sending messages:", error.message);
  }
};

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data: any,
  thumbnail?: string, // Optional thumbnail parameter
  url?: string // Optional url parameter
) => {
  const message = {
    notification: {
      title,
      body,
      image: thumbnail, // Add the thumbnail URL here
    },
    data: {
      ...data,
      url, // Add the custom URL here
    },
    token, // Send notification to a single token
  };

  try {
    const response = await fcm.send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
