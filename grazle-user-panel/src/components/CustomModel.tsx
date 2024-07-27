import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  // width: 400,
  border: "3px solid white",
  bgcolor: "background.paper",
  borderRadius: "44px!important",
  boxShadow: 24,
};

interface Props {
  showModal: any;
  children: any;
}

export default function CustomModal(props: Partial<Props>) {
  const { showModal, children } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <Modal
        style={{ border: "none", outline: "none" }}
        open={showModal}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>{children}</Box>
      </Modal>
    </div>
  );
}
