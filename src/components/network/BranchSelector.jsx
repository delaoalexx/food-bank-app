import React from "react";

import { FormControl, Select, MenuItem } from "@mui/material";

const BranchSelector = ({ branches, selectedBranch, onChange }) => {
  return (
    <FormControl
      sx={{
        minWidth: 220,
      }}
    >
      <Select
        value={selectedBranch}
        onChange={onChange}
        displayEmpty
        sx={{
          borderRadius: "14px",
          backgroundColor: "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E7E5E4",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D6D3D1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#16A34A",
          },
        }}
      >
        {branches.map((branch) => (
          <MenuItem key={branch.id} value={branch.id}>
            {branch.branchName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default React.memo(BranchSelector);
