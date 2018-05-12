import React, { PureComponent } from 'react';
import Layout from '@icedesign/layout';
import cx from 'classnames';
import Logo from './Logo';

export default class Footer extends PureComponent {
  render() {
    const { className, style } = this.props;
    return (
      <Layout.Footer
        className={cx('ice-design-layout-footer', className)}
        style={{
          ...style,
          lineHeight: '36px',
        }}
      >
        <div className="ice-design-layout-footer-body">
          <div style={{ filter: 'grayscale(100%)', opacity: 0.3 }}>
            <Logo />
          </div>
          <div className="copyright">
            © 2018 powered & contact by 
            <a
              href="mailto:binghai.li@fixmail.com"
              target="_blank"
              className="copyright-link"
              rel="noopener noreferrer"
            >
            {" "}冰海
            </a>
          </div>
        </div>
      </Layout.Footer>
    );
  }
}
