import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import './SSOButtons.scss'

import { Box, ButtonBase } from '@mui/material'
import { startSsoLogin } from '../../../client/action/auth'

import Button from '../../atoms/button/Button'
import authImageMap from '../../../images/authImageMap'

const IDPImageButtonMap = {
  google: authImageMap.authSsoGoogleButton,
  github: authImageMap.authSsoGithubButton,
  twitter: authImageMap.authSsoTwitterButton,
  facebook: authImageMap.authSsoFacebookButton,
}
function SSOButtons({ type, identityProviders, baseUrl }) {
  const computedIDPs = useMemo(() => {
    if (Array.isArray(identityProviders)) {
      return identityProviders.map((idp) => ({
        ...idp,
        icon: IDPImageButtonMap[idp.brand],
      }))
    }
    return []
  }, [identityProviders])

  function handleClick(id) {
    startSsoLogin(baseUrl, type, id)
  }
  return (
    <div className="sso-buttons">
      {computedIDPs
        .sort((idp, idp2) => {
          if (typeof idp.icon !== 'string') return -1
          return idp.name.toLowerCase() > idp2.name.toLowerCase() ? 1 : -1
        })
        .map((idp, index) =>
          idp.icon ? (
            <ButtonBase key={idp.id} onClick={() => handleClick(idp.id)}>
              <Box
                component="img"
                src={idp.icon}
                sx={{
                  width: '48px',
                  height: '48px',
                  marginRight: index === computedIDPs.length - 1 ? 0 : '32px',
                }}
              />
            </ButtonBase>
          ) : (
            <Button key={idp.id} className="sso-btn__text-only" onClick={() => handleClick(idp.id)}>{`Login with ${idp.name}`}</Button>
          ),
        )}
    </div>
  )
}

SSOButtons.propTypes = {
  identityProviders: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  baseUrl: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['sso', 'cas']).isRequired,
}

export default SSOButtons
