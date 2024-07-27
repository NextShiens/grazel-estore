import React, { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";

const LoginDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLoginAs = (role: any) => {
    handleClose();
    if (role === "user") {
      router.push("/signIn"); // Replace with your actual login route
    } else if (role === "seller") {
      window.location.href = "https://grazle-seller-green.vercel.app/"; // Replace with your actual login route
    }
  };

  return (
    <div>
      <Button
        aria-controls="login-menu"
        aria-haspopup="true"
        onClick={handleClick}
        variant="contained"
        className="bg-[#F70000] py-2 px-6 rounded-md text-white hover:bg-[#F75050] ml-2"
      >
        Login
      </Button>
      <Menu
        id="login-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className=""
      >
        <MenuItem className="px-3" onClick={() => handleLoginAs("user")}>
          Login as User
        </MenuItem>
        <MenuItem className="px-3" onClick={() => handleLoginAs("seller")}>
          Login as Seller
        </MenuItem>
      </Menu>
    </div>
  );
};

export default LoginDropdown;
