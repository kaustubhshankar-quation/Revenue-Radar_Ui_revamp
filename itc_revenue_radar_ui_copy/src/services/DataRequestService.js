import { useDispatch } from 'react-redux';
import getNotification from '../Redux/Action/action';
import HttpService from '../services/HttpService'
import swal from 'sweetalert'

const ApiEnums = {
  masterdata: "/masterdata",
  workflows: "/workflows",
  workflow: "/workflow",
  workflow_form: "/workflow_form",
  wf_combination_report: "/wf_combination_report",
  wf_name_check :'/wf_name_check',
  count_record :'/count_record',
  databaselist : '/databaselist',
  dataingestiondb : '/dataingestiondb',
  getsampledata : '/getsampledata',
  get_orderdetails : '/get_orderdetails',
  upload_exog_files : '/upload_exog_files'
}


async function postRequest(requestObject) {
  try{
    const axiosClient = HttpService.getAxiosClient();
    const responseObject = await axiosClient.post(requestObject?.url, requestObject?.data, requestObject?.config);
    if (responseObject?.status === 200 || responseObject?.status === 201) {
      return responseObject.data;
    }
    else {
      console.log('Error in DataRequestService.postRequest');
      console.log(responseObject)
      return { status : responseObject?.status, output : responseObject };
    }
  }catch(error){
    console.log(error);
    return { status : 'error', 
             output : error.message };
  } 
}

function getRequest(requestObject) {
  const axiosClient = HttpService.getAxiosClient();
  
  let responseObject = axiosClient.get(requestObject.url, requestObject.config)
    .then(response => responseObject = response.data)
    .catch(error => {
      if(error.response.status===401){

       // console.log("Please enter correct credentials!!")
    return error
    
      }
            else{
      console.log('Error in DataRequestService.getRequest');
      console.error(error); 
      return responseObject = 'error'  
            }
      ;
    });

  return responseObject;
}


//setCookie("access_token", "abcdef123456", 7); // Set access_token for 7 days


function setCookie(name, value, days, options = {}) {
  let expires = "";
  if (days) {
      let date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
  }
  let cookieString = name + "=" + (value || "") + expires + "; path=/";
  
  if (options.secure) cookieString += "; Secure";
  if (options.httpOnly) cookieString += "; HttpOnly";  // Note: This won't actually work on client-side JavaScript, only server-side.
  if (options.sameSite) cookieString += "; SameSite=" + options.sameSite;

  document.cookie = cookieString;
}

/*
let token = getCookie("access_token");
console.log(token); // Outputs the stored token value or null if not found

*/
function getCookie(name) {
  let nameEQ = name + "=";
  let cookiesArray = document.cookie.split(';');
  for(let i = 0; i < cookiesArray.length; i++) {
      let cookie = cookiesArray[i];
      while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length); // Remove leading spaces
      if (cookie.indexOf(nameEQ) === 0) {
          return cookie.substring(nameEQ.length, cookie.length);
      }
  }
  return null;
}

/*
Explanation:function deleteCookie(name)
name + "=": Sets the cookie value to an empty string.
expires=Thu, 01 Jan 1970 00:00:00 UTC: Sets the expiration date to a past date, which effectively deletes the cookie.
path=/: Ensures the cookie is deleted for the entire site. This is important because cookies are path-specific, and without this, the cookie might persist on other paths.
*/

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}



export { ApiEnums, postRequest, getRequest,setCookie,getCookie,deleteCookie }