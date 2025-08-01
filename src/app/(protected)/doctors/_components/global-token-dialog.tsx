"use client";

import { useTokenDialog } from "./token-dialog-context";
import { TokenDisplayDialog } from "./token-display-dialog";

export function GlobalTokenDialog() {
  const { tokenData, hideTokenDialog } = useTokenDialog();

  console.log("🎯 GlobalTokenDialog render - tokenData:", tokenData);

  if (!tokenData) {
    console.log("🎯 GlobalTokenDialog - no tokenData, returning null");
    return null;
  }

  console.log("🎯 GlobalTokenDialog - rendering TokenDisplayDialog with:", tokenData);

  return (
    <TokenDisplayDialog
      open={!!tokenData}
      onClose={hideTokenDialog}
      inviteLink={tokenData.inviteLink}
      doctorName={tokenData.doctorName}
      doctorEmail={tokenData.doctorEmail}
    />
  );
}
