const messages = {
  sys: {
    api: {
      errorTip: "Error",
      apiRequestFailed: "Request error, please try again later",
      apiTimeoutMessage:
        "Interface request timeout, please refresh the page and try again",
      networkExceptionMsg:
        "Network abnormality, please check if your network connection is normal",
      errMsg401:
        "The user does not have permission (token, user name, password error)!",
      errMsg403: "The user is authorized, but access is forbidden!",
      errMsg404: "Network request error, the resource was not found!",
      errMsg405: "Network request error, request method not allowed!",
      errMsg408: "Network request timed out!",
      errMsg500: "Server error, please contact the administrator!",
      errMsg501: "The network is not implemented!",
      errMsg502: "Network Error!",
      errMsg503:
        "The service is unavailable, the server is temporarily overloaded or maintained!",
      errMsg504: "Network timeout!",
      errMsg505: "The http version does not support the request!",
    },
  },
};

export default messages;
