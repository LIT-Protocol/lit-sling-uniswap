import PkpCard from "./PkpCard";
import { Card, CardContent, CardHeader, Stack, Typography } from "@mui/material";
import truncateAddress from "../functions/truncateAddress";

function PkpDisplay({pkps, setSelectedPkp, walletAddress}) {
  return (
    <Card className={'center fade-in'}>
      <CardHeader title={`Wallet Address: ${truncateAddress(walletAddress)}`}/>
      <CardContent sx={{display: 'flex', flexDirection: 'column'}}>
        <Stack spacing={2}>
          <Typography variant={'h6'}>Select A PKP</Typography>
          <Stack direction={"row"} spacing={2}>
            {pkps.map((pkp, i) => (
              <PkpCard key={i} i={i} pkp={pkp} setSelectedPkp={setSelectedPkp}/>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default PkpDisplay