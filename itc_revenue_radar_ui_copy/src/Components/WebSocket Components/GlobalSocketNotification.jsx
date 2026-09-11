import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import getNotification from "../../Redux/Action/action.js";
import UserService from "../../services/UserService.js";
import { toast } from "react-toastify";

const GlobalNotificationSocket = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const buildWsUrl = (baseUrl, username) => {
      if (!baseUrl) {
        throw new Error("REACT_APP_UPLOAD_DATA is not defined");
      }

      const wsUrl = baseUrl
        .replace(/^http:\/\//i, "ws://")
        .replace(/^https:\/\//i, "wss://");

      return `${wsUrl}/app/ws/notifications/${encodeURIComponent(username)}`;
    };

    const clearTimers = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };

    const showNotification = (message, type = "default") => {
      dispatch(
        getNotification({
          message,
          type,
        })
      );
    };

    const connectSocket = () => {
      const username = UserService.getUsername();

      if (!username) {
        console.warn("No username found. WebSocket not connected.");
        return;
      }

      let socket;

      try {
        const wsUrl = buildWsUrl(process.env.REACT_APP_UPLOAD_DATA, username);
        socket = new WebSocket(wsUrl);
      } catch (error) {
        console.error("Failed to build WebSocket URL:", error);
        return;
      }

      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Notification WebSocket connected");

        socket.send(
          JSON.stringify({
            event: "INIT",
            message: "Client connected",
            username,
          })
        );

        heartbeatTimerRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                event: "PING",
                timestamp: new Date().toISOString(),
              })
            );
          }
        }, 30000);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          switch (data?.event) {
            case "CONNECTED":
              console.log("Socket connected for notifications");
              break;

            case "REPORT_IN_PROGRESS":
              showNotification(
                data?.message || "A report is currently in progress.",
                data?.type || "default"
              );
              break;

            case "REPORT_STARTED":
              showNotification(
                data?.message || "Report generation has started.",
                data?.type || "default"
              );
              break;

            case "REPORT_DONE":
              toast.success(`${data?.message} Go to Save Report to access` || "Your report is ready.", {
                autoClose: false, // 🔥 sticky
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
              });

              // optional: if you want to auto-open the report
              // if (data?.report_url) {
              //   window.open(data.report_url, "_blank");
              // }
              break;

            case "REPORT_FAILED":
              showNotification(
                data?.message || "Report generation failed.",
                data?.type || "danger"
              );
              break;

            default:
              if (data?.message) {
                showNotification(data.message, data.type || "default");
              }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = (event) => {
        console.warn("WebSocket disconnected", event.code, event.reason);
        clearTimers();

        if (isMounted) {
          reconnectTimerRef.current = setTimeout(() => {
            connectSocket();
          }, 3000);
        }
      };
    };

    connectSocket();

    return () => {
      isMounted = false;
      clearTimers();

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [dispatch]);

  return null;
};

export default GlobalNotificationSocket;