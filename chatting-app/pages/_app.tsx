import '../styles/globals.css'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Layout from '../components/Layout';
import PropTypes from "prop-types";
import wrapper from "../lib/store/configureStore";


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}

MyApp.prototype = {
  Comment: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(MyApp);
