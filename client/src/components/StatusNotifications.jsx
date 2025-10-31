// @ts-nocheck
import { useContext, useState } from "react";
import NotificationContext from "../providers/NotificationProvider";
import { IconButton, Snackbar } from "@mui/joy";
import { CloseRounded, ErrorRounded, InfoRounded } from "@mui/icons-material";

function StatefulSnackbar({ notification }) {
  const [open, setOpen] = useState(true);
  const { removeNotification } = useContext(NotificationContext);

  let color = "neutral";
  if (notification.status == "error") color = "danger";
  if (notification.status == "success") color = "success";

  return (
    <Snackbar
      variant="soft"
      color={color}
      open={open}
      autoHideDuration={5000}
      onClose={(_, reason) => {
        if (reason === "clickaway") return;
        setOpen(false);
        removeNotification(notification.id);
      }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      startDecorator={
        notification.status == "error" ? <ErrorRounded /> : <InfoRounded />
      }
      endDecorator={
        <IconButton
          onClick={() => {
            setOpen(false);
            removeNotification(notification.id);
          }}
          size="sm"
          variant="soft"
          color={color}
        >
          <CloseRounded />
        </IconButton>
      }
    >
      {notification.message}
    </Snackbar>
  );
}

const StatusNotifications = function () {
  const { notifications } = useContext(NotificationContext);
  return (
    <>
      {notifications.map((el, index) => {
        return <StatefulSnackbar notification={el} key={index} />;
      })}
    </>
  );
};

export default StatusNotifications;
