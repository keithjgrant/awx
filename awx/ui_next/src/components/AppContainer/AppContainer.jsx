import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Nav,
  NavList,
  Page,
  PageHeader as PFPageHeader,
  PageSidebar,
} from '@patternfly/react-core';
import { t } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import styled from 'styled-components';

import { SessionContext, Config } from '../../contexts/Config';
import About from '../About';
import BrandLogo from './BrandLogo';
import NavExpandableGroup from './NavExpandableGroup';
import PageHeaderToolbar from './PageHeaderToolbar';

const PageHeader = styled(PFPageHeader)`
  & .pf-c-page__header-brand-link {
    color: inherit;

    &:hover {
      color: inherit;
    }

    & svg {
      height: 76px;
    }
  }
`;

function AppContainer({ i18n, navRouteConfig = [], children }) {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleAboutModalOpen = () => setIsAboutModalOpen(true);
  const handleAboutModalClose = () => setIsAboutModalOpen(false);
  return (
    <SessionContext i18n={i18n}>
      <Config>
        {({ config, handleLogout }) => {
          return (
            <>
              <Page
                isManagedSidebar
                header={
                  <PageHeader
                    showNavToggle
                    logo={<BrandLogo />}
                    logoProps={{ href: '/' }}
                    headerTools={
                      <PageHeaderToolbar
                        loggedInUser={config?.me}
                        isAboutDisabled={!config?.version}
                        onAboutClick={handleAboutModalOpen}
                        onLogoutClick={handleLogout}
                      />
                    }
                  />
                }
                sidebar={
                  <PageSidebar
                    theme="dark"
                    nav={
                      <Nav aria-label={i18n._(t`Navigation`)} theme="dark">
                        <NavList>
                          {navRouteConfig.map(
                            ({ groupId, groupTitle, routes }) => (
                              <NavExpandableGroup
                                key={groupId}
                                groupId={groupId}
                                groupTitle={groupTitle}
                                routes={routes}
                              />
                            )
                          )}
                        </NavList>
                      </Nav>
                    }
                  />
                }
              >
                {children}
              </Page>
              <About
                ansible_version={config?.ansible_version}
                version={config?.version}
                isOpen={isAboutModalOpen}
                onClose={handleAboutModalClose}
              />
            </>
          );
        }}
      </Config>
    </SessionContext>
  );
}

export { AppContainer as _AppContainer };
export default withI18n()(withRouter(AppContainer));
