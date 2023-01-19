import React, { useEffect, useState } from "react";
import { Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import LitJsSdk from "lit-js-sdk";
import './ExecuteAction.css';

function ExecuteAction() {
  const [ jsParams, setJsParams ] = useState('{}');
  const [ code, setCode ] = useState('');
  const [ output, setOutput ] = useState('');
  const [ authSig, setAuthSig ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    const authSigHolder = localStorage.getItem('lit-auth-signature');
    if (authSigHolder) {
      console.log('Auth sig found in local storage');
      setAuthSig(JSON.parse(authSigHolder));
      setLoading(false);
    } else {
      console.log('Auth sig not found in local storage');
      logInWithLit();
    }
  }, [])

  const logInWithLit = async () => {
    const currentAuthSig = await LitJsSdk.checkAndSignAuthMessage({chain: 'ethereum', switchChain: false});
    setAuthSig(currentAuthSig);
    setLoading(false);
  }

  const prettifyText = (text) => {
    return JSON.stringify(text, undefined, 4);
  }

  const executeAction = async () => {
    setOutput('');
    let litNodeClient;
    try {
      litNodeClient = new LitJsSdk.LitNodeClient({litNetwork: "serrano", debug: false});
      await litNodeClient.connect();
    } catch (err) {
      console.log('Unable to connect to network', err);
      setOutput('Unable to connect to network' + prettifyText(err));
      return;
    }

    if (!litNodeClient) {
      console.log('LitNodeClient was not instantiated');
      setOutput('LitNodeClient was not instantiated');
      return;
    }

    let executeRes;
    try {
      executeRes = await litNodeClient.executeJs({
        code,
        authSig,
        jsParams: JSON.parse(jsParams),
      });
    } catch (err) {
      console.log('Unable to execute code', err);
      setOutput('Unable to execute code' + prettifyText(err));
      return;
    }

    console.log('executeRes', executeRes);
    setOutput(prettifyText(executeRes.logs));
  }

  if (loading === true) {
    return (
      <div className="App">
        <CircularProgress sx={{position: 'absolute', top: '48%', right: '50%', transform: 'translate(50%,-50%)'}}/>
      </div>
    )
  }

  return (
    <div>
      <Card className={'execute-action-creator-form'}>
        <CardContent>
          <Stack spacing={2}>
            <span className={'execute-action-header'}>
              <Typography variant={'body1'}>Execute Action</Typography>
              <LoadingButton disabled={!code} color={'secondary'} variant={'outlined'}
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

export default ExecuteAction;