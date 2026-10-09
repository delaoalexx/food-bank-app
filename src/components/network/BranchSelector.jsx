import React from "react";
import { FormControl, Select, MenuItem } from "@mui/material";

const BranchSelector = ({ branches, selectedBranch, onChange }) => {
  return (
    <FormControl
      sx={{
        minWidth: 180,
      }}
    >
      <Select
        value={selectedBranch}
        onChange={onChange}
        displayEmpty
        sx={{
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
          fontSize: "14px",
          fontWeight: 600,
          color: "#171717",
          boxSizing: "border-box",

          "& .MuiSelect-select": {
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 2.5,
            paddingRight: "36px !important",
            display: "flex",
            alignItems: "center",
            lineHeight: 1.75,
          },

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E7E5E4",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D6D3D1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#029739",
          },
        }}
      >
        {branches.map((branch) => (
          <MenuItem
            key={branch.id}
            value={branch.id}
            sx={{
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {branch.branchName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default React.memo(BranchSelector);
