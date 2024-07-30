"use client";
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
      router.push('/signIn');
    } else if (role === "seller") {
      window.location.href = "https://grazle-seller-green.vercel.app/";
    }
  };

  return (
    <div>
      <button
        aria-controls="login-menu"
        aria-haspopup="true"
        onClick={handleClick}
        className="bg-[#F70000] py-2 px-6 rounded-md text-white hover:bg-[#F75050] ml-2"
      >
        LOGIN
      </button>
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
