import { Card, CardContent, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import React, { useState } from "react";

function PriceCheck() {
  const [ loading, setLoading ] = useState(true);
  const [ jsParams, setJsParams ] = useState('');
  const [ code, setCode ] = useState('');
  const [ output, setOutput ] = useState('');

  function executeAction() {
    setLoading(true);
    setCode('');
    setJsParams('');
  }

  return (
    <div>
      <Card className={'execute-action-creator-form'}>
        <CardContent>
          <Stack spacing={2}>
            <span className={'execute-action-header'}>
              <Typography variant={'body1'}>Execute Action</Typography>
              <LoadingButton disabled={!code} loading={loading} color={'secondary'} variant={'outlined'}
                             onClick={() => executeAction()}>Execute</LoadingButton>
            </span>
            <Stack spacing={2} direction={'row'}>
              <Stack className={'execute-action-js-params'}>
                <Typography variant={'body2'}>JS Params</Typography>
                <textarea className={'execute-action-textarea'} value={jsParams}
                          onChange={(e) => setJsParams(e.target.value)}/>
              </Stack>
              <Stack className={'execute-action-code'}>
                <Typography variant={'body2'}>Code</Typography>
                <textarea className={'execute-action-textarea'} value={code}
                          onChange={(e) => setCode(e.target.value)}/>
              </Stack>
            </Stack>
            <Stack>
              <Typography variant={'body2'}>Output</Typography>
              <textarea className={'execute-action-textarea execute-action-output'} value={output}
                        onChange={(e) => setOutput(e.target.value)}/>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </div>
  )
}

export default PriceCheck;