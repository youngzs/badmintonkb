/**
 * Navbar Content - 添加登录按钮
 */
import React from 'react';
import Content from '@theme-original/Navbar/Content';
import type ContentType from '@theme/Navbar/Content';
import type {WrapperProps} from '@docusaurus/types';
import { LoginButton } from '@/components/LoginButton';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): JSX.Element {
  return (
    <>
      <Content {...props} />
      <div style={{ marginLeft: 'auto', paddingLeft: '1rem' }}>
        <LoginButton />
      </div>
    </>
  );
}
