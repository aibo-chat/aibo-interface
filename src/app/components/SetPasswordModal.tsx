import { observer } from 'mobx-react-lite'
import React, { useCallback, useRef, useState } from 'react'
import { FormControl, InputLabel, InputAdornment, IconButton, OutlinedInput, Box, Fade, Modal, Button, CircularProgress } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useMobxStore } from '../../stores/StoreProvider'
import { decryptPrivateKeyWithPassword } from '../../util/encryptUtils'

const SetPasswordModal: React.FC<any> = () => {
  const {
    appStore: { userAccount, setPasswordModalOpen, onPasswordModalConfirm, changeSetPasswordModalOpen, changeOnPasswordModalConfirm },
  } = useMobxStore()
  const [showPassword, setShowPassword] = React.useState(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }
  const inputRef = useRef<HTMLInputElement>()
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const onConfirmButtonClick = useCallback(async () => {
    if (!userAccount?.privateKey) {
      return setErrorMsg("Your don't have a password.")
    }
    if (inputRef.current && onPasswordModalConfirm) {
      const password = inputRef.current.value
      try {
        setLoading(true)
        const encryptedPrivateKey = userAccount.privateKey
        const decryptedPrivateKey = await decryptPrivateKeyWithPassword(encryptedPrivateKey, password)
        await onPasswordModalConfirm(decryptedPrivateKey)
        changeSetPasswordModalOpen(false)
      } catch (error) {
        if ((error as any).message === 'unable to decrypt data') {
          setErrorMsg('Your password is wrong.')
        }
        console.error(error)
      }
      setLoading(false)
    }
  }, [onPasswordModalConfirm])

  const handleClose = () => {
    changeSetPasswordModalOpen(false)
    changeOnPasswordModalConfirm(null)
  }
  return (
    <Modal className="set-password-modal" open={setPasswordModalOpen} onClose={handleClose} closeAfterTransition>
      <Fade in={setPasswordModalOpen}>
        <Box
          sx={{
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            borderRadius: '16px',
            overflow: 'hidden',
            padding: '32px',
          }}
        >
          <Box sx={{ 'text-align': 'center' }}>
            Please enter your password to
            <br /> decrypt DEFE Chat
          </Box>
          <Box sx={{ marginTop: 4, marginBottom: 2 }}>
            <FormControl variant="outlined" size="small" focused>
              <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                inputRef={inputRef}
                error={Boolean(errorMsg)}
                onChange={() => {
                  setErrorMsg('')
                }}
                type={showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
          </Box>
          {errorMsg ? (
            <Box
              sx={{
                color: 'red',
                fontSize: '14px',
              }}
            >
              {errorMsg}
            </Box>
          ) : null}
          <Box>
            <Button sx={{ width: 230, borderRadius: 20, textTransform: 'none' }} size="small" variant="contained" onClick={onConfirmButtonClick}>
              {loading ? <CircularProgress /> : 'Confirm'}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}
export default observer(SetPasswordModal)
