import React, { useState, useEffect, useCallback } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import AlertModal from '../components/AlertModal';

function IdleSessionAlert({
  isOpen,
  sessionExpiration,
  onLogout,
  onContinue,
  i18n,
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const updateRemaining = useCallback(() => {
    const now = new Date();
    const remaining = Math.round(
      (sessionExpiration.getTime() - now.getTime()) / 1000
    );
    if (remaining <= 0) {
      onLogout();
    }
    setSecondsRemaining(remaining);
  }, [sessionExpiration, onLogout]);

  useEffect(() => {
    updateRemaining();
    let interval;
    if (isOpen) {
      interval = setInterval(updateRemaining, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [updateRemaining, isOpen]);

  // TODO: translate timeout message
  return (
    <AlertModal
      isOpen={isOpen}
      variant="warning"
      title={i18n._(t`Idle session`)}
      onClose={onLogout}
      actions={[
        <Button key="confirm" variant="primary" onClick={onContinue}>
          Continue
        </Button>,
      ]}
    >
      Your session will expire in {secondsRemaining} seconds. Would you like to
      continue?
    </AlertModal>
  );
}

export default withI18n()(IdleSessionAlert);
