export const Notification = "Notification";

const getNotification = (value) => {
  return {
    type: Notification,
    payload: value,
  };
};

export default getNotification;
