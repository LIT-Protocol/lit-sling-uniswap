import React from "react";
import { Button, Card, CardContent, CardHeader, Stack, Typography } from "@mui/material";
import truncateAddress from "../functions/truncateAddress";
import { colorArray } from "../assets/colorArray";

function PkpCard({pkp, setSelectedPkp, i}) {
  const backgroundColor = colorArray[i % colorArray.length];

  return (
    <Card sx={{backgroundColor: backgroundColor, color: '#fff'}}>
      <CardContent>
        <Stack spacing={2}>
          <Stack>
            <Typography variant={'body1'}>Address:</Typography>
            <Typography variant={'body1'}>{truncateAddress(pkp.address)}</Typography>
          </Stack>
          <Button variant={'outlined'} onClick={() => setSelectedPkp(pkp)}>Select</Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default PkpCard