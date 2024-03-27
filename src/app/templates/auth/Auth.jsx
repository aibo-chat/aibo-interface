import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import './Auth.scss'
import ReCAPTCHA from 'react-google-recaptcha'
import { gsap } from 'gsap'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { observer } from 'mobx-react-lite'
import { Box, ButtonBase, Button as MUIButton } from '@mui/material'
import { useIsomorphicLayoutEffect } from 'ahooks'
import lottie from 'lottie-web'
import * as auth from '../../../client/action/auth'
import cons from '../../../client/state/cons'
import { Debounce, getUrlPrams } from '../../../util/common'
import { getBaseUrl } from '../../../util/matrixUtil'
import Text from '../../atoms/text/Text'
import Button from '../../atoms/button/Button'
import IconButton from '../../atoms/button/IconButton'
import AuthInputUserIcon from '../../../../public/res/svg/auth/auth_input_user.svg?react'
import AuthInputPasswordIcon from '../../../../public/res/svg/auth/auth_input_password.svg?react'
import AuthSSOOrLineLeft from '../../../../public/res/svg/auth/auto_sso_or_line_left.svg?react'
import AuthSSOOrLineRight from '../../../../public/res/svg/auth/auto_sso_or_line_right.svg?react'
import Spinner from '../../atoms/spinner/Spinner'
import ScrollView from '../../atoms/scroll/ScrollView'
import ContextMenu, { MenuItem, MenuHeader } from '../../atoms/context-menu/ContextMenu'
import ChevronBottomIC from '../../../../public/res/ic/outlined/chevron-bottom.svg'
import SSOButtons from '../../molecules/sso-buttons/SSOButtons'
import { MatrixHomeServer } from '../../../constant'
import authImageMap from '../../../images/authImageMap'
import { AuthInput } from './Components'
import AiboJSON from '../../../../public/res/json/aibo.json'

const LOCALPART_SIGNUP_REGEX = /^[a-z0-9_\-.=/]+$/
const BAD_LOCALPART_ERROR = "Username can only contain characters a-z, 0-9, or '=_-./'"
const USER_ID_TOO_LONG_ERROR = "Your user ID, including the hostname, can't be more than 255 characters long."

const PASSWORD_STRENGHT_REGEX = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])([^\s]){8,127}$/
const BAD_PASSWORD_ERROR = 'Password must contain at least 1 lowercase, 1 uppercase, 1 number, 8-127 characters with no space.'
const CONFIRM_PASSWORD_ERROR = "Passwords don't match."

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const BAD_EMAIL_ERROR = 'Invalid email address'

function isValidInput(value, regex) {
  if (typeof regex === 'string') return regex === value
  return regex.test(value)
}
function normalizeUsername(rawUsername) {
  const noLeadingAt = rawUsername.indexOf('@') === 0 ? rawUsername.substr(1) : rawUsername
  return noLeadingAt.trim()
}

let searchingHs = null
function HomeServer({ onChange }) {
  const [hs, setHs] = useState(null)
  const [debounce] = useState(new Debounce())
  const [process, setProcess] = useState({ isLoading: true, message: 'Loading homeserver list...' })
  const hsRef = useRef()

  const setupHsConfig = async (servername) => {
    setProcess({ isLoading: true, message: 'Looking for homeserver...' })
    let baseUrl = null
    baseUrl = await getBaseUrl(servername)

    if (searchingHs !== servername) return
    setProcess({ isLoading: true, message: `Connecting to ${baseUrl}...` })
    const tempClient = auth.createTemporaryClient(baseUrl)

    Promise.allSettled([tempClient.loginFlows(), tempClient.register()])
      .then((values) => {
        const loginFlow = values[0].status === 'fulfilled' ? values[0]?.value : undefined
        const registerFlow = values[1].status === 'rejected' ? values[1]?.reason?.data : undefined
        if (loginFlow === undefined || registerFlow === undefined) throw new Error()

        if (searchingHs !== servername) return
        onChange({ baseUrl, login: loginFlow, register: registerFlow })
        setProcess({ isLoading: false })
      })
      .catch(() => {
        if (searchingHs !== servername) return
        onChange(null)
        setProcess({ isLoading: false, error: 'Unable to connect. Please check your input.' })
      })
  }

  useEffect(() => {
    onChange(null)
    if (hs === null || hs?.selected.trim() === '') return
    searchingHs = hs.selected
    setupHsConfig(hs.selected)
  }, [hs])

  useEffect(async () => {
    const link = window.location.origin
    const configFileUrl = `${link}${link[link.length - 1] === '/' ? '' : '/'}config.json`
    try {
      const result = await (await fetch(configFileUrl, { method: 'GET' })).json()
      const selectedHs = result?.defaultHomeserver
      const defaultHomeServer = MatrixHomeServer
      if (!defaultHomeServer) {
        console.error('没有配置matrix-home-server')
        return
      }
      const hsList = Array.isArray(result?.homeserverList) ? [defaultHomeServer, ...result?.homeserverList] : [defaultHomeServer]
      const allowCustom = result?.allowCustomHomeservers ?? true
      if (!hsList?.length > 0 || selectedHs < 0 || selectedHs >= hsList?.length) {
        throw new Error()
      }
      setHs({ selected: hsList[selectedHs], list: hsList, allowCustom })
    } catch {
      setHs({ selected: 'matrix.org', list: ['matrix.org'], allowCustom: true })
    }
  }, [])

  const handleHsInput = (e) => {
    const { value } = e.target
    setProcess({ isLoading: false })
    debounce._(async () => {
      setHs({ ...hs, selected: value.trim() })
    }, 700)()
  }

  return (
    <>
      <div className="homeserver-form">
        <AuthInput name="homeserver" onChange={handleHsInput} value={hs?.selected} forwardRef={hsRef} label="Home server" disabled={hs === null || !hs.allowCustom} />
        {hs?.list.length >= 2 ? (
          <ContextMenu
            placement="right"
            content={(hideMenu) => (
              <>
                <MenuHeader>Home server list</MenuHeader>
                {hs?.list.map((hsName) => (
                  <MenuItem
                    key={hsName}
                    onClick={() => {
                      hideMenu()
                      hsRef.current.value = hsName
                      setHs({ ...hs, selected: hsName })
                    }}
                  >
                    {hsName}
                  </MenuItem>
                ))}
              </>
            )}
            render={(toggleMenu) => <IconButton onClick={toggleMenu} src={ChevronBottomIC} />}
          />
        ) : null}
      </div>
      {process.error !== undefined && (
        <Text className="homeserver-form__error" variant="b3">
          {process.error}
        </Text>
      )}
      {process.isLoading && (
        <div className="homeserver-form__status flex--center">
          <Spinner size="small" />
          <Text variant="b2">{process.message}</Text>
        </div>
      )}
    </>
  )
}
HomeServer.propTypes = {
  onChange: PropTypes.func.isRequired,
}

const Login = observer(({ loginFlow, baseUrl }) => {
  const typeIndex = 0
  const isPassword = loginFlow?.filter((flow) => flow.type === 'm.login.password')[0]
  const ssoProviders = loginFlow?.filter((flow) => flow.type === 'm.login.sso')[0]
  const [isSubmitting, setSubmitting] = useState(false)
  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
      email: '',
      other: '',
    },
  })
  const onInvalid = (errors, event) => {
    console.log('onInvalid', errors, event)
  }
  const onValid = async (values) => {
    let userBaseUrl = baseUrl
    let { username } = values
    const mxIdMatch = username.match(/^@(.+):(.+\..+)$/)
    if (typeIndex === 0 && mxIdMatch) {
      ;[, username, userBaseUrl] = mxIdMatch
      userBaseUrl = await getBaseUrl(userBaseUrl)
    }

    return auth
      .login(userBaseUrl, typeIndex === 0 ? normalizeUsername(username) : undefined, typeIndex === 1 ? values.email : undefined, values.password)
      .then(() => {
        setSubmitting(true)
        window.location.reload()
      })
      .catch((error) => {
        let msg = error?.data?.error || error.message
        if (msg === 'Unknown message') msg = 'Please check your credentials'
        if (msg === 'Invalid password') {
          setError('password', { type: 'manual', message: msg })
        } else {
          setError('password', { type: 'manual', message: msg })
        }
        setSubmitting(false)
      })
  }

  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 0 0 20px',
          height: '331px',
        }}
      >
        <Box
          sx={{
            width: '154px',
            height: '40px',
            marginBottom: '98px',
            marginRight: '18px',
          }}
          component="img"
          src={authImageMap.authLogin}
        />
        <Box
          sx={{
            width: '195px',
            height: '187px',
            marginBottom: '37px',
          }}
          component="img"
          src={authImageMap.authAiboLogo}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          padding: '0 20px',
          flexDirection: 'column',
        }}
      >
        {isPassword && (
          <Box
            component="form"
            onSubmit={handleSubmit(onValid, onInvalid)}
            sx={{
              width: '100%',
            }}
          >
            {isSubmitting && <LoadingScreen message="Login in progress..." />}
            <Box
              sx={{
                width: '100%',
                marginBottom: '16px',
              }}
            >
              {typeIndex === 0 && (
                <Controller
                  control={control}
                  name="username"
                  rules={{
                    required: 'Username is required',
                  }}
                  render={({ field }) => (
                    <AuthInput
                      icon={
                        <AuthInputUserIcon
                          style={{
                            width: '24px',
                            height: '24px',
                            marginRight: '9px',
                          }}
                        />
                      }
                      value={field.value}
                      name="username"
                      onChange={(event) => {
                        field.onChange(event.target.value)
                      }}
                      placeholder="Username"
                    />
                  )}
                />
              )}
              {errors?.username?.message && (
                <Text className="auth-form__error" variant="b3">
                  {errors.username.message}
                </Text>
              )}
              {typeIndex === 1 && (
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    validate: (value) => {
                      if (typeIndex === 1 && value.length > 0 && !isValidInput(value, EMAIL_REGEX)) {
                        return BAD_EMAIL_ERROR
                      }
                    },
                  }}
                  render={({ field }) => (
                    <AuthInput
                      icon={
                        <AuthInputUserIcon
                          style={{
                            width: '24px',
                            height: '24px',
                            marginRight: '9px',
                          }}
                        />
                      }
                      value={field.value}
                      name="email"
                      onChange={(event) => {
                        field.onChange(event.target.value)
                      }}
                      placeholder="Email"
                    />
                  )}
                />
              )}
              {errors?.email?.message && (
                <Text className="auth-form__error" variant="b3">
                  {errors.email.message}
                </Text>
              )}
            </Box>
            <Box
              sx={{
                width: '100%',
                marginBottom: '32px',
              }}
            >
              <Controller
                control={control}
                rules={{
                  required: 'Password is required',
                }}
                name="password"
                render={({ field }) => (
                  <AuthInput
                    icon={
                      <AuthInputPasswordIcon
                        style={{
                          width: '24px',
                          height: '24px',
                          marginRight: '9px',
                        }}
                      />
                    }
                    value={field.value}
                    name="password"
                    onChange={(event) => {
                      field.onChange(event.target.value)
                    }}
                    type="password"
                    placeholder="Password"
                  />
                )}
              />
              {errors?.password?.message && (
                <Text className="auth-form__error" variant="b3">
                  {errors.password.message}
                </Text>
              )}
            </Box>
            {errors?.other?.message && (
              <Text className="auth-form__error" variant="b3">
                {errors.other.message}
              </Text>
            )}
            <MUIButton
              sx={{
                width: '100%',
                height: '50px',
                backgroundColor: '#25B1FF',
                borderRadius: '8px',
              }}
              type="submit"
              variant="surface"
              disabled={isSubmitting}
            >
              Login
            </MUIButton>
          </Box>
        )}
        <Box
          sx={{
            width: '100%',
            marginTop: '86px',
          }}
        >
          {ssoProviders && isPassword && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <AuthSSOOrLineLeft />
              <Box
                sx={{
                  margin: '0 8px',
                }}
              >
                Or
              </Box>
              <AuthSSOOrLineRight />
            </Box>
          )}
          {ssoProviders && <SSOButtons type="sso" identityProviders={ssoProviders.identity_providers} baseUrl={baseUrl} />}
        </Box>
      </Box>
    </Box>
  )
})
Login.propTypes = {
  loginFlow: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  baseUrl: PropTypes.string.isRequired,
}

let sid
let clientSecret
function Register({ registerInfo, loginFlow, baseUrl }) {
  const [process, setProcess] = useState({})
  const [passVisible, setPassVisible] = useState(false)
  const [cPassVisible, setCPassVisible] = useState(false)
  const formRef = useRef()
  const [isSubmitting, setSubmitting] = useState(false)

  const ssoProviders = loginFlow?.filter((flow) => flow.type === 'm.login.sso')[0]
  const isDisabled = registerInfo.errcode !== undefined
  const { flows, params, session } = registerInfo

  let isEmail = false
  let isEmailRequired = true
  let isRecaptcha = false
  let isTerms = false
  let isDummy = false

  flows?.forEach((flow) => {
    if (isEmailRequired && flow.stages.indexOf('m.login.email.identity') === -1) isEmailRequired = false
    if (!isEmail) isEmail = flow.stages.indexOf('m.login.email.identity') > -1
    if (!isRecaptcha) isRecaptcha = flow.stages.indexOf('m.login.recaptcha') > -1
    if (!isTerms) isTerms = flow.stages.indexOf('m.login.terms') > -1
    if (!isDummy) isDummy = flow.stages.indexOf('m.login.dummy') > -1
  })
  const {
    handleSubmit,
    control,
    trigger,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      other: '',
    },
  })
  const { username: formUsername, password: formPassword, email: formEmail } = useWatch({ control })

  const getInputs = () => [formUsername, formPassword, formEmail]
  const onInvalid = (errors, event) => {
    console.log('onInvalid', errors, event)
  }
  const onValid = (values) => {
    const tempClient = auth.createTemporaryClient(baseUrl)
    clientSecret = tempClient.generateClientSecret()
    return tempClient
      .isUsernameAvailable(values.username)
      .then(async (isAvail) => {
        if (!isAvail) {
          setError('username', { type: 'manual', message: 'Username is already taken' })
          setSubmitting(false)
          return
        }
        if (isEmail && values.email.length > 0) {
          const result = await auth.verifyEmail(baseUrl, values.email, clientSecret, 1)
          if (result.errcode) {
            if (result.errcode === 'M_THREEPID_IN_USE') {
              setError('email', { type: 'manual', message: result.error })
            } else {
              setError('confirmPassword', { type: 'manual', message: result.error || result.message })
            }
            setSubmitting(false)
            return
          }
          sid = result.sid
        }
        setProcess({ type: 'processing', message: 'Registration in progress....' })
        setSubmitting(false)
      })
      .catch((err) => {
        const finalError = err?.data ? err.data : err
        const msg = finalError.error || finalError.message
        if (['M_USER_IN_USE', 'M_INVALID_USERNAME', 'M_EXCLUSIVE'].indexOf(finalError.errcode) > -1) {
          setError('username', { type: 'manual', message: finalError.errcode === 'M_USER_IN_USE' ? 'Username is already taken' : msg })
        } else if (msg) {
          setError('confirmPassword', { type: 'manual', message: msg })
        }
        setSubmitting(false)
      })
  }

  const refreshWindow = () => window.location.reload()

  useEffect(() => {
    if (process.type !== 'processing') return
    const asyncProcess = async () => {
      const [username, password, email] = getInputs()
      const d = await auth.completeRegisterStage(baseUrl, username, password, { session })

      if (isRecaptcha && !d.completed.includes('m.login.recaptcha')) {
        const sitekey = params['m.login.recaptcha'].public_key
        setProcess({ type: 'm.login.recaptcha', sitekey })
        return
      }
      if (isTerms && !d.completed.includes('m.login.terms')) {
        const pp = params['m.login.terms'].policies.privacy_policy
        const url = pp?.en.url || pp[Object.keys(pp)[0]].url
        setProcess({ type: 'm.login.terms', url })
        return
      }
      if (isEmail && email.length > 0) {
        setProcess({ type: 'm.login.email.identity', email })
        return
      }
      if (isDummy) {
        const data = await auth.completeRegisterStage(baseUrl, username, password, {
          type: 'm.login.dummy',
          session,
        })
        if (data.done) refreshWindow()
      }
    }
    asyncProcess()
  }, [process])

  const handleRecaptcha = async (value) => {
    if (typeof value !== 'string') return
    const [username, password] = getInputs()
    const d = await auth.completeRegisterStage(baseUrl, username, password, {
      type: 'm.login.recaptcha',
      response: value,
      session,
    })
    if (d.done) refreshWindow()
    else setProcess({ type: 'processing', message: 'Registration in progress...' })
  }
  const handleTerms = async () => {
    const [username, password] = getInputs()
    const d = await auth.completeRegisterStage(baseUrl, username, password, {
      type: 'm.login.terms',
      session,
    })
    if (d.done) refreshWindow()
    else setProcess({ type: 'processing', message: 'Registration in progress...' })
  }
  const handleEmailVerify = async () => {
    const [username, password] = getInputs()
    const d = await auth.completeRegisterStage(baseUrl, username, password, {
      type: 'm.login.email.identity',
      threepidCreds: { sid, client_secret: clientSecret },
      threepid_creds: { sid, client_secret: clientSecret },
      session,
    })
    if (d.done) refreshWindow()
    else setProcess({ type: 'processing', message: 'Registration in progress...' })
  }

  return (
    <Box
      sx={{
        width: '100%',
        padding: '0 20px',
      }}
    >
      {process.type === 'processing' && <LoadingScreen message={process.message} />}
      {process.type === 'm.login.recaptcha' && <Recaptcha message="Please check the box below to proceed." sitekey={process.sitekey} onChange={handleRecaptcha} />}
      {process.type === 'm.login.terms' && <Terms url={process.url} onSubmit={handleTerms} />}
      {process.type === 'm.login.email.identity' && <EmailVerify email={process.email} onContinue={handleEmailVerify} />}
      {isDisabled && <Text className="auth-form__error">{registerInfo.error}</Text>}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          height: '331px',
          padding: '0 20px',
        }}
      >
        <Box
          sx={{
            width: '230px',
            height: '40px',
            marginBottom: '98px',
          }}
          component="img"
          src={authImageMap.authRegistry}
        />
      </Box>
      {!isDisabled && (
        <Box component="form" onSubmit={handleSubmit(onValid, onInvalid)}>
          {process.type === undefined && isSubmitting && <LoadingScreen message="Registration in progress..." />}
          {isEmail && (
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                validate: (value) => {
                  if (value.length > 0 && !isValidInput(value, EMAIL_REGEX)) {
                    return BAD_EMAIL_ERROR
                  }
                },
              }}
              render={({ field }) => (
                <Box
                  sx={{
                    width: '100%',
                    marginBottom: '16px',
                  }}
                >
                  <AuthInput
                    value={field.email}
                    name="email"
                    onChange={(event) => {
                      field.onChange(event.target.value)
                    }}
                    placeholder={`Email${isEmailRequired ? '' : ' (optional)'}`}
                  />
                  {errors?.email?.message && (
                    <Text className="auth-form__error" variant="b3">
                      {errors.email.message}
                    </Text>
                  )}
                </Box>
              )}
            />
          )}
          <Controller
            control={control}
            name="username"
            rules={{
              required: 'Username is required',
              validate: (value) => {
                if (value.length > 255) {
                  return USER_ID_TOO_LONG_ERROR
                }
                if (value.length > 0 && !isValidInput(value, LOCALPART_SIGNUP_REGEX)) {
                  return BAD_LOCALPART_ERROR
                }
              },
            }}
            render={({ field }) => (
              <Box
                sx={{
                  width: '100%',
                  marginBottom: '16px',
                }}
              >
                <AuthInput
                  icon={
                    <AuthInputUserIcon
                      style={{
                        width: '24px',
                        height: '24px',
                        marginRight: '9px',
                      }}
                    />
                  }
                  value={field.value}
                  name="username"
                  onChange={(event) => {
                    field.onChange(event.target.value)
                  }}
                  placeholder="Username"
                />
                {errors?.username?.message && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.username.message}
                  </Text>
                )}
              </Box>
            )}
          />
          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              validate: (value) => {
                if (value.length > 0 && !isValidInput(value, PASSWORD_STRENGHT_REGEX)) {
                  return BAD_PASSWORD_ERROR
                }
              },
            }}
            render={({ field }) => (
              <Box
                sx={{
                  width: '100%',
                  marginBottom: '16px',
                }}
              >
                <AuthInput
                  icon={
                    <AuthInputPasswordIcon
                      style={{
                        width: '24px',
                        height: '24px',
                        marginRight: '9px',
                      }}
                    />
                  }
                  value={field.value}
                  name="password"
                  onChange={(event) => {
                    field.onChange(event.target.value)
                  }}
                  type="password"
                  placeholder="Password"
                />
                {errors?.password?.message && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.password.message}
                  </Text>
                )}
              </Box>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Confirm password is required',
              validate: (value, formValues) => {
                if (value.length > 0 && !isValidInput(value, formValues.password)) {
                  return CONFIRM_PASSWORD_ERROR
                }
              },
            }}
            render={({ field }) => (
              <Box
                sx={{
                  width: '100%',
                  marginBottom: '32px',
                }}
              >
                <AuthInput
                  icon={
                    <AuthInputPasswordIcon
                      style={{
                        width: '24px',
                        height: '24px',
                        marginRight: '9px',
                      }}
                    />
                  }
                  value={field.value}
                  name="confirmPassword"
                  type="password"
                  onChange={(event) => {
                    field.onChange(event.target.value)
                  }}
                  placeholder="Confirm password"
                />
                {errors?.confirmPassword?.message && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </Box>
            )}
          />
          {errors?.other?.message && (
            <Text className="auth-form__error" variant="b3">
              {errors?.other?.message}
            </Text>
          )}
          <MUIButton
            sx={{
              width: '100%',
              height: '50px',
              backgroundColor: '#25B1FF',
              borderRadius: '8px',
            }}
            type="submit"
            variant="surface"
            disabled={isSubmitting}
          >
            Register
          </MUIButton>
        </Box>
      )}
      {isDisabled && ssoProviders && <SSOButtons type="sso" identityProviders={ssoProviders.identity_providers} baseUrl={baseUrl} />}
    </Box>
  )
}
Register.propTypes = {
  registerInfo: PropTypes.shape({}).isRequired,
  loginFlow: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  baseUrl: PropTypes.string.isRequired,
}

function AuthCard({ type, setType, hsConfig }) {
  return (
    <>
      {hsConfig !== null &&
        (type === 'login' ? (
          <Login loginFlow={hsConfig.login.flows} baseUrl={hsConfig.baseUrl} />
        ) : (
          <Register registerInfo={hsConfig.register} loginFlow={hsConfig.login.flows} baseUrl={hsConfig.baseUrl} />
        ))}
      {hsConfig !== null && (
        <Text variant="b2" className="auth-card__switch flex--center">
          {`${type === 'login' ? "Don't have" : 'Already have'} an account?`}
          <button type="button" style={{ color: 'var(--tc-link)', cursor: 'pointer', margin: '0 var(--sp-ultra-tight)' }} onClick={() => setType(type === 'login' ? 'register' : 'login')}>
            {type === 'login' ? ' Register' : ' Login'}
          </button>
        </Text>
      )}
    </>
  )
}

function Auth() {
  const [step, setStep] = useState(0)
  const [loginToken, setLoginToken] = useState(getUrlPrams('loginToken'))
  const [type, setType] = useState('login')
  const [hs, setHs] = useState(null)
  const [hsConfig, setHsConfig] = useState(null)
  const [process, setProcess] = useState({ isLoading: true, message: 'Loading homeserver list...' })
  const welcomeRef = useRef(null)
  const logoRef = useRef(null)
  const animationRef = useRef(null)
  useIsomorphicLayoutEffect(() => {
    if (!animationRef.current) {
      if (!logoRef.current) return
      animationRef.current = lottie.loadAnimation({
        container: logoRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: AiboJSON,
      })
    } else {
      animationRef.current.show()
    }
  }, [])

  const init = async () => {
    if (localStorage.getItem(cons.secretKey.BASE_URL) === undefined) {
      setLoginToken(null)
      return
    }
    const baseUrl = localStorage.getItem(cons.secretKey.BASE_URL)
    try {
      await auth.loginWithToken(baseUrl, loginToken)

      const { href } = window.location
      window.location.replace(href.slice(0, href.indexOf('?')))
    } catch {
      setLoginToken(null)
      const link = window.location.origin
      const configFileUrl = `${link}${link[link.length - 1] === '/' ? '' : '/'}config.json`
      try {
        const result = await (await fetch(configFileUrl, { method: 'GET' })).json()
        const selectedHs = result?.defaultHomeserver
        const defaultHomeServer = MatrixHomeServer
        if (!defaultHomeServer) {
          console.error('没有配置matrix-home-server')
          return
        }
        const hsList = Array.isArray(result?.homeserverList) ? [defaultHomeServer, ...result?.homeserverList] : [defaultHomeServer]
        const allowCustom = result?.allowCustomHomeservers ?? true
        if (!hsList?.length > 0 || selectedHs < 0 || selectedHs >= hsList?.length) {
          throw new Error()
        }
        setHs({ selected: hsList[selectedHs], list: hsList, allowCustom })
      } catch {
        setHs({ selected: 'matrix.org', list: ['matrix.org'], allowCustom: true })
      }
    }
  }
  useEffect(() => {
    init()
  }, [])
  const handleHsChange = (info) => {
    setHsConfig(info)
  }

  const setupHsConfig = async (servername) => {
    setProcess({ isLoading: true, message: 'Looking for homeserver...' })
    let baseUrl = null
    baseUrl = await getBaseUrl(servername)

    if (searchingHs !== servername) return
    setProcess({ isLoading: true, message: `Connecting to ${baseUrl}...` })
    const tempClient = auth.createTemporaryClient(baseUrl)

    Promise.allSettled([tempClient.loginFlows(), tempClient.register()])
      .then((values) => {
        const loginFlow = values[0].status === 'fulfilled' ? values[0]?.value : undefined
        const registerFlow = values[1].status === 'rejected' ? values[1]?.reason?.data : undefined
        if (loginFlow === undefined || registerFlow === undefined) throw new Error()

        if (searchingHs !== servername) return
        handleHsChange({ baseUrl, login: loginFlow, register: registerFlow })
        setProcess({ isLoading: false })
      })
      .catch(() => {
        if (searchingHs !== servername) return
        handleHsChange(null)
        setProcess({ isLoading: false, error: 'Unable to connect. Please check your input.' })
      })
  }

  useEffect(() => {
    handleHsChange(null)
    if (hs === null || hs?.selected.trim() === '') return
    searchingHs = hs.selected
    setupHsConfig(hs.selected)
  }, [hs])
  const stepForward = (type) => {
    setType(type)
    gsap.to(welcomeRef.current, {
      x: '-100%',
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        setStep(1)
      },
    })
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
      }}
    >
      {step === 0 ? (
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            backgroundColor: '#FAFAFA',
          }}
          ref={welcomeRef}
        >
          <Box
            sx={{
              width: '100%',
              height: '427px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '98vw',
              }}
              ref={logoRef}
            />
          </Box>
          <Box
            sx={{
              width: '100%',
              padding: '0 20px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '160px',
              }}
              component="img"
              src={authImageMap.welcomeText}
            />
            <Box
              sx={{
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '24px',
                color: '#78828C',
                marginTop: '16px',
              }}
            >
              Create a free AIbo account and Claim your AIBO token rewards.
            </Box>
            <ButtonBase
              sx={{
                width: '100%',
                height: '67px',
                marginTop: '24px',
              }}
              onClick={() => {
                stepForward('login')
              }}
            >
              <Box
                component="img"
                src={authImageMap.letUsStartButton}
                sx={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </ButtonBase>
            <Box
              sx={{
                fontSize: '14px',
                color: '#23282D',
                fontWeight: 400,
                lineHeight: '20px',
                marginTop: '16px',
              }}
            >
              Don't have an account?
              <Box
                component="span"
                sx={{
                  color: '#25BEFF',
                  marginLeft: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  stepForward('register')
                }}
              >
                Register
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}
      <ScrollView invisible>
        <div className="auth__base">
          <div className="auth__wrapper">
            {/* eslint-disable-next-line no-use-before-define */}
            {loginToken && <LoadingScreen message="Redirecting..." />}
            {!loginToken && (
              <div className="auth-card">
                <div className="auth-card__content">
                  <AuthCard type={type} setType={setType} hsConfig={hsConfig} />
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollView>
    </Box>
  )
}

function LoadingScreen({ message }) {
  return (
    <ProcessWrapper>
      <Spinner />
      <div style={{ marginTop: 'var(--sp-normal)' }}>
        <Text variant="b1">{message}</Text>
      </div>
    </ProcessWrapper>
  )
}
LoadingScreen.propTypes = {
  message: PropTypes.string.isRequired,
}

function Recaptcha({ message, sitekey, onChange }) {
  return (
    <ProcessWrapper>
      <div style={{ marginBottom: 'var(--sp-normal)' }}>
        <Text variant="s1" weight="medium">
          {message}
        </Text>
      </div>
      <ReCAPTCHA sitekey={sitekey} onChange={onChange} />
    </ProcessWrapper>
  )
}
Recaptcha.propTypes = {
  message: PropTypes.string.isRequired,
  sitekey: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

function Terms({ url, onSubmit }) {
  return (
    <ProcessWrapper>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <div style={{ margin: 'var(--sp-normal)', maxWidth: '450px' }}>
          <Text variant="h2" weight="medium">
            Agree with terms
          </Text>
          <div style={{ marginBottom: 'var(--sp-normal)' }} />
          <Text variant="b1">In order to complete registration, you need to agree to the terms and conditions.</Text>
          <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--sp-normal) 0' }}>
            <input style={{ marginRight: '8px' }} id="termsCheckbox" type="checkbox" required />
            <Text variant="b1">
              {'I accept '}
              <a style={{ cursor: 'pointer' }} href={url} rel="noreferrer" target="_blank">
                Terms and Conditions
              </a>
            </Text>
          </div>
          <Button id="termsBtn" type="submit" variant="primary">
            Submit
          </Button>
        </div>
      </form>
    </ProcessWrapper>
  )
}
Terms.propTypes = {
  url: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

function EmailVerify({ email, onContinue }) {
  return (
    <ProcessWrapper>
      <div style={{ margin: 'var(--sp-normal)', maxWidth: '450px' }}>
        <Text variant="h2" weight="medium">
          Verify email
        </Text>
        <div style={{ margin: 'var(--sp-normal) 0' }}>
          <Text variant="b1">
            {'Please check your email '}
            <b>{`(${email})`}</b>
            {' and validate before continuing further.'}
          </Text>
        </div>
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </ProcessWrapper>
  )
}
EmailVerify.propTypes = {
  email: PropTypes.string.isRequired,
}

function ProcessWrapper({ children }) {
  return <div className="process-wrapper">{children}</div>
}
ProcessWrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Auth
