import type { NextPage } from 'next'
import Link from 'next/link';
import Seo from '../components/commons/Seo'

const Home: NextPage = () => {
  return (
    <div>
      <Seo title={'Hello Chato ;)'}></Seo>
      <div className='greetings'>
        <h1>Hello Chato ;)</h1>
        <Link href="/chat/list">
          <button>start chatting &rarr;</button>
        </Link>
      </div>
      <style>{`
        .greetings {
          margin-top: 220px;
          text-align: center;
        }
        .greetings > h1 {
          font-size: 82px;
        }
        .greetings > button {
          width: 190px;
          height: 80px;
          font-size: 20px;
          background-color: rgb(0, 219, 146);
          color: white;
        }
        .greetings > button:hover {
          background-color: transparent;
          color: rgb(0, 219, 146);
          border: 1px solid rgb(0, 219, 146);
        }
      `}</style>
    </div>
  )
}

export default Home;