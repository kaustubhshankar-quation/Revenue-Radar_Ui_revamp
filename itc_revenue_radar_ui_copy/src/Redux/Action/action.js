export const Notification = "Notification"
export const Details = "Details"


 const getNotification = (value) => {
    return {
        type: Notification,
        payload: value
    }
}
export const getUserDetails = (value) => {
    return {
        type: Details,
        payload: value
    }
}

export default getNotification;



