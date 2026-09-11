import { Notification, Details } from "../Action/action";
import { Store } from 'react-notifications-component';



const showNotification = ({ title, message, type }) => {
    Store.addNotification({
        title: title,
        message: message,
        type: type,
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
            duration: 3000,
            onScreen: true,
            showIcon: true,
            pauseOnHover: true
        }
    })
}


const initialState = {
    planDetails: {}
}

const stateReducer = (state = initialState, action) => {
    switch (action.type) {
        case Details:
            return {
                ...state,
                planDetails: action.payload,
            }
        // break;
        case Notification:
            showNotification(action.payload)
            return state
        // break;
        default:
            return state
    }
}

export default stateReducer;